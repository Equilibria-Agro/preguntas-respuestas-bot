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
    { content: "¿Cuándo y cómo se trasplantan las plantas de Limón Tahití?", answer: " El trasplante de Limón Tahití es un paso delicado. Idealmente, se realiza durante las épocas de inicio de las lluvias o cuando se dispone de un sistema de riego. Los hoyos para el trasplante deben medir aproximadamente 40x40x40 cm. Al trasplantar, asegúrate de que el cuello de la raíz quede ligeramente por encima del nivel del suelo. Es beneficioso aplicar una mezcla de materia orgánica bien compostada y un fertilizante balanceado en el momento del trasplante para promover un buen establecimiento", link: "https://ejemplo.com/reset-password" },

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
          content: "En este chat, va a haber una conversación precargada, la idea es que siempre des la misma respuesta y exactamente esa. Necesito que respondas tal cual la respuesta que tienes ya precargada, no mitas NINGUNA palabra, haz un análisis, busca la respuesta de la pregunta que te hagan y dame esa respuesta tal cual a como está precargada, así la pregunta sea diferente busca la mas similar y da la respuesta tal cual a como esta precargada"
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
