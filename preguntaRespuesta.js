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
  const linksList = [
    {
      question: " ¿Cómo se siembra un árbol de limón Tahití?", // Este campo puede ser opcional dependiendo de cómo quieras hacer la coincidencia
      answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
      link: "https://www.ejemplo-link.com"
    },
    // Más entradas según sea necesario
  ];

  
  if (typeof userQuestion !== "string" || userQuestion.trim().length === 0) {
    throw new Error("La pregunta es requerida y debe ser un texto válido.");
  }

  const questions = contexts.map((context) => context.content);
  const matches = stringSimilarity.findBestMatch(
    userQuestion,
    questions
  ).ratings;
  const sortedMatches = matches.sort((a, b) => b.rating - a.rating);
  const bestMatch = sortedMatches[0];

  const matchIndex = contexts.findIndex(
    (context) => context.content === bestMatch.target
  );
  const adjustedIndex = matchIndex % 2 === 0 ? matchIndex : matchIndex - 1;
  
  // Construimos la respuesta basada en la coincidencia
  let response = [
    {
      role: "user",
      content: contexts[adjustedIndex] ? contexts[adjustedIndex].content : "Pregunta no disponible",
    },
    {
      role: "assistant",
      content: adjustedIndex + 1 < contexts.length && contexts[adjustedIndex + 1]
                ? contexts[adjustedIndex + 1].content : "Respuesta no disponible",
    },
  ];

  // Variable para almacenar el enlace, si es que hay coincidencia
  let matchedLink = "";

  // Verificamos si la respuesta coincide con alguna en la lista adicional para obtener el enlace
  const linkMatch = linksList.find(item => item.answer === response[1].content);
  if (linkMatch) {
    matchedLink = linkMatch.link; // Almacenamos el enlace encontrado
  }

  // Agrega la lógica aquí para hacer uso de `matchedLink` según necesites

  // Retorna la respuesta y el enlace (puede que esté vacío si no hubo coincidencias)
  return { response: response.flat(), link: matchedLink };
}

app.post("/get-response", async (req, res) => {
  try {
    const question = req.body.question;
    if (typeof question !== "string" || question.trim().length === 0) {
      return res
        .status(400)
        .send("La pregunta es requerida y debe ser un texto válido.");
    }

    // Obtenemos las preguntas similares y el enlace, si existe alguno
    const {response: similarQuestionsResponses, link: matchedLink} = await findSimilarQuestions(question);

    const modelId = "gpt-3.5-turbo-1106";

    // Preparamos los mensajes para la solicitud de completación, sin incluir el enlace como mensaje
    const messagesForChatCompletion = [
      {
        role: "system",
        content: "En este chat, va a haber una conversación precargada, la idea es que siempre des la misma respuesta y exactamente esa..."
      },
      ...similarQuestionsResponses,
      { role: "user", content: question },
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: modelId,
      messages: messagesForChatCompletion,
    });

    // Enviamos la respuesta final, incluyendo el enlace solo en el objeto JSON de respuesta al cliente
    res.json({ response: chatCompletion.choices[0].message.content, link: matchedLink }); // El enlace puede ser nulo si no se encontró coincidencia
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
