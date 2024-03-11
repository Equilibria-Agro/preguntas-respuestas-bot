require("dotenv").config(); // Para cargar variables de entorno desde un archivo .env
const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const helmet = require("helmet"); // Para la seguridad del servidor
const stringSimilarity = require("string-similarity");
const contexts = require("./contexts"); // Asegúrate de tener este archivo y ruta correctos

const app = express();
app.use(bodyParser.json({ limit: "10kb" })); // Límite de tamaño para el body de las solicitudes
app.use(helmet()); // Seguridad adicional para headers HTTP

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Utiliza una variable de entorno para la clave API
});

// Extraemos la lógica de find-similar-question a una función reutilizable
async function findSimilarQuestions(userQuestion) {
  if (typeof userQuestion !== "string" || userQuestion.trim().length === 0) {
    throw new Error("La pregunta es requerida y debe ser un texto válido.");
  }

  const questions = contexts.map((context) => context.content);
  const matches = stringSimilarity.findBestMatch(
    userQuestion,
    questions
  ).ratings;
  const sortedMatches = matches.sort((a, b) => b.rating - a.rating);
  // Tomamos solo la coincidencia superior en lugar de las cinco primeras
  const bestMatch = sortedMatches[0];

  const matchIndex = contexts.findIndex(
    (context) => context.content === bestMatch.target
  );
  const adjustedIndex = matchIndex % 2 === 0 ? matchIndex : matchIndex - 1;
  const response = [
    {
      role: "user",
      content: contexts[adjustedIndex]
        ? contexts[adjustedIndex].content
        : "Pregunta no disponible",
    },
    {
      role: "assistant",
      content:
        adjustedIndex + 1 < contexts.length && contexts[adjustedIndex + 1]
          ? contexts[adjustedIndex + 1].content
          : "Respuesta no disponible",
    },
  ];

  // Retorna solo el par de pregunta-respuesta más relevante
  return response.flat();
}

app.post("/find-and-store-link", async (req, res) => {
  const contexts = [
    { content: " ¿Cómo se siembra un árbol de limón Tahití?", answer: "  Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!", link: "https://ejemplo.com/reset-password" },

  ]; // Asegúrate de que el array 'contexts' está bien definido aquí
  try {
    const { question, answer } = req.body;
    if (typeof question !== 'string' || question.trim().length === 0 || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).send("La pregunta y la respuesta son requeridas y deben ser textos válidos.");
    }

    // Realiza la comparación utilizando 'trim()' para evitar problemas con espacios extra
    const match = contexts.find(context =>
      context.content.trim() === question.trim() && 
      context.answer.trim() === answer.trim()
    );

    if (match) {
      res.json({ success: true, link: match.link });
    } else {
      res.status(404).json({ success: false, message: "No se encontró una coincidencia para la pregunta y respuesta proporcionadas." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error interno del servidor.");
  }
});



app.post("/get-response", async (req, res) => {
  const contexts = [
    { content: " ¿Cómo se siembra un árbol de limón Tahití?", answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!", link: "https://ejemplo.com/reset-password" },

  ];
  try {
    const question = req.body.question;
    if (typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).send("La pregunta es requerida y debe ser un texto válido.");
    }

    // Primero, obtenemos las preguntas similares
    const similarQuestionsResponses = await findSimilarQuestions(question);

    console.log("Historial de preguntas similares:", similarQuestionsResponses); // Historial que se trajo

    let linkToAdd = ''; // Variable para almacenar el enlace si es encontrado
    for (let response of similarQuestionsResponses) {
      if (response.role === "user") continue; // Saltar mensajes de usuario
      const match = contexts.find(context => context.content.trim() === response.content.trim());
      if (match) {
        linkToAdd = match.link; // Asigna el enlace encontrado
        console.log("Enlace encontrado:", linkToAdd); // Log del enlace encontrado
        break; // Sale del bucle ya que encontramos un enlace
      }
    }

    const modelId = "gpt-3.5-turbo-1106";

    const chatCompletion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "system",
          content: "En este chat, va a haber una conversación precargada, la idea es que siempre des la misma respuesta y exactamente esa. Necesito que respondas tal cual la respuesta que tienes ya precargada, no omitas NINGUNA palabra, haz un análisis, busca la respuesta de la pregunta que te hagan y dame esa respuesta tal cual a como está precargada, así la pregunta sea diferente busca la mas similar y da la respuesta tal cual a como esta precargada. Este es un asistente especializado en el Limón y arboles. Deberá responder preguntas relacionadas exclusivamente con el cuidado, cultivo, y características del Limón Tahití. Siempre mantenga un tono amable y enfocado en proporcionar la mejor información posible sobre el Limón Tahití. Cuando pregunten por temas que no tengan que ver con lo mencionado o preguntas que no traigan un historial, responde amablemente y pidele que vuelva y consulte con un tema de limon por ejemplo"
        },
        ...similarQuestionsResponses,
        { role: "user", content: question },
      ],
    });

    console.log("Mensajes enviados a OpenAI:", chatCompletion.model, chatCompletion.messages); // Log de lo que se envió al final

    // Construye la respuesta final, añadiendo el enlace si está disponible
    let finalResponse = chatCompletion.choices[0].message.content;
    if (linkToAdd) {
      finalResponse += `\nPara más información, visita este enlace: ${linkToAdd}`;
    }

    res.json({ response: finalResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error interno del servidor.");
  }
});


app.post("/find-similar-question", async (req, res) => {
  try {
    const userQuestion = req.body.question;
    const responses = await findSimilarQuestions(userQuestion);
    res.json(responses);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.path}`);
  next();
});
