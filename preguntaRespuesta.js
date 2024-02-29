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
          "role": "user",
          "content": "Pregunta: ¿Cómo se prepara el suelo para plantar Limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Respuesta: La preparación del suelo es esencial para un cultivo exitoso de Limón Tahití. Se deben evaluar las características físicas y químicas del suelo, asegurando un buen drenaje para evitar enfermedades de raíz y manteniendo un pH óptimo entre 5.5 y 6.5. En terrenos planos, se utilizan máquinas para preparar el suelo, mientras que en zonas inclinadas, se trazan curvas de nivel. La distancia de siembra, comúnmente de 6x6 o 7x6 metros en Colombia, depende del patrón y la copa de la planta. Es crucial garantizar un sistema de riego adecuado y considerar las necesidades de drenaje y fertilidad del suelo. Se recomienda realizar análisis de suelo antes de la plantación para ajustar los niveles de nutrientes y realizar enmiendas según sea necesario. La labranza profunda y la incorporación de materia orgánica mejoran la estructura del suelo y su capacidad de retención de agua, facilitando así el desarrollo de las raíces y asegurando una buena aireación."
        },
    
      
        { role: 'user', content: question },
     
      ],
      temperature: 0, 
      max_tokens: 200,
      top_p: 0.9,
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




