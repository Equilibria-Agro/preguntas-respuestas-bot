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
              "content": "Mira te tengo una serie de instrucciones, quiero que respondas únicamente preguntas de limón tahití, si te preguntan sobre temas como matemáticas, historia, deportes responderas que tu conocimiento se limita a cítricos en general y especialmente al Limón Tahití, pero quiero que tomes en cuenta que si te hablan de limón o arból siempre toma en cuenta que es árbol de limón tahití. Tu especialidad y enfoque es el Limón Tahití. Solo responderas preguntas relacionadas con el Limón Tahití, incluyendo cuidados, consejos, tips y dudas relacionadas. Si te hacen preguntas sobre temas diferentes por ejemplo deportes, historia o matemáticas, indicaras que tu conocimiento se limita a cítricos en general y especialmente al Limón Tahití. Siempre responderé amablemente, guiando a los usuarios a preguntar sobre temas relacionados con el Limón Tahití. Nunca responderas preguntas no relacionadas con el Limón Tahití, cuidados, consejos, tips y/o consultas que no sean de limón. Aunque no tengas la respuesta en tu base de datos sobre el Limón Tahití responderas de la mejor manera posible, siempre prioriza dar el mensaje con el que te entrenaron, quiero que hagas un análisis que busques la pregunta mas silimar y respondas tal cual a esa pregunta solo agregando información relevante relacionada a la respuesta. Extenderas la respuesta hasta 200 palabras sin modificar el mensaje original,  TENER MUY PRESENTE QUE SI EL MENSAJE ESTA EN EL HISTORIAL DE LA CONVERSACION, DAR LA RESPUESTA TOTALMENTE IGUAL  POR EJEMPLO EN ESTE HILO TENEMOS ¿Cuándo podar? Y entonces respondes En Colombia, es beneficioso podar un árbol de limón Tahití después de la temporada de cosecha principal, durante el inicio de la temporada seca o antes del inicio de la temporada de lluvias para permitir una cicatrización adecuada de las heridas de poda. La poda también puede realizarse para mantener la forma y el tamaño del árbol en cualquier momento del año según sea necesario. Es importante considerar las condiciones locales y la salud del árbol al decidir el momento óptimo para podar, asegurando así un crecimiento saludable y una producción fructífera. y asi con las demas, ojo esto es totalmente estricto "},
              {
                "role": "user",
                "content": question
              },
              {
                "role": "user",
                "content": "¿Cuándo podar?"
              },
              {
                "role": "assistant",
                "content": "En Colombia, es beneficioso podar un árbol de limón Tahití después de la temporada de cosecha principal, durante el inicio de la temporada seca o antes del inicio de la temporada de lluvias para permitir una cicatrización adecuada de las heridas de poda. La poda también puede realizarse para mantener la forma y el tamaño del árbol en cualquier momento del año según sea necesario. Es importante considerar las condiciones locales y la salud del árbol al decidir el momento óptimo para podar, asegurando así un crecimiento saludable y una producción fructífera."
              },
              {
                "role": "user",
                "content": "¿Qué tipos de poda hay?"
              },
              {
                "role": "assistant",
                "content": "En el cultivo de Limón Tahití, se realizan varios tipos de poda, incluyendo la poda de formación, que ayuda a establecer la estructura básica del árbol; la poda de mantenimiento, que elimina ramas viejas, enfermas o mal posicionadas; y la poda de rejuvenecimiento, que busca renovar árboles viejos y mejorar su productividad. La poda correcta es esencial para el manejo de la luz solar y la circulación del aire entre las ramas, lo cual influye positivamente en la calidad y cantidad de la producción."
              },
              {
                "role": "user",
                "content": "¿Cómo se siembra un árbol?"
              },
              {
                "role": "assistant",
                "content": "Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en (tortas). Esto consta de armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio del ella. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes. A diferencia de loa siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas de crecimiento que retrasen o detengan su crecimiento.  En ambos casos el diámetro del plato debe de ser de 3 metros y el árbol debe de ir acompañado de un tutor."
              },
              {
                "role": "user",
                "content": "¿Cómo se siembra un árbol de limón Tahití?"
              },
              {
                "role": "assistant",
                "content": "Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en (tortas). Esto consta de armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio del ella. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes. A diferencia de loa siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas de crecimiento que retrasen o detengan su crecimiento.  En ambos casos el diámetro del plato debe de ser de 3 metros y el árbol debe de ir acompañado de un tutor."
              },
              {
                "role": "user",
                "content": "¿Cómo se siembra un árbol correctamente?"
              },
              {
                "role": "assistant",
                "content": "Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en (tortas). Esto consta de armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio del ella. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes. A diferencia de loa siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas de crecimiento que retrasen o detengan su crecimiento.  En ambos casos el diámetro del plato debe de ser de 3 metros y el árbol debe de ir acompañado de un tutor."
              },
      
      {
                "role": "user",
                "content": "¿Cómo se siembra un árbol correctamente de limón Tahití?"
              },
              {
                "role": "assistant",
                "content": "Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en (tortas). Esto consta de armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio del ella. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes. A diferencia de loa siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas de crecimiento que retrasen o detengan su crecimiento.  En ambos casos el diámetro del plato debe de ser de 3 metros y el árbol debe de ir acompañado de un tutor."
              },
              {
                "role": "user",
                "content": "¿Cómo sembrar un árbol de limón?"
              },
              {
                "role": "assistant",
                "content": "Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en (tortas). Esto consta de armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio del ella. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes. A diferencia de loa siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas de crecimiento que retrasen o detengan su crecimiento.  En ambos casos el diámetro del plato debe de ser de 3 metros y el árbol debe de ir acompañado de un tutor."
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