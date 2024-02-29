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

app.post('/get-response', async (req, res) => {
  try {
    const modelId = "gpt-3.5-turbo";
    const question = req.body.question;

    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).send('La pregunta es requerida y debe ser un texto válido.');
    }

    // Aquí podrías implementar lógica para seleccionar un subconjunto relevante de `contextosPrevios`
    // Por simplicidad, este ejemplo asume que utilizas todos los contextos, pero deberías ajustarlo según tus necesidades
    const mensajes = [
      {
        "role": "system",
        "content": "Mira te tengo una serie de instrucciones, quiero que respondas únicamente preguntas de limón tahití, si te preguntan sobre temas como matemáticas, historia, deportes responderas que tu conocimiento se limita a cítricos en general y especialmente al Limón Tahití, respondeme los siguientes temas: arból, citricos, poda, limón o temas relacionados con un enfoque único al limón tahití. Tu especialidad y enfoque es el Limón Tahití. Solo responderas preguntas relacionadas con el Limón Tahití, incluyendo cuidados, consejos, tips y dudas relacionadas. Siempre responderé amablemente, guiando a los usuarios a preguntar sobre temas relacionados con el Limón Tahití. Aunque no tengas la respuesta en tu base de datos sobre el Limón Tahití responderas de la mejor manera posible, siempre prioriza dar el mensaje con el que te entrenaron, quiero que hagas un análisis que busques la pregunta mas silimar y respondas tal cual a esa pregunta solo agregando información relevante relacionada a la respuesta. Extenderas la respuesta hasta 200 palabras sin modificar el mensaje original, TENER MUY PRESENTE QUE SI EL MENSAJE ESTA EN EL HISTORIAL DE LA CONVERSACION, DAR LA RESPUESTA TOTALMENTE IGUAL AGREGANDO INFORMACIÓN RELEVANTE A LA RESPUESTA. En este chat en los Messages hay varios ejemplos de USER (PREGUNTA) Y ASSISTANT(RESPUESTA), HAZLOS AL PIE DE LA LETRA Y CON RESPUESTAS IGUALES A PREGUNTAS IGUALES O DEL MISMO TEMA"
      },
      ...contextosPrevios, // Incorpora el contexto previo
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




