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
        {
          "role": "user",
          "content": "Pregunta: ¿Cómo se prepara el suelo para plantar Limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Respuesta: La preparación del suelo es esencial para un cultivo exitoso de Limón Tahití. Se deben evaluar las características físicas y químicas del suelo, asegurando un buen drenaje para evitar enfermedades de raíz y manteniendo un pH óptimo entre 5.5 y 6.5. En terrenos planos, se utilizan máquinas para preparar el suelo, mientras que en zonas inclinadas, se trazan curvas de nivel. La distancia de siembra, comúnmente de 6x6 o 7x6 metros en Colombia, depende del patrón y la copa de la planta. Es crucial garantizar un sistema de riego adecuado y considerar las necesidades de drenaje y fertilidad del suelo. Se recomienda realizar análisis de suelo antes de la plantación para ajustar los niveles de nutrientes y realizar enmiendas según sea necesario. La labranza profunda y la incorporación de materia orgánica mejoran la estructura del suelo y su capacidad de retención de agua, facilitando así el desarrollo de las raíces y asegurando una buena aireación."
        },
        {
          "role": "user",
          "content": "Pregunta: ¿Cuándo y cómo se trasplantan las plantas de Limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Respuesta: El trasplante de Limón Tahití es un paso delicado. Idealmente, se realiza durante las épocas de inicio de las lluvias o cuando se dispone de un sistema de riego. Los hoyos para el trasplante deben medir aproximadamente 40x40x40 cm. Al trasplantar, asegúrate de que el cuello de la raíz quede ligeramente por encima del nivel del suelo. Es beneficioso aplicar una mezcla de materia orgánica bien compostada y un fertilizante balanceado en el momento del trasplante para promover un buen establecimiento."
        },
        {
          "role": "user",
          "content": "Pregunta: ¿Cuál es la importancia de la fertilización en el cultivo de Limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Respuesta: La fertilización es fundamental para el cultivo de Limón Tahití. Necesitas diseñar un plan de fertilización que tenga en cuenta las necesidades específicas del cultivo, la disponibilidad de nutrientes en el suelo y el estado de desarrollo de las plantas. Esto incluye aplicar la cantidad correcta de nutrientes en el momento oportuno y elegir la fuente adecuada. La fertilización eficiente mejora la productividad y la calidad del fruto, y contribuye a la salud general de las plantas."
        },
        {
          "role": "user",
          "content": "Pregunta: ¿Cómo se determinan las necesidades de nutrientes para el Limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Respuesta: Para determinar las necesidades nutricionales del Limón Tahití, es esencial conocer los requerimientos del cultivo y realizar análisis de suelo, tejidos y agua. Esto te ayudará a entender cuántos nutrientes están disponibles en el suelo y cuántos necesita añadir. Las pruebas de suelo son una herramienta técnica clave para la planificación y ajuste de la fertilización. Con base en estos análisis, podrás calcular la cantidad exacta de nutrientes necesarios para tu cultivo."
        },
      
        { role: 'user', content: question },
     
      ],
      temperature: 0.1, 
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