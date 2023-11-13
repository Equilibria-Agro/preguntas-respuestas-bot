const express = require('express');
const natural = require('natural');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

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

const accentFold = (text) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\_`~()?¿¡'"@|<>\[\]]/g, '')
    .toLowerCase();
};

app.post('/buscarRespuesta', async (req, res) => {
  const pregunta = req.body.pregunta;

  const db = client.db('nombre_de_tu_db');
  const collection = db.collection('preguntas_respuestas');

  const preguntas = await collection.find({}).toArray();

  const preguntaTokenizada = accentFold(pregunta).split(' ');

  for (const item of preguntas) {
    const textoTokenizado = accentFold(item.texto).split(' ');

    const intersection = new Set([...preguntaTokenizada].filter(word => textoTokenizado.includes(word)));
    const union = new Set([...preguntaTokenizada, ...textoTokenizado]);

    const jaccardIndex = intersection.size / union.size;

    if (jaccardIndex > 0.5) {
      return res.json({ respuesta: item.respuesta });
    }
  }

  return res.json({ respuesta: 'Lo siento, no tengo una respuesta para esa pregunta.' });
});

connectToDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
