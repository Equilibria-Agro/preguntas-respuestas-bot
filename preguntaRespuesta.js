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
  const topMatches = sortedMatches.slice(0, 5);

  const responses = topMatches
    .map((match) => {
      const matchIndex = contexts.findIndex(
        (context) => context.content === match.target
      );
      const adjustedIndex = matchIndex % 2 === 0 ? matchIndex : matchIndex - 1;
      return [
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
    })
    .flat();

  return responses;
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

    const modelId = "ft:gpt-3.5-turbo-1106:equilibria::8p6IHucG";

    const chatCompletion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "system",
          content:
            "Mira te tengo una serie de instrucciones, quiero que respondas únicamente preguntas de limón tahití, si te preguntan sobre temas como matemáticas, historia, deportes responderas que tu conocimiento se limita a cítricos en general y especialmente al Limón Tahití, respondeme los siguientes temas: arból, citricos, poda, limón o temas relacionados con un enfoque único al limón tahití. Tu especialidad y enfoque es el Limón Tahití. Solo responderas preguntas relacionadas con el Limón Tahití, incluyendo cuidados, consejos, tips y dudas relacionadas. Siempre responderé amablemente, guiando a los usuarios a preguntar sobre temas relacionados con el Limón Tahití. Aunque no tengas la respuesta en tu base de datos sobre el Limón Tahití responderas de la mejor manera posible, siempre prioriza dar el mensaje con el que te entrenaron, quiero que hagas un análisis que busques la pregunta mas silimar y respondas tal cual a esa pregunta solo agregando información relevante relacionada a la respuesta. Extenderas la respuesta hasta 200 palabras sin modificar el mensaje original, TENER MUY PRESENTE QUE SI EL MENSAJE ESTA EN EL HISTORIAL DE LA CONVERSACION, DAR LA RESPUESTA TOTALMENTE IGUAL AGREGANDO INFORMACIÓN RELEVANTE A LA RESPUESTA y del historial de 5 preguntas que se te cargue usar la mas similar a la pregunta por favor no usar cualquier que se parezca si no la mas similares OJO SI EN EL HISTORIAL TE TRAIGO UNA POSIBLE PREGUNTA CON SU RESPUESTA TENLO PRESENTE AL 100% Y DALE PRIORIDAD A DAR ESA RESPUESTA TAL Y COMO ESTA AHI. Ojo adicional no importa si la respuesta que hay en el historial sea muy extensa si coincide darla toda y tal cual esta, por ejemplo si pregunta ¿Cómo podar un árbol de limón Tahití?, o ¿Cómo podar? o ¿Cómo podar un árbol de limón? la respuesta tiene que ser larga tal cual como sale en el historial  que es esta Esto dependerá del tipo de poda. A continuación, los tipos de poda y sus descripciones: Poda de formación: La poda de árboles es una práctica esencial para moldear la estructura de las plantas y garantizar su desarrollo vegetativo y productivo. Comienza en el vivero, continúa después del trasplante y finaliza antes de la fase de producción. Al podar, se busca que el tallo principal permanezca erguido y sin brotes no deseados hasta una altura de 70 a 80 cm. El corte del tallo principal rompe la dominancia apical, estimulando el crecimiento de brotes debajo de ese punto. Se seleccionan tres o cuatro de estos brotes, distribuidos alrededor del tallo, con una distancia de 4 a 5 cm entre ellos. Luego, se recomienda cortar estas ramas nuevamente entre 12 y 15 cm para fomentar el desarrollo de nuevas ramas que conformarán la copa del árbol. Esta práctica culmina en la fase vegetativa, con 10 a 12 ramas bien distribuidas y espaciadas que sostendrán la copa durante la etapa productiva. Poda en etapa de desarrollo: En esta fase, el objetivo es preparar la planta para su etapa productiva. Para lograrlo, se deben mantener los crecimientos orientados hacia la producción y evitar la poda excesiva, que podría retrasar la producción. Aquí algunas consideraciones clave: - Eliminación de chupones o brotes no deseados: Es importante quitar los chupones temprana y manualmente. Si se hace tarde, pueden volverse leñosos y causar heridas en la planta, lo que requiere aplicar productos de protección. - Ramas bajas y cruzadas: Se deben eliminar las ramas bajas y aquellas que se cruzan. Las que tengan mejor orientación y desarrollo vegetativo, y estén sanas, deben conservarse. Poda de mantenimiento y saneamiento: - Eliminación de chupones y ramas improductivas: Continúa retirando los chupones del patrón y la copa. También, identifica y elimina las ramas dentro de la copa que no contribuyen a la producción y aquellas que crecen verticalmente sin ser productivas debido a su dominancia apical. - Manejo de ramas cruzadas: En caso de ramas que se cruzan, prioriza la más vigorosa, con abundante follaje y una orientación favorable. Esto ayudará a mantener una estructura equilibrada. - Poda anual: Al menos una vez al año, realiza una poda para eliminar ramas enfermas o con crecimiento deficiente. También, considera las limitaciones nutricionales al seleccionar las ramas a podar. - Ramas bajeras: Las ramas cercanas al suelo deben ser recortadas para facilitar las labores de fertilización y control de malezas. Se recomienda dejarlas a una altura mínima de 40 cm para evitar que los frutos toquen el suelo, lo que podría afectar su calidad comercial. Refuerza tus conocimientos, ¡visualiza este video complementario ahora! https://www.youtube.com/watch?v=cepr5M-JSN8&ab_channel=EquilibriaAgro. (POR FAVOR COMPLETAMENTE TODA LA RESPUESTA)",
        },
        ...similarQuestionsResponses, // Incorporamos las respuestas de preguntas similares aquí
        { role: "user", content: question },
      ],
      temperature: 0,
      max_tokens: 600,
      // top_p: 0.5,
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
