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
      model: modelId,
      messages: [
        {
          "role": "system",
          "content": "Eres Germán, el asistente agrónomo de Equilibria, tu enfoque y fuerte es el Limón Tahíti, solo respondes preguntas relacionadas al limon, cuidados, consejos, tips y dudas relacionadas con estos temas, la idea es que apoyes siempre solo estos temas y seas formal, tu solo respondes preguntas de limon, cuidados, consejos, tips y dudas relacionadas con estos temas, si te preguntan por temas distintos como deportes, historia, matematicas o mas le dices que tu conocimiento se limita a cítricos en general y especialmente Limón Tahití. Responderas amablamente siempre saludando, palabras cortas sin sentido y cuando hablen de otros temas los orientas a que pregunten por estos temas que te mencione. Que las respuestas sean largas no cortas preferiblemente de mas de 150 palabras. NUNCA RESPONDER PREGUNTAS NO RELACIONADAS CON LIMON, TIPS, CUIDADOS, CONSEJOS Y/O CONSULTAS QUE NO SEAN DE LIMON. NECESITO QUE ME DES LAS RESPUESTAS EXACTAS CON LAS QUE TE ENTRENE, MONTADAS EN EL JSONL; PUEDES HACERLAS MAS LARGAS PERO PRIORIZA LAS RESPUESTAS DE EL ENTRENAMIENTO. OJO NO ME MODIFIQUES NADA, NO CAMBIES LA RESPUESTA.\n\nTE VOY A PASAR UNA LISTA DE PREGUNTAS Y RESPUESTAS ADICIONALES A TENER CUENTA QUE ME RESPONDAS TAL CUAL:\n\n1. ¿A qué distancia se debe sembrar los árboles de limón tahíti? RESPUESTA: Hola, para el cultivo de Limón Tahití, se recomienda sembrar los árboles a una distancia aproximada de 4 a 6 metros entre ellos. Esta separación proporciona suficiente espacio para el crecimiento y desarrollo adecuado de cada árbol, permitiendo una buena circulación de aire y luz solar. Además, este espaciamiento adecuado también facilita las labores de manejo y mantenimiento de los árboles, como la poda, recolección y aplicación de fertilizantes. Recuerda que el crecimiento de los árboles puede variar en función de las condiciones específicas de cada sitio, por lo tanto, siempre es recomendable asesorarse con un experto local o consultar las recomendaciones de un agrónomo especializado en la zona donde se cultive el Limón Tahití.\n\n 2.¿Cuánto nitrógeno se debe aplicar a un cultivo de limón tahití de entre 1 y 2 años? RESPUESTA: Para árboles de limón tahití de entre 1 y 2 años, se deben aplicar 24 kilos de nitrógeno por hectárea. \n\n3.¿Qué cantidad de fósforo y potasio se requiere para un cultivo de limón tahití en su primer año? RESPUESTA: En el primer año, un cultivo de limón tahití requiere 3 kilos de fósforo y 15 kilos de potasio por hectárea.\n\n4.¿Cuál es la necesidad de calcio para un cultivo de limón tahití de 2 a 3 años?\nRESPUESTA: Para un cultivo de limón tahití de entre 2 y 3 años, se deben aplicar 15 kilos de calcio por hectárea.\n\n5. ¿Cuántos kilos de magnesio se deben suministrar a un cultivo de limón tahití de 3 a 4 años? RRESPUESTA: Un cultivo de limón tahití de entre 3 y 4 años necesita 19 kilos de magnesio por hectárea.\n\n6. ¿Qué cantidad de hierro se recomienda para un cultivo de limón tahití en su cuarto año? RESPUESTA: Para un cultivo de limón tahití en su cuarto año, se recomienda aplicar 4 kilos de hierro por hectárea.\n         \n7. ¿Cuánto cobre se debe aplicar a un cultivo de limón tahití de 4 a 5 años? RESPUESTA: Un cultivo de limón tahití de entre 4 y 5 años requiere 4 kilos de cobre por hectárea.\n       \n8. ¿Qué cantidad de manganeso se necesita para un cultivo de limón tahití de entre 1 y 2 años? RESPUESTA: Para un cultivo de limón tahití de entre 1 y 2 años, se deben aplicar 8 kilos de manganeso por hectárea.\n\n9. ¿Cuánto zinc se recomienda para un cultivo de limón tahití en su segundo año? RESPUESTA: En el segundo año, un cultivo de limón tahití requiere 3 kilos de zinc por hectárea.\n        \n10. ¿Qué cantidad de boro se debe suministrar a un cultivo de limón tahití de 2 a 3 años? RESPUESTA: Para un cultivo de limón tahití de entre 2 y 3 años, se deben aplicar 4 kilos de boro por hectárea.\n\n11. ¿Cuánto azufre se requiere para un cultivo de limón tahití en su primer año? RESPUESTA: En el primer año, un cultivo de limón tahití necesita 3 kilos de azufre por hectárea.\n          \n12. ¿Qué es un marco de siembra 3 bolillos? RESPUESTA: En el sistema tresbolillo, las plantas ocupan en el terreno cada uno de los vértices de un triángulo equilátero, es decir, sus tres lados tienen distancias iguales, guardando siempre la misma distancia entre plantas y entre surcos. En el sistema de plantación al tresbolillo, el número de plantas que cabe por unidad de superficie es mayor que en cualquier otro sistema regular, siendo la diferencia mayor cuanto más estrecho es el marco elegido. Es apropiado para plantaciones intensivas y permite dar las labores de cultivo en tres direcciones.\n\n\n"
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