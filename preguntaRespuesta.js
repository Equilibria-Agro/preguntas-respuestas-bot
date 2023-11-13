const express = require('express');
const natural = require('natural');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

// Conectar a la base de datos MongoDB
const uri = 'mongodb+srv://chatbotequilibriaagro:123456789s@cluster0.bh0426f.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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

// Función para buscar respuestas en la base de datos MongoDB
app.post('/buscarRespuesta', async (req, res) => {
  const pregunta = req.body.pregunta;

  const db = client.db('nombre_de_tu_db');
  const collection = db.collection('preguntas_respuestas');

  const tokenizer = new natural.WordTokenizer();
  const preguntaTokenizada = accentFold(pregunta);

  const preguntas = await collection.find({}).toArray();

  for (const item of preguntas) {
    const textoTokenizado = accentFold(item.texto);
    const todasLasPalabrasPresentes = preguntaTokenizada
      .split(' ')
      .every((word) => textoTokenizado.split(' ').includes(word));

    if (todasLasPalabrasPresentes) {
      return res.json({ respuesta: item.respuesta });
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