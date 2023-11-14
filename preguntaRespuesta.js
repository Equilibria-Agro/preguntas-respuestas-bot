const express = require('express');// Express para encender el servidor en un puerto
const natural = require('natural');// IA
const { MongoClient } = require('mongodb');//base de dato
const bodyParser = require('body-parser');// para organizar la respuesta y darla

const app = express();

app.use(bodyParser.json());

// Conectar a la base de datos MongoDB
const uri = 'mongodb+srv://chatbotequilibriaagro:123456789s@cluster0.bh0426f.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function connectToDB() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');
  } catch (err) {
    console.error('Error de conexión:', err);
  }
}

// Ajustamos la función accentFold para evitar problemas con la normalización Unicode
const accentFold = (text) => {
  return text
    .normalize('NFD')  // Normalizamos caracteres Unicode para eliminar diacríticos
    .replace(/[\u0300-\u036f]/g, '')  // Reemplazamos diacríticos
    .replace(/[.,\/#!$%\^&\*;:{}=\_`~()?¿¡'"@|<>\[\]]/g, '')  // Quitamos caracteres especiales
    .toLowerCase();
};

// POST
app.post('/buscarRespuesta', async (req, res) => {
  const pregunta = req.body.pregunta; // Obtenemos la pregunta desde el cuerpo de la solicitud

  const db = client.db('nombre_de_tu_db');
  const collection = db.collection('preguntas_respuestas');

  const preguntas = await collection.find({}).toArray();


  //IA
  for (const item of preguntas) {
    const tokenizer = new natural.WordTokenizer(); // Tokenizamos aquí
    const preguntaTokenizada = tokenizer.tokenize(accentFold(pregunta)); // Aplicamos tokenización y normalización
    const textoTokenizado = tokenizer.tokenize(accentFold(item.texto)); // Aplicamos tokenización y normalización

    const todasLasPalabrasPresentes = preguntaTokenizada
      .every((word) => textoTokenizado.includes(word)); // Comparamos las palabras
//IA

    if (todasLasPalabrasPresentes) {
      return res.json({ respuesta: item.respuesta }); // si si cumplio todo, va a poner la respuesta correcta o aproximada
    }
  }

  return res.json({ respuesta: 'Lo siento, no tengo una respuesta para esa pregunta.' });
});

// Realiza la conexión a la base de datos
connectToDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
