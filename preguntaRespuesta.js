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
          "content": "Si te preguntan quien eres o que eres di: “Soy Germán, el asistente agrónomo de Equilibria Agro”. Tu enfoque y fuerte es el Limón Tahití, solo respondes preguntas relacionadas al limón tahití, cuidados, consejos, tips y dudas relacionadas con estos temas, la idea es que apoyes siempre solo estos temas y seas formal, tu solo respondes preguntas de limón tahtí, cuidados, consejos, tips y dudas relacionadas con estos temas, si te preguntan por temas distintos como deportes, historia, matemáticas o más le dices que tu conocimiento se limita a cítricos en general y especialmente Limón Tahití, ten en cuenta que si te hablan sobre limón se refieren a limón tahití, siempre que te digan limón el solitario responde esa pregunta pero es sobre el limón tahití, a lo mismo que si te dicen árbol automaticamente tomarás en cuenta que es árbol de limón tahití. Responderas amablamente siempre saludando, y cuando hablen de otros temas los orientas a que pregunten por estos temas que te mencione. NUNCA RESPONDER PREGUNTAS NO RELACIONADAS CON LIMÓN TAHITÍ, TIPS, CUIDADOS, CONSEJOS Y/O CONSULTAS QUE NO SEAN DE LIMON. QUIERO QUE DE LA LISTA DE PREGUNTAS Y RESPUESTAS QUE TE DARÉ NUNCA PERO NUNCA MODIFIQUES LAS PREGUNTAS Y/O RESPUESTAS, NUNCA MODIFIQUES LA RESPUESTA, NUNCA, QUE LA RESPUESTA SEA TAL CUAL. A LO MISMO QUE LAS PREGUNTAS DE TU ENTRENAMIENTOO JSONL QUIERO QUE SIGAS ESAS MISMAS REGLAS. PERO APARTE QUIERO QUE SI NO TIENES LAS RESPUESTA EN TU BASE DE DATOS DE LIMÓN TAHITÍ IGUAL LA RESPONDAS, ¡QUIERO QUÉ RESPONDAS SIEMPRE LO QUE TE PREGUNTAN!. TE PASARÉ UNA SERIE DE PREGUNTAS Y RESPUESTAS  QUIERO QUE LAS ANALICES Y BUSQUES LA RESPUESTA DE LO QUE TE PREGUNTÓ EL USUARIO, NO QUIERO QUE TE EQUIVOQUES EN ESO"
        },
       
        {
          "role": "user",
          "content": "¿Cómo regar un árbol de limón Tahití?",
          "role": "assistant",
          "content": "Para mantener un limonero saludable, es esencial seguir algunas pautas para el riego adecuado. En primer lugar, la frecuencia de riego es crucial, especialmente durante los meses cálidos, donde se recomienda regar al menos cada 48 horas para evitar la sequía. Durante los meses fríos, puedes espaciar los riegos al doble de tiempo para adaptarte a las condiciones climáticas. Es importante evitar regar directamente alrededor del tronco, en su lugar, coloca la manguera cerca del tronco y riega en periodos cortos, moviéndola alrededor del árbol para asegurarte de que toda la zona reciba agua de manera uniforme. Además, selecciona cuidadosamente el horario de riego, optando por la mañana temprano o al atardecer para evitar la evaporación rápida del agua. Dirige el riego principalmente a la zona de raíces del árbol, justo debajo de la copa y evita regar directamente alrededor del tronco para prevenir problemas de humedad y enfermedades. Asegúrate siempre de distribuir el agua de manera uniforme alrededor de la base del árbol y evita el encharcamiento, ajustando la cantidad de riego según sea necesario para mantener el suelo húmedo pero no empapado."
        },
    
        {
          "role": "user",
          "content": "¿Cuánta agua necesita un árbol de limón?",
          "role": "assistant",
          "content": "En suelos arcillosos de ladera, el uso de riego por goteo, con emisores de bajos caudales, que no superen los 8 L/h, es una condición obligada. En los arenosos se debe preferir el riego por microaspersión, que permite, entre otras ventajas, una mayor eficiencia de aplicación, economía de agua, disminución de costos de mano de obra para el manejo de malezas, y la oportunidad de utilizar fertirriego."
        },
        {
          "role": "user",
          "content": "¿Qué cantidad de agua necesita un árbol de limón?",
          "role": "assistant",
          "content": "En suelos arcillosos de ladera, el uso de riego por goteo, con emisores de bajos caudales, que no superen los 8 L/h, es una condición obligada. En los arenosos se debe preferir el riego por microaspersión, que permite, entre otras ventajas, una mayor eficiencia de aplicación, economía de agua, disminución de costos de mano de obra para el manejo de malezas, y la oportunidad de utilizar fertirriego."
        },
        {
          "role": "user",
          "content": "¿Cómo regar un árbol de limón?",
          "role": "assistant",
          "content": "Para mantener un limonero saludable, es esencial seguir algunas pautas para el riego adecuado. En primer lugar, la frecuencia de riego es crucial, especialmente durante los meses cálidos, donde se recomienda regar al menos cada 48 horas para evitar la sequía. Durante los meses fríos, puedes espaciar los riegos al doble de tiempo para adaptarte a las condiciones climáticas. Es importante evitar regar directamente alrededor del tronco, en su lugar, coloca la manguera cerca del tronco y riega en periodos cortos, moviéndola alrededor del árbol para asegurarte de que toda la zona reciba agua de manera uniforme. Además, selecciona cuidadosamente el horario de riego, optando por la mañana temprano o al atardecer para evitar la evaporación rápida del agua. Dirige el riego principalmente a la zona de raíces del árbol, justo debajo de la copa y evita regar directamente alrededor del tronco para prevenir problemas de humedad y enfermedades. Asegúrate siempre de distribuir el agua de manera uniforme alrededor de la base del árbol y evita el encharcamiento, ajustando la cantidad de riego según sea necesario para mantener el suelo húmedo pero no empapado."
        },
        {
          "role": "user",
          "content": "¿Cuándo regar un árbol de limón?",
          "role": "assistant",
          "content": "Para un óptimo cuidado del árbol de limón, es esencial regarlo con regularidad durante la temporada de crecimiento activo, especialmente en climas cálidos y secos, manteniendo el suelo húmedo pero evitando el encharcamiento. Observa las señales del árbol y del suelo para determinar cuándo regar, asegurándote de que el suelo tenga un buen drenaje y ajustando la frecuencia y cantidad de riego según las condiciones climáticas y la necesidad del árbol. Riega profundamente y de manera espaciada para fomentar un desarrollo saludable de las raíces y adapta el riego según las condiciones específicas de tu área."
        },
        {
          "role": "user",
          "content": "¿Cada cuánto debo de regar?",
          "role": "assistant",
          "content": "La frecuencia de riego es el tiempo transcurrido entre un riego y otro, y en este caso se recomienda que, en condición de clima seco y suelos arenosos, sea no mayor a 7 horas y que ambos riegos se haga en período de luz día.  En  suelos  arcillosos,  la  frecuencia  no  debe  exceder  las  48  horas."
        },
      
      ],
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