const express = require('express');//Express para encender el servidor en un puerto
const natural = require('natural');// IA
const { MongoClient } = require('mongodb');//base de dato
const bodyParser = require('body-parser');// para organizar la respuesta y darla

const app = express();

app.use(bodyParser.json());

// Conectar a la base de datos MongoDB
const uri = 'mongodb+srv://admin:QhER5MpHQ949Wkuu@cluster0.r0f8zqx.mongodb.net/?retryWrites=true&w=majority';
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

// ...

// POST
app.post('/buscarRespuesta', async (req, res) => {
  const pregunta = req.body.pregunta; // Obtenemos la pregunta desde el cuerpo de la solicitud

  const db = client.db('ChatBotPR');
  const collection = db.collection('preguntas_respuestas');

  const preguntas = await collection.find({}).toArray();

  //IA
  for (const item of preguntas) {
    const tokenizer = new natural.WordTokenizer(); // Tokenizamos aquí
    const preguntaTokenizada = tokenizer.tokenize(accentFold(pregunta)); // Aplicamos tokenización y normalización
    const textoTokenizado = tokenizer.tokenize(accentFold(item.texto)); // Aplicamos tokenización y normalización

    // Validación de palabras mal escritas
    const palabrasCorregidas = preguntaTokenizada.map((word) => {
      // Ajusta esta distancia según sea necesario (debe estar entre 0 y 1)
      const distanciaMinima = 1; // Puedes ajustar este valor según tus necesidades
      const palabrasSimilares = textoTokenizado.filter(
        (textoWord) => natural.JaroWinklerDistance(word, textoWord) >= distanciaMinima
      );
      return palabrasSimilares.length > 0 ? palabrasSimilares[0] : word;
    });

    const todasLasPalabrasPresentes = palabrasCorregidas.every((word) => textoTokenizado.includes(word));

    // Verificar si más del 50% de las palabras fueron cambiadas
    const porcentajeSimilitud = 1 - (palabrasCorregidas.filter((word, index) => word === preguntaTokenizada[index]).length / preguntaTokenizada.length);

    // Validación adicional
    if (todasLasPalabrasPresentes && porcentajeSimilitud < 0.5) {
      return res.json({ respuesta: item.respuesta }); // si sí cumplió todo, va a poner la respuesta correcta o aproximada
    }
  }

  return res.json({ respuesta: 'Lo siento, no entiendo la pregunta. ¿Puedes reformularla?' });
});

// ...

// ...

// POST para preguntas al asesor
app.post('/preguntasAsesor', async (req, res) => {
  const pregunta = req.body.pregunta; // Obtén la pregunta desde el cuerpo de la solicitud

  const db = client.db('ChatBotPR');
  const collection = db.collection('respuestas_generales'); // Cambia al nombre de tu tabla para respuestas generales

  const respuestasGenerales = await collection.find({}).toArray();

  // IA
  for (const item of respuestasGenerales) {
    const tokenizer = new natural.WordTokenizer(); // Tokenizamos aquí
    const preguntaTokenizada = tokenizer.tokenize(accentFold(pregunta)); // Aplicamos tokenización y normalización
    const textoTokenizado = tokenizer.tokenize(accentFold(item.texto)); // Aplicamos tokenización y normalización

    // Validación de palabras mal escritas
    const palabrasCorregidas = preguntaTokenizada.map((word) => {
      // Ajusta esta distancia según sea necesario (debe estar entre 0 y 1)
      const distanciaMinima = 0.5; // Puedes ajustar este valor según tus necesidades
      const palabrasSimilares = textoTokenizado.filter(
        (textoWord) => natural.JaroWinklerDistance(word, textoWord) >= distanciaMinima
      );
      return palabrasSimilares.length > 0 ? palabrasSimilares[0] : word;
    });

    const algunasPalabrasSimilares = palabrasCorregidas.filter((word, index) => word !== preguntaTokenizada[index]).length > 0;

    // Validación adicional
    if (algunasPalabrasSimilares) {
      return res.json({ respuesta: item.respuesta, asesor: true }); // si sí cumplió todo, va a poner la respuesta correcta o aproximada
    }
  }

  // Respuesta para preguntas fuera del margen
  return res.json({ respuesta: 'Gracias por tu pregunta. Sin embargo, no estoy seguro de entender completamente. ¿Puedes proporcionar más detalles o reformular tu pregunta?', asesor: false });
});




// Realiza la conexión a la base de datos
connectToDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
