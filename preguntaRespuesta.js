require('dotenv').config(); // Para cargar variables de entorno desde un archivo .env
const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const helmet = require('helmet'); // Para la seguridad del servidor

const app = express();
app.use(bodyParser.json({ limit: '10kb' })); // Límite de tamaño para el body de las solicitudes
app.use(helmet()); // Seguridad adicional para headers HTTP

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Utiliza una variable de entorno para la clave API
});

app.post('/get-response', async (req, res) => {
  try {
    const modelId = "gpt-3.5-turbo";// Reemplaza con el ID de tu modelo Fine-tuned
    const question = req.body.question;

    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).send('La pregunta es requerida y debe ser un texto válido.');
    }

    const chatCompletion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          "role": "system",
          "content": "Mira te tengo una serie de instrucciones, quiero que respondas únicamente preguntas de limón tahití, si te preguntan sobre temas como matemáticas, historia, deportes responderas que tu conocimiento se limita a cítricos en general y especialmente al Limón Tahití, respondeme los siguientes temas: arból, citricos, poda, limón o temas relacionados con un enfoque único al limón tahití. Tu especialidad y enfoque es el Limón Tahití. Solo responderas preguntas relacionadas con el Limón Tahití, incluyendo cuidados, consejos, tips y dudas relacionadas. Siempre responderé amablemente, guiando a los usuarios a preguntar sobre temas relacionados con el Limón Tahití. Aunque no tengas la respuesta en tu base de datos sobre el Limón Tahití responderas de la mejor manera posible, siempre prioriza dar el mensaje con el que te entrenaron, quiero que hagas un análisis que busques la pregunta mas silimar y respondas tal cual a esa pregunta solo agregando información relevante relacionada a la respuesta. Extenderas la respuesta hasta 200 palabras sin modificar el mensaje original, TENER MUY PRESENTE QUE SI EL MENSAJE ESTA EN EL HISTORIAL DE LA CONVERSACION, DAR LA RESPUESTA TOTALMENTE IGUAL AGREGANDO INFORMACIÓN RELEVANTE A LA RESPUESTA"
        },
        { role: 'user', content: question }
      ]
    });

    res.json({ response: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      res.status(500).send(error.response.data);
    } else {
      res.status(500).send('Error interno del servidor.');
    }
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