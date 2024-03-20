require("dotenv").config(); // Para cargar variables de entorno desde un archivo .env
const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const helmet = require("helmet"); // Para la seguridad del servidor
const stringSimilarity = require("string-similarity");
const contexts = require("./contexts"); // Asegúrate de tener este archivo y ruta correctos

const app = express();
app.use(bodyParser.json({ limit: "10kb" })); // Límite de tamaño para el body de las solicitudes
app.use(helmet()); // Seguridad adicional para headers HTTP

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Utiliza una variable de entorno para la clave API
});

// Extraemos la lógica de find-similar-question a una función reutilizable
async function findSimilarQuestions(userQuestion) {
  if (typeof userQuestion !== "string" || userQuestion.trim().length === 0) {
    throw new Error("La pregunta es requerida y debe ser un texto válido.");
  }

  const questions = contexts.map((context) => context.content);
  const matches = stringSimilarity.findBestMatch(
    userQuestion,
    questions
  ).ratings;
  const sortedMatches = matches.sort((a, b) => b.rating - a.rating);
  // Tomamos solo la coincidencia superior en lugar de las cinco primeras
  const bestMatch = sortedMatches[0];

  const matchIndex = contexts.findIndex(
    (context) => context.content === bestMatch.target
  );
  const adjustedIndex = matchIndex % 2 === 0 ? matchIndex : matchIndex - 1;
  const response = [
    {
      role: "user",
      content: contexts[adjustedIndex]
        ? contexts[adjustedIndex].content
        : "Pregunta no disponible",
    },
    {
      role: "assistant",
      content:
        adjustedIndex + 1 < contexts.length && contexts[adjustedIndex + 1]
          ? contexts[adjustedIndex + 1].content
          : "Respuesta no disponible",
    },
  ];

  // Retorna solo el par de pregunta-respuesta más relevante
  return response.flat();
}

app.post("/find-and-store-link", async (req, res) => {
  const contexts = [
    { content: " ¿Cómo se siembra un árbol de limón Tahití?", answer: "  Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!", link: "https://ejemplo.com/reset-password" },

  ]; // Asegúrate de que el array 'contexts' está bien definido aquí
  try {
    const { question, answer } = req.body;
    if (typeof question !== 'string' || question.trim().length === 0 || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).send("La pregunta y la respuesta son requeridas y deben ser textos válidos.");
    }

    // Realiza la comparación utilizando 'trim()' para evitar problemas con espacios extra
    const match = contexts.find(context =>
      context.content.trim() === question.trim() && 
      context.answer.trim() === answer.trim()
    );

    if (match) {
      res.json({ success: true, link: match.link });
    } else {
      res.status(404).json({ success: false, message: "No se encontró una coincidencia para la pregunta y respuesta proporcionadas." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error interno del servidor.");
  }
});



app.post("/get-response", async (req, res) => {
  try {
    const question = req.body.question;
    if (typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).send("La pregunta es requerida y debe ser un texto válido.");
    }

    // Primero, obtenemos las preguntas similares
    const similarQuestionsResponses = await findSimilarQuestions(question);

    console.log("Historial de preguntas similares:", similarQuestionsResponses); // Historial que se trajo

    // Asumiendo que siempre habrá solo una pregunta en similarQuestionsResponses
    const uniqueQuestion = similarQuestionsResponses.find(r => r.role === "user");
    if (!uniqueQuestion) {
      console.error("No se encontró una pregunta de usuario única.");
      return res.status(500).send("Error interno al procesar la pregunta.");
    }

    const customContexts = [
      { 
        content: " ¿Cómo se siembra un árbol de limón Tahití?",
        answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!", link: "https://www.youtube.com/watch?v=cepr5M-JSN8&ab_channel=EquilibriaAgro" },
        { 
          content: " ¿Cómo se siembra un árbol?",
        answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!", link: "https://www.youtube.com/watch?v=cepr5M-JSN8&ab_channel=EquilibriaAgro" },
      {
        content: "¿Cómo podar?",
        answer: "Esto dependerá del tipo de poda. A continuación, los tipos de poda y sus descripciones: Poda de formación: La poda de árboles es una práctica esencial para moldear la estructura de las plantas y garantizar su desarrollo vegetativo y productivo. Comienza en el vivero, continúa después del trasplante y finaliza antes de la fase de producción. Al podar, se busca que el tallo principal permanezca erguido y sin brotes no deseados hasta una altura de 70 a 80 cm. El corte del tallo principal rompe la dominancia apical, estimulando el crecimiento de brotes debajo de ese punto. Se seleccionan tres o cuatro de estos brotes, distribuidos alrededor del tallo, con una distancia de 4 a 5 cm entre ellos. Luego, se recomienda cortar estas ramas nuevamente entre 12 y 15 cm para fomentar el desarrollo de nuevas ramas que conformarán la copa del árbol. Esta práctica culmina en la fase vegetativa, con 10 a 12 ramas bien distribuidas y espaciadas que sostendrán la copa durante la etapa productiva. Poda en etapa de desarrollo: En esta fase, el objetivo es preparar la planta para su etapa productiva. Para lograrlo, se deben mantener los crecimientos orientados hacia la producción y evitar la poda excesiva, que podría retrasar la producción. Aquí algunas consideraciones clave: - Eliminación de chupones o brotes no deseados: Es importante quitar los chupones temprana y manualmente. Si se hace tarde, pueden volverse leñosos y causar heridas en la planta, lo que requiere aplicar productos de protección. - Ramas bajas y cruzadas: Se deben eliminar las ramas bajas y aquellas que se cruzan. Las que tengan mejor orientación y desarrollo vegetativo, y estén sanas, deben conservarse. Poda de mantenimiento y saneamiento: - Eliminación de chupones y ramas improductivas: Continúa retirando los chupones del patrón y la copa. También, identifica y elimina las ramas dentro de la copa que no contribuyen a la producción y aquellas que crecen verticalmente sin ser productivas debido a su dominancia apical.- Manejo de ramas cruzadas: En caso de ramas que se cruzan, prioriza la más vigorosa, con abundante follaje y una orientación favorable. Esto ayudará a mantener una estructura equilibrada. - Poda anual: Al menos una vez al año, realiza una poda para eliminar ramas enfermas o con crecimiento deficiente. También, considera las limitaciones nutricionales al seleccionar las ramas a podar.- Ramas bajeras: Las ramas cercanas al suelo deben ser recortadas para facilitar las labores de fertilización y control de malezas. Se recomienda dejarlas a una altura mínima de 40 cm para evitar que los frutos toquen el suelo, lo que podría afectar su calidad comercial. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=cepr5M-JSN8&ab_channel=EquilibriaAgro"
      },
      {
        content: " ¿Cómo se siembra un árbol de limón Tahití correctamente?",
        answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=73l95nu79aY&t=1s&ab_channel=EquilibriaAgro"
      },
      {
        content: " ¿Cómo se siembra un árbol de limón Tahití correctamente?",
        answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=73l95nu79aY&t=1s&ab_channel=EquilibriaAgro"
      },
      {
        content: " ¿Cómo sembrar un árbol de limón Tahití?",
        answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=73l95nu79aY&t=1s&ab_channel=EquilibriaAgro"
      },
      {
        content: " ¿Cómo se debería plantar un árbol de limón Tahití?",
        answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=73l95nu79aY&t=1s&ab_channel=EquilibriaAgro"
      },
      {
        content: " ¿Cómo sembrar?",
        answer: " Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en \"tortas\". Esto consiste en armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio de él. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes y sin mayor esfuerzo. A diferencia de la siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas que retrasen o detengan su crecimiento. En ambos casos el diámetro del plato debe de ser de 3 metros, aplicar un pre emergente para prevenir las arvenses y el árbol debe de ir acompañado de un tutor. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=73l95nu79aY&t=1s&ab_channel=EquilibriaAgro"
      },
      {
        content: " ¿Qué es una poda?",
        answer: " La poda es una práctica utilizada para promover el equilibrio fisiológico en las plantas. Su objetivo es lograr un crecimiento controlado de la parte vegetativa y una producción uniforme y abundante. Al realizar la poda, se altera el crecimiento natural de la planta al interrumpir el crecimiento vertical. Esto, a su vez, estimula la producción de brotes laterales, mejorando la aireación y la entrada de luz. En el caso de los cítricos, esta técnica es especialmente relevante, ya que tienden a desarrollar un follaje denso en la parte externa de la copa y a crecer verticalmente en longitud, especialmente en condiciones de trópico húmedo. Es importante adaptar la planificación de las podas a las condiciones ambientales de cada región productora. En Colombia, se debe considerar la distribución de las lluvias (unimodales o bimodales) y el vigor de cada especie. Por lo tanto, la práctica de la poda debe ser estratégicamente planificada y ejecutada para optimizar la salud y la productividad de la planta. Así como tú cuidas tu bienestar, las plantas también requieren atención y cariño para prosperar. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=cepr5M-JSN8&ab_channel=EquilibriaAgro"
      },
      {
        content: "¿Cómo podar un árbol de limón?",
        answer: "Esto dependerá del tipo de poda. A continuación, los tipos de poda y sus descripciones: Poda de formación: La poda de árboles es una práctica esencial para moldear la estructura de las plantas y garantizar su desarrollo vegetativo y productivo. Comienza en el vivero, continúa después del trasplante y finaliza antes de la fase de producción. Al podar, se busca que el tallo principal permanezca erguido y sin brotes no deseados hasta una altura de 70 a 80 cm. El corte del tallo principal rompe la dominancia apical, estimulando el crecimiento de brotes debajo de ese punto. Se seleccionan tres o cuatro de estos brotes, distribuidos alrededor del tallo, con una distancia de 4 a 5 cm entre ellos. Luego, se recomienda cortar estas ramas nuevamente entre 12 y 15 cm para fomentar el desarrollo de nuevas ramas que conformarán la copa del árbol. Esta práctica culmina en la fase vegetativa, con 10 a 12 ramas bien distribuidas y espaciadas que sostendrán la copa durante la etapa productiva. Poda en etapa de desarrollo: En esta fase, el objetivo es preparar la planta para su etapa productiva. Para lograrlo, se deben mantener los crecimientos orientados hacia la producción y evitar la poda excesiva, que podría retrasar la producción. Aquí algunas consideraciones clave: - Eliminación de chupones o brotes no deseados: Es importante quitar los chupones temprana y manualmente. Si se hace tarde, pueden volverse leñosos y causar heridas en la planta, lo que requiere aplicar productos de protección. - Ramas bajas y cruzadas: Se deben eliminar las ramas bajas y aquellas que se cruzan. Las que tengan mejor orientación y desarrollo vegetativo, y estén sanas, deben conservarse. Poda de mantenimiento y saneamiento: - Eliminación de chupones y ramas improductivas: Continúa retirando los chupones del patrón y la copa. También, identifica y elimina las ramas dentro de la copa que no contribuyen a la producción y aquellas que crecen verticalmente sin ser productivas debido a su dominancia apical.- Manejo de ramas cruzadas: En caso de ramas que se cruzan, prioriza la más vigorosa, con abundante follaje y una orientación favorable. Esto ayudará a mantener una estructura equilibrada. - Poda anual: Al menos una vez al año, realiza una poda para eliminar ramas enfermas o con crecimiento deficiente. También, considera las limitaciones nutricionales al seleccionar las ramas a podar.- Ramas bajeras: Las ramas cercanas al suelo deben ser recortadas para facilitar las labores de fertilización y control de malezas. Se recomienda dejarlas a una altura mínima de 40 cm para evitar que los frutos toquen el suelo, lo que podría afectar su calidad comercial. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=cepr5M-JSN8&ab_channel=EquilibriaAgro"
      },                 
      {
        content: "¿Cómo podar un árbol de limón Tahití?",
        answer: "Esto dependerá del tipo de poda. A continuación, los tipos de poda y sus descripciones: Poda de formación: La poda de árboles es una práctica esencial para moldear la estructura de las plantas y garantizar su desarrollo vegetativo y productivo. Comienza en el vivero, continúa después del trasplante y finaliza antes de la fase de producción. Al podar, se busca que el tallo principal permanezca erguido y sin brotes no deseados hasta una altura de 70 a 80 cm. El corte del tallo principal rompe la dominancia apical, estimulando el crecimiento de brotes debajo de ese punto. Se seleccionan tres o cuatro de estos brotes, distribuidos alrededor del tallo, con una distancia de 4 a 5 cm entre ellos. Luego, se recomienda cortar estas ramas nuevamente entre 12 y 15 cm para fomentar el desarrollo de nuevas ramas que conformarán la copa del árbol. Esta práctica culmina en la fase vegetativa, con 10 a 12 ramas bien distribuidas y espaciadas que sostendrán la copa durante la etapa productiva. Poda en etapa de desarrollo: En esta fase, el objetivo es preparar la planta para su etapa productiva. Para lograrlo, se deben mantener los crecimientos orientados hacia la producción y evitar la poda excesiva, que podría retrasar la producción. Aquí algunas consideraciones clave: - Eliminación de chupones o brotes no deseados: Es importante quitar los chupones temprana y manualmente. Si se hace tarde, pueden volverse leñosos y causar heridas en la planta, lo que requiere aplicar productos de protección. - Ramas bajas y cruzadas: Se deben eliminar las ramas bajas y aquellas que se cruzan. Las que tengan mejor orientación y desarrollo vegetativo, y estén sanas, deben conservarse. Poda de mantenimiento y saneamiento: - Eliminación de chupones y ramas improductivas: Continúa retirando los chupones del patrón y la copa. También, identifica y elimina las ramas dentro de la copa que no contribuyen a la producción y aquellas que crecen verticalmente sin ser productivas debido a su dominancia apical.- Manejo de ramas cruzadas: En caso de ramas que se cruzan, prioriza la más vigorosa, con abundante follaje y una orientación favorable. Esto ayudará a mantener una estructura equilibrada. - Poda anual: Al menos una vez al año, realiza una poda para eliminar ramas enfermas o con crecimiento deficiente. También, considera las limitaciones nutricionales al seleccionar las ramas a podar.- Ramas bajeras: Las ramas cercanas al suelo deben ser recortadas para facilitar las labores de fertilización y control de malezas. Se recomienda dejarlas a una altura mínima de 40 cm para evitar que los frutos toquen el suelo, lo que podría afectar su calidad comercial. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://www.youtube.com/watch?v=cepr5M-JSN8&ab_channel=EquilibriaAgro"
      },        
      {
        content: "¿Cómo se debe guadañar?",
        answer: " Los controles con guadaña deben de ser cuidadosos, para evitar daños al tronco o a las raíces superficiales; de igual forma, se debe tener un cuidado extremo en la protección del personal que realiza esta labor, la cual debe cumplir con todas las normas y equipos recomendados para estas actividades. La guadaña es la herramienta más común para esta actividad, pues permite conservar las especies nobles que cumplen la función de cobertura del suelo en el área de las calles. Por lo general, esta práctica se hace cada dos o tres meses, dependiendo de la fertilidad del suelo y el comportamiento meteorológico anual. Se debe emplear un movimiento de barrido lateral con ritmo constante y fluido, evitando cortar demasiado rápido para garantizar cortes limpios y prevenir la fatiga. Es esencial prestar atención a la seguridad y mantener a otras personas y animales alejados del área mientras se realiza la guadañada, utilizando equipo de protección como gafas de seguridad y protectores auditivos según sea necesario. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://youtu.be/_XraI9syKUg"
      },     
      {
        content: "¿Qué es platear y porque la guadaña es importante?",
        answer: " El plateo es la actividad de retirar las arvenses del cultivo de limón. El plateo se da desde la zona de desarrollo radicular hasta 50 cm desde la gotera del árbol, esta actividad es crucial en el cultivo de lima ácida Tahití pues es necesario tener la zona de influencia radicular libre de competidores. Esta labor, realizada con machete, guadaña o herbicidas, minimiza la competencia por agua y nutrientes entre las malezas y el sistema radicular del cultivo. La guadaña, usada cuidadosamente cada dos o tres meses, permite conservar especies nobles que protegen el suelo y para usar menos agroquímicos. No obstante, hay malezas muy agresivas como lo son Brachiaria, la caminadora o el coquito, con las cuales se debe de utilizar herbicidas. Los cítricos, con un sistema radicular superficial y una baja capacidad para desarrollar pelos radiculares, son deficientes competidores frente a las malezas. Refuerza tus conocimientos, ¡visualiza este video complementario ahora!",
        link: "https://youtu.be/_XraI9syKUg?si=da-DNB4GyYByMlJ1"
      }
      
    ];

    let linkToAdd = ''; // Variable para almacenar el enlace si es encontrado
    const match = customContexts.find(context => {
      console.log(`Comparando pregunta única: '${uniqueQuestion.content.trim()}' con pregunta de contexto: '${context.content.trim()}'`);
      return context.content.trim() === uniqueQuestion.content.trim();
    });
    if (match) {
      linkToAdd = match.link; // Asigna el enlace encontrado
      console.log("Enlace encontrado:", linkToAdd); // Log del enlace encontrado
    }

    const modelId = "gpt-3.5-turbo-1106";

    const chatCompletion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        // Configuración del sistema y pregunta/respuetas precedentes
        {
          role: "system",
          content: "En este chat, va a haber una conversación precargada, la idea es que siempre des la misma respuesta y exactamente esa. Necesito que respondas tal cual la respuesta que tienes ya precargada, no omitas NINGUNA palabra, haz un análisis, busca la respuesta de la pregunta que te hagan y dame esa respuesta tal cual a como está precargada, así la pregunta sea diferente busca la mas similar y da la respuesta tal cual a como esta precargada. Este es un asistente especializado en el Limón y arboles. Deberá responder preguntas relacionadas exclusivamente con el cuidado, cultivo, y características del Limón Tahití. Siempre mantenga un tono amable y enfocado en proporcionar la mejor información posible sobre el Limón Tahití. Cuando pregunten por temas que no tengan que ver con lo mencionado o preguntas que no traigan un historial, responde amablemente y pidele que vuelva y consulte con un tema de limon por ejemplo"
        },
        ...similarQuestionsResponses,
        { role: "user", content: question },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    });

    console.log("Mensajes enviados a OpenAI:", chatCompletion.model, chatCompletion.messages); // Log de lo que se envió al final

    // Construye la respuesta final, añadiendo el enlace si está disponible
    let finalResponse = chatCompletion.choices[0].message.content;
    if (linkToAdd) {
      finalResponse += `\nPara más información, visita este enlace: ${linkToAdd}`;
    }

    res.json({ response: finalResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error interno del servidor.");
  }
});


app.post("/find-similar-question", async (req, res) => {
  try {
    const userQuestion = req.body.question;
    const responses = await findSimilarQuestions(userQuestion);
    res.json(responses);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).send(error.message);
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
