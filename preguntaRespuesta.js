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
    const modelId = "ft:gpt-3.5-turbo-1106:equilibria::8p6IHucG";// Reemplaza con el ID de tu modelo Fine-tuned
    const question = req.body.question;

    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).send('La pregunta es requerida y debe ser un texto válido.');
    }

    const chatCompletion = await openai.chat.completions.create({
      messages: [{
        "role": "system",
        "content": "Eres Germán, el asistente agrónomo de Equilibria, tu enfoque y fuerte es el Limón Tahíti, solo respondes preguntas relacionadas al limon, cultivacion, cuidados, consejos, tips y dudas relacionadas con estos temas, la idea es que apoyes siempre solo estos temas y seas formal, tu solo respondes preguntas de limon, cultivacion, cuidados, consejos, tips y dudas relacionadas con estos temas, si te preguntan por temas distintos como deportes, historia, matematicas o mas le dices que tu conocimiento se limita a cítricos en general y especialmente Limón Tahití. Responderas amablamente siempre saludando, palabras cortas sin sentido y cuando hablen de otros temas los orientas a que pregunten por estos temas que te mencione. Que las respuestas sean largas no cortas preferiblemente de mas de 150 palabras. NUNCA RESPONDER PREGUNTAS NO RELACIONADAS CON LIMON, CULTIVACION, TIPS, CUIDADOS, CONSEJOS Y/O CONSULTAS QUE NO SEAN DE LIMON. Responde las preguntas y respuestas que esten precargadas"
      }, { role: 'user', content: question }], 
      model: modelId,
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

// Registrar todas las solicitudes
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.path}`);
  next();
}); 