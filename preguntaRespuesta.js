// Importar las dependencias
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const helmet = require('helmet');

// Cargar el contexto previo desde `contexts.js`
const contextosPrevios = require('./contexts');

const app = express();
app.use(bodyParser.json({ limit: '10kb' }));
app.use(helmet());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Función para buscar contextos relevantes basado en palabras clave en la pregunta del usuario
function buscarContextosRelevantes(pregunta, contextos) {
  const palabrasClave = pregunta.toLowerCase().split(' '); // Simplificación para el ejemplo
  return contextos.filter(contexto => palabrasClave.some(palabra => contexto.content.toLowerCase().includes(palabra)));
}

app.post('/get-response', async (req, res) => {
  try {
    const modelId = "gpt-3.5-turbo";
    const question = req.body.question;

    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).send('La pregunta es requerida y debe ser un texto válido.');
    }

    // Buscar contextos relevantes basado en la pregunta
    const contextosRelevantes = buscarContextosRelevantes(question, contextosPrevios);

    const mensajes = [
      {
        "role": "system",
        "content": "Tu serie de instrucciones personalizadas aquí."
      },
      ...contextosRelevantes, // Incorpora solo los contextos relevantes seleccionados
      { role: 'user', content: question },
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: modelId,
      messages: mensajes,
      temperature: 0,
      max_tokens: 200,
      top_p: 0.9,
    });

    res.json({ response: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error interno del servidor.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
