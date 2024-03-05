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


app.post("/get-response", async (req, res) => {
  try {
    const question = req.body.question;
    if (typeof question !== "string" || question.trim().length === 0) {
      return res
        .status(400)
        .send("La pregunta es requerida y debe ser un texto válido.");
    }

    // Primero, obtenemos las preguntas similares
    const similarQuestionsResponses = await findSimilarQuestions(question);

    const modelId = "gpt-3.5-turbo-1106";

    const chatCompletion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "system",
          content: "En este chat, va a haber una conversación precargada, la idea es que siempre des la misma respuesta y exactamente esa. Necesito que respondas tal cual la respuesta que tienes ya precargada, no mitas NINGUNA palabra, haz un análisis, busca la respuesta de la pregunta que te hagan y dame esa respuesta tal cual a como está precargada"
        },
        ...similarQuestionsResponses,
        { role: "user", content: question },
      ],
    });
    console.log("Enviando a OpenAI:", JSON.stringify(chatCompletion, null, 2));

    console.log(
      "Enviando a OpenAI:",
      JSON.stringify(similarQuestionsResponses, null, 2)
    );
    res.json({ response: chatCompletion.choices[0].message.content });
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
