// const express = require('express');//Express para encender el servidor en un puerto
// const natural = require('natural');// IA
// const { MongoClient } = require('mongodb');//base de dato
// const bodyParser = require('body-parser');// para organizar la respuesta y darla
// const tf = require('@tensorflow/tfjs');

// const app = express();

// app.use(bodyParser.json());

// // Conectar a la base de datos MongoDB
// const uri = 'mongodb+srv://admin:QhER5MpHQ949Wkuu@cluster0.r0f8zqx.mongodb.net/?retryWrites=true&w=majority';
// const client = new MongoClient(uri);

// async function connectToDB() {
//   try {
//     await client.connect();
//     console.log('Conectado a la base de datos');
//   } catch (err) {
//     console.error('Error de conexión:', err);
//   }
// }

// // Ajustamos la función accentFold para evitar problemas con la normalización Unicode
// const accentFold = (text) => {
//   return text
//     .normalize('NFD')  // Normalizamos caracteres Unicode para eliminar diacríticos
//     .replace(/[\u0300-\u036f]/g, '')  // Reemplazamos diacríticos
//     .replace(/[.,\/#!$%\^&\*;:{}=\_`~()?¿¡'"@|<>\[\]]/g, '')  // Quitamos caracteres especiales
//     .toLowerCase();
// };


// // POST
// app.post('/buscarRespuesta', async (req, res) => {
//   const pregunta = req.body.pregunta; // Obtenemos la pregunta desde el cuerpo de la solicitud

//   const db = client.db('ChatBotPR');
//   const collection = db.collection('preguntas_respuestas');

//   const preguntas = await collection.find({}).toArray();

//   //IA
//   for (const item of preguntas) {
//     const tokenizer = new natural.WordTokenizer(); // Tokenizamos aquí
//     const preguntaTokenizada = tokenizer.tokenize(accentFold(pregunta)); // Aplicamos tokenización y normalización
//     const textoTokenizado = tokenizer.tokenize(accentFold(item.texto)); // Aplicamos tokenización y normalización

//     // Validación de palabras mal escritas
//     const palabrasCorregidas = preguntaTokenizada.map((word) => {
//       // Ajusta esta distancia según sea necesario (debe estar entre 0 y 1)
//       const distanciaMinima = 1; // Puedes ajustar este valor según tus necesidades
//       const palabrasSimilares = textoTokenizado.filter(
//         (textoWord) => natural.JaroWinklerDistance(word, textoWord) >= distanciaMinima
//       );
//       return palabrasSimilares.length > 0 ? palabrasSimilares[0] : word;
//     });

//     const todasLasPalabrasPresentes = palabrasCorregidas.every((word) => textoTokenizado.includes(word));

//     // Verificar si más del 50% de las palabras fueron cambiadas
//     const porcentajeSimilitud = 1 - (palabrasCorregidas.filter((word, index) => word === preguntaTokenizada[index]).length / preguntaTokenizada.length);

//     // Validación adicional
//     if (todasLasPalabrasPresentes && porcentajeSimilitud < 0.5) {
//       return res.json({ respuesta: item.respuesta }); // si sí cumplió todo, va a poner la respuesta correcta o aproximada
//     }
//   }

//   return res.json({ respuesta: 'Lo siento, no entiendo la pregunta. ¿Puedes reformularla?' });
// });


// const stringSimilarity = require('string-similarity');


// // Nuevo método para gestionar respuestas de ChatGPT
// async function obtenerRespuestaChatGPT(pregunta, respuesta) {
//   const db = client.db('ChatBotPR');
//   const collection = db.collection('preguntas_respuestas');

//   const preguntas = await collection.find({}).toArray();

//   // Buscamos respuestas en la base de datos que contengan palabras clave de la pregunta
//   const respuestasPorPregunta = preguntas.filter(item => {
//     const tokenizer = new natural.WordTokenizer(); // Tokenizamos aquí
//     const preguntaTokenizada = tokenizer.tokenize(accentFold(pregunta)); // Aplicamos tokenización y normalización
//     const textoTokenizado = tokenizer.tokenize(accentFold(item.texto)); // Aplicamos tokenización y normalización

//     // Calculamos la similitud de vJaccard entre las palabras de la pregunta proporcionada y la pregunta almacenada
//     const similitudPregunta = stringSimilarity.compareTwoStrings(preguntaTokenizada.join(' '), textoTokenizado.join(' '));

//     // Priorizamos la similitud de la pregunta si es mayor
//     return similitudPregunta > 0.7;
//   });

//   // Si encontramos respuestas por pregunta, devolvemos la primera coincidencia
//   if (respuestasPorPregunta.length > 0) {
//     return {
//       respuesta: respuestasPorPregunta[0].respuesta,
//       pregunta: respuestasPorPregunta[0].texto,
//       encontrado: true
//     };
//   }

//   // Si no encontramos respuestas por pregunta, buscamos respuestas similares en todas las preguntas
//   let respuestaSimilar = null;
//   let preguntaSimilar = null;
//   let similitudMaxima = 0;

//   for (const item of preguntas) {
//     const tokenizer = new natural.WordTokenizer(); // Tokenizamos aquí
//     const respuestaTokenizada = tokenizer.tokenize(accentFold(respuesta)); // Aplicamos tokenización y normalización
//     const textoTokenizado = tokenizer.tokenize(accentFold(item.respuesta)); // Aplicamos tokenización y normalización

//     // Calculamos la similitud de Jaccard entre las palabras de la respuesta proporcionada y la respuesta almacenada
//     const similitudJaccard = stringSimilarity.compareTwoStrings(respuestaTokenizada.join(' '), textoTokenizado.join(' '));

//     // Actualizamos la respuesta similar si la similitud es mayor
//     if (similitudJaccard > similitudMaxima) {
//       similitudMaxima = similitudJaccard;
//       respuestaSimilar = item.respuesta;
//       preguntaSimilar = item.texto;
//     }
//   }

//   // Si encuentra una respuesta similar con suficiente similitud, la devuelve junto con la pregunta correspondiente
//   if (respuestaSimilar && similitudMaxima > 0.5) {
//     const preguntaEncontrada = preguntas.find(item => item.respuesta === respuestaSimilar);
//     return { respuesta: respuestaSimilar, pregunta: preguntaEncontrada.texto, encontrado: false };
//   }

//   // Si no encuentra una respuesta similar, devuelve la respuesta original de ChatGPT
//   return { respuesta, encontrado: false };
// }





// // POST para obtener respuestas de ChatGPT
// app.post('/obtenerRespuestaChatGPT', async (req, res) => {
//   const pregunta = req.body.pregunta; // Obtén la pregunta desde el cuerpo de la solicitud
//   const respuestaChatGPT = req.body.respuesta; // Obtén la respuesta desde el cuerpo de la solicitud

//   try {
//     // Llamada al nuevo método para procesar la respuesta de ChatGPT
//     const resultado = await obtenerRespuestaChatGPT(pregunta, respuestaChatGPT);

//     if (resultado.encontrado) {
//       // Si se encuentra una respuesta en la base de datos, la enviamos al cliente
//       return res.json({ respuesta: resultado.respuesta });
//     } else {
//       // Si no se encuentra una respuesta en la base de datos, devolvemos la respuesta original de ChatGPT
//       // o la respuesta similar encontrada junto con la pregunta correspondiente
//       return res.json({ respuesta: resultado.respuesta, preguntaSimilar: resultado.pregunta });
//     }
//   } catch (error) {
//     console.error('Error al procesar respuesta de ChatGPT:', error);
//     return res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });




// // POST para preguntas al asesor
// app.post('/preguntasAsesor', async (req, res) => {
//   const pregunta = req.body.pregunta; // Obtén la pregunta desde el cuerpo de la solicitud

//   const db = client.db('ChatBotPR');
//   const collection = db.collection('respuestas_generales'); // Cambia al nombre de tu tabla para respuestas generales

//   const respuestasGenerales = await collection.find({}).toArray();

//   // IA
//   for (const item of respuestasGenerales) {
//     const tokenizer = new natural.WordTokenizer(); // Tokenizamos aquí
//     const preguntaTokenizada = tokenizer.tokenize(accentFold(pregunta)); // Aplicamos tokenización y normalización
//     const textoTokenizado = tokenizer.tokenize(accentFold(item.texto)); // Aplicamos tokenización y normalización

//     // Validación de palabras mal escritas
//     const palabrasCorregidas = preguntaTokenizada.map((word) => {
//       // Ajusta esta distancia según sea necesario (debe estar entre 0 y 1)
//       const distanciaMinima = 0.5; // Puedes ajustar este valor según tus necesidades
//       const palabrasSimilares = textoTokenizado.filter(
//         (textoWord) => natural.JaroWinklerDistance(word, textoWord) >= distanciaMinima
//       );
//       return palabrasSimilares.length > 0 ? palabrasSimilares[0] : word;
//     });

//     const algunasPalabrasSimilares = palabrasCorregidas.filter((word, index) => word !== preguntaTokenizada[index]).length > 0;

//     // Validación adicional
//     if (algunasPalabrasSimilares) {
//       return res.json({ respuesta: item.respuesta, asesor: true }); // si sí cumplió todo, va a poner la respuesta correcta o aproximada
//     }
//   }

//   // Respuesta para preguntas fuera del margen
//   return res.json({ respuesta: 'Gracias por tu pregunta. Sin embargo, no estoy seguro de entender completamente. ¿Puedes proporcionar más detalles o reformular tu pregunta?', asesor: false });
// });




// // Realiza la conexión a la base de datos
// connectToDB();

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en el puerto ${PORT}`);
// });

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
    const modelId = "ft:gpt-3.5-turbo-1106:equilibria::8hP5EpN2"; // Reemplaza con el ID de tu modelo Fine-tuned
    const question = req.body.question;

    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).send('La pregunta es requerida y debe ser un texto válido.');
    }

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: question }],
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
