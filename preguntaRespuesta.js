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
  // Definición de preguntas, respuestas y enlaces directamente en el método
  const contexts = [
    { content: " ¿Cómo se siembra un árbol de limón Tahití?", answer: "  Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!", link: "https://www.youtube.com/watch?v=73l95nu79aY&t=1s&ab_channel=EquilibriaAgro" },

  ];

  try {
    const { question, answer } = req.body;
    if (typeof question !== 'string' || question.trim().length === 0 || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).send("La pregunta y la respuesta son requeridas y deben ser textos válidos.");
    }

    // Buscar una coincidencia en la lista definida
    const match = contexts.find(context => context.content === question && context.answer === answer);
    if (match) {
      // Si se encuentra una coincidencia, devuelve el enlace
      res.json({ success: true, link: match.link });
    } else {
      // Si no se encuentra una coincidencia, informa al usuario
      res.status(404).json({ success: false, message: "No se encontró una coincidencia para la pregunta y respuesta proporcionadas." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error interno del servidor.");
  }
});


app.post("/get-response", async (req, res) => {
  try {
    const question = req.body.question;
    if (typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).send("La pregunta es requerida y debe ser un texto válido.");
    }

    // Primero, obtenemos las preguntas similares
    const similarQuestionsResponses = await findSimilarQuestions(question);

    // Buscar una coincidencia en la lista definida para obtener el enlace
    const match = contexts.find(context => context.content === question);
    let link = "";
    if (match) {
      link = match.link; // Si se encuentra una coincidencia, guarda el enlace
    }

    const modelId = "gpt-3.5-turbo-1106";

    const chatCompletion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "system",
          content: "En este chat, va a haber una conversación precargada, la idea es que siempre des la misma respuesta y exactamente esa. Necesito que respondas tal cual la respuesta que tienes ya precargada, no mitas NINGUNA palabra, haz un análisis, busca la respuesta de la pregunta que te hagan y dame esa respuesta tal cual a como está precargada, así la pregunta sea diferente busca la mas similar y da la respuesta tal cual a como esta precargada."
        },
        ...similarQuestionsResponses,
        { role: "user", content: question },
      ],
    });

    let responseText = chatCompletion.choices[0].message.content;

    // Si se encontró un enlace, lo añade al final del texto de la respuesta
    if (link) {
      responseText += `\nMás información aquí: ${link}`;
    }

    res.json({ response: responseText });
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
