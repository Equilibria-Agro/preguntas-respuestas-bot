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
              "content": "Si te preguntan quien o que eres di: “Soy Germán, el asistente agrónomo de Equilibria Agro”. Tu enfoque y fuerte es el Limón Tahití, solo respondes preguntas relacionadas al limón tahití, cuidados, consejos, tips y dudas relacionadas con estos temas, la idea es que apoyes siempre solo estos temas y seas formal, tu solo respondes preguntas de limón tahtí, cuidados, consejos, tips y dudas relacionadas con estos temas, si te preguntan por temas distintos como deportes, historia, matemáticas o más le dices que tu conocimiento se limita a cítricos en general y especialmente Limón Tahití. Responderas amablamente siempre saludando, y cuando hablen de otros temas los orientas a que pregunten por estos temas que te mencione. NUNCA RESPONDER PREGUNTAS NO RELACIONADAS CON LIMÓN TAHITÍ, TIPS, CUIDADOS, CONSEJOS Y/O CONSULTAS QUE NO SEAN DE LIMON. QUIERO QUE DE LA LISTA DE PREGUNTAS Y RESPUESTAS QUE TE DARÉ NUNCA PERO NUNCA MODIFIQUES LAS PREGUNTAS Y/O RESPUESTAS, NUNCA MODIFIQUES LA RESPUESTA, NUNCA, QUE LA RESPUESTA SEA TAL CUAL. A LO MISMO QUE LAS PREGUNTAS DE TU ENTRENAMIENTOO JSONL QUIERO QUE SIGAS ESAS MISMAS REGLAS. PERO APARTE QUIERO QUE SI NO TIENES LAS RESPUESTA EN TU BASE DE DATOS DE LIMÓN TAHITÍ IGUAL LA RESPONDAS, QUIERO QUE ALARGUES LA RESPUESTA HASTA 200 PALABRAS, PERO QUE NO ME MODIFIQUES EL MENSAJE, SIMPLEMENTE LA RESPUESTA Y SIGUES AGREGANDO TEXTO AL FINAL. QUIERO QUE ME RESPONDAS TAL CUAL LAS PREGUNTAS PRE-CARGADAS, TAL CUAL, NO ME CAMBIES NADA"
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
          "content": "¿Cómo sembrar un árbol de limón??"
        },
        {
          "role": "assistant",
          "content": "Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en (tortas). Esto consta de armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio del ella. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes. A diferencia de loa siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas de crecimiento que retrasen o detengan su crecimiento.  En ambos casos el diámetro del plato debe de ser de 3 metros y el árbol debe de ir acompañado de un tutor."
        },

{
          "role": "user",
          "content": "¿Cómo sembrar un árbol de limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en (tortas). Esto consta de armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio del ella. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes. A diferencia de loa siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas de crecimiento que retrasen o detengan su crecimiento.  En ambos casos el diámetro del plato debe de ser de 3 metros y el árbol debe de ir acompañado de un tutor."
        },

{
          "role": "user",
          "content": "¿Cómo se debería de plantar un árbol de limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Debe realizarse con el inicio de las lluvias, aunque la disponibilidad de riego permitirá realizar esta labor en cualquier época del año. Una vez ubicadas las plantas en los sitios de plantación, se retira la bolsa y se ubica la planta en el centro del hoyo (de 40x40x40 cm, estas dimensiones pueden variar en relación con las características del suelo), procurando que el cuello quede unos 5-10 cm por encima de la superficie. Otro tipo de metodología es realizar siembra en (tortas). Esto consta de armar un montículo de tierra de unos 30 o 40 cm de altura y sembrar el árbol en el medio del ella. Esto hará que el árbol al expandir las raíces se encuentre con tierra suelta y pueda captar más agua y más nutrientes. A diferencia de loa siembra en hoyo no se encontrará con capas duras en el suelo en sus primeras etapas de crecimiento que retrasen o detengan su crecimiento.  En ambos casos el diámetro del plato debe de ser de 3 metros y el árbol debe de ir acompañado de un tutor."
        },


{
          "role": "user",
          "content": "¿A que distancia debería de sembrar los árboles?"
        },

        {
          "role": "assistant",
          "content": "Las distancias de plantación y su arreglo para el cultivo de lima ácida Tahití han venido cambiando en las diferentes regiones productoras de Colombia. Inicialmente, se utilizaban el cuadrado o el tresbolillo, con una distancia de 7 m entre plantas, pero se ha venido perdiendo interés en estos sistemas, debido a la mecanización de los cultivos, que se puede realizar mejor en las plantaciones rectangulares. Los arreglos más utilizados en suelos planos son en rectángulo, con variaciones de la distancia tanto entre filas como entre plantas. Dependiendo del tamaño del patrón seleccionado, así como de la fertilidad natural del suelo y las características climáticas, las distancias más usadas son 7 m entre filas y 5 o 6 m entre plantas."
        },

{
          "role": "user",
          "content": "¿A qué distancia sembrar limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Las distancias de plantación y su arreglo para el cultivo de lima ácida Tahití han venido cambiando en las diferentes regiones productoras de Colombia. Inicialmente, se utilizaban el cuadrado o el tresbolillo, con una distancia de 7 m entre plantas, pero se ha venido perdiendo interés en estos sistemas, debido a la mecanización de los cultivos, que se puede realizar mejor en las plantaciones rectangulares. Los arreglos más utilizados en suelos planos son en rectángulo, con variaciones de la distancia tanto entre filas como entre plantas. Dependiendo del tamaño del patrón seleccionado, así como de la fertilidad natural del suelo y las características climáticas, las distancias más usadas son 7 m entre filas y 5 o 6 m entre plantas."
        },

{
          "role": "user",
          "content": "¿Hasta que altura puedo sembrar limón?"
        },
        {
          "role": "assistant",
          "content": "La lima ácida Tahití se cultiva en altitudes que oscilan desde el nivel del mar hasta los 2.100 metros sobre el nivel del mar. Para fines comerciales, se recomienda establecerla desde los 700 metros sobre el nivel del mar hasta los 1.600 metros sobre el nivel del mar en la mayoría de los departamentos del país."
        },

{
          "role": "user",
          "content": "¿A qué altura sembrar limón?"
        },
        {
          "role": "assistant",
          "content": "La lima ácida Tahití se cultiva en altitudes que oscilan desde el nivel del mar hasta los 2.100 metros sobre el nivel del mar. Para fines comerciales, se recomienda establecerla desde los 700 metros sobre el nivel del mar hasta los 1.600 metros sobre el nivel del mar en la mayoría de los departamentos del país."
        },

{
          "role": "user",
          "content": "¿Hasta que altura puedo sembrar limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "La lima ácida Tahití se cultiva en altitudes que oscilan desde el nivel del mar hasta los 2.100 metros sobre el nivel del mar. Para fines comerciales, se recomienda establecerla desde los 700 metros sobre el nivel del mar hasta los 1.600 metros sobre el nivel del mar en la mayoría de los departamentos del país."
        },

{
          "role": "user",
          "content": "¿A qué altura sembrar limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "La lima ácida Tahití se cultiva en altitudes que oscilan desde el nivel del mar hasta los 2.100 metros sobre el nivel del mar. Para fines comerciales, se recomienda establecerla desde los 700 metros sobre el nivel del mar hasta los 1.600 metros sobre el nivel del mar en la mayoría de los departamentos del país."
        },

{
          "role": "user",
          "content": "¿Qué tipo de suelo es mejor para el limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "En cuanto a las exigencias edáficas, el cultivo de los cítricos se adapta mejor a condiciones de suelos arenosos profundos, francos o franco - arcillosos. Su sistema radicular no tolera la humedad, por ende, no es muy tolerante a los suelos arcillosos. También es importante aclarar que los suelos muy arenosos no tendrán mucha capacidad de retener agua y habrá que regar más seguido."
        },

{
          "role": "user",
          "content": "¿Qué tipo de suelo es bueno?"
        },
        {
          "role": "assistant",
          "content": "En cuanto a las exigencias edáficas, el cultivo de los cítricos se adapta mejor a condiciones de suelos arenosos profundos, francos o franco - arcillosos. Su sistema radicular no tolera la humedad, por ende, no es muy tolerante a los suelos arcillosos. También es importante aclarar que los suelos muy arenosos no tendrán mucha capacidad de retener agua y habrá que regar más seguido."
        },

{
          "role": "user",
          "content": "¿En qué suelo puedo sembrar?"
        },
        {
          "role": "assistant",
          "content": "En cuanto a las exigencias edáficas, el cultivo de los cítricos se adapta mejor a condiciones de suelos arenosos profundos, francos o franco - arcillosos. Su sistema radicular no tolera la humedad, por ende, no es muy tolerante a los suelos arcillosos. También es importante aclarar que los suelos muy arenosos no tendrán mucha capacidad de retener agua y habrá que regar más seguido."
        },

{
          "role": "user",
          "content": "¿En qué suelo puedo sembrar limón?"
        },
        {
          "role": "assistant",
          "content": "En cuanto a las exigencias edáficas, el cultivo de los cítricos se adapta mejor a condiciones de suelos arenosos profundos, francos o franco - arcillosos. Su sistema radicular no tolera la humedad, por ende, no es muy tolerante a los suelos arcillosos. También es importante aclarar que los suelos muy arenosos no tendrán mucha capacidad de retener agua y habrá que regar más seguido."
        },

{
          "role": "user",
          "content": "¿En qué suelo puedo sembrar limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "En cuanto a las exigencias edáficas, el cultivo de los cítricos se adapta mejor a condiciones de suelos arenosos profundos, francos o franco - arcillosos. Su sistema radicular no tolera la humedad, por ende, no es muy tolerante a los suelos arcillosos. También es importante aclarar que los suelos muy arenosos no tendrán mucha capacidad de retener agua y habrá que regar más seguido."
        },

{
          "role": "user",
          "content": "¿En qué rango de temperatura puedo sembrar limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "La región citrícola experimenta temperaturas que oscilan entre 18 y 30 ºC, condiciones adecuadas para el crecimiento de los cítricos. El rango de temperaturas óptimo para estos frutos se encuentra entre 12,5 y 39 °C, con un nivel ideal de 23,4 °C."
        },

{
          "role": "user",
          "content": "¿A qué temperatura sembrar limón?"
        },
        {
          "role": "assistant",
          "content": "La región citrícola experimenta temperaturas que oscilan entre 18 y 30 ºC, condiciones adecuadas para el crecimiento de los cítricos. El rango de temperaturas óptimo para estos frutos se encuentra entre 12,5 y 39 °C, con un nivel ideal de 23,4 °C."
        },

{
          "role": "user",
          "content": "¿Qué temperatura es buena para el limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "La región citrícola experimenta temperaturas que oscilan entre 18 y 30 ºC, condiciones adecuadas para el crecimiento de los cítricos. El rango de temperaturas óptimo para estos frutos se encuentra entre 12,5 y 39 °C, con un nivel ideal de 23,4 °C."
        },

{
          "role": "user",
          "content": "¿Cómo fertilizar?"
        },
        {
          "role": "assistant",
          "content": "La aplicación de fertilizante en Limón Tahití debe hacerse con cuidado. Una técnica común es aplicar el fertilizante en la zona de gotera del árbol, que es el área directamente debajo del alcance de las ramas. Debes evitar que el fertilizante entre en contacto directo con las raíces para prevenir daños. Es importante que el suelo esté húmedo al momento de la aplicación para asegurar una absorción efectiva de los nutrientes. La aplicación puede ser al suelo o foliar, según las necesidades específicas del cultivo. Es importante aclarar que las fertilización se debe de hacer después de las lluvias para que el árbol lo pueda absorber de la mejor manera."
        },

{
          "role": "user",
          "content": "¿Cómo fertilizar un árbol de limón?"
        },
        {
          "role": "assistant",
          "content": "La aplicación de fertilizante en Limón Tahití debe hacerse con cuidado. Una técnica común es aplicar el fertilizante en la zona de gotera del árbol, que es el área directamente debajo del alcance de las ramas. Debes evitar que el fertilizante entre en contacto directo con las raíces para prevenir daños. Es importante que el suelo esté húmedo al momento de la aplicación para asegurar una absorción efectiva de los nutrientes. La aplicación puede ser al suelo o foliar, según las necesidades específicas del cultivo. Es importante aclarar que las fertilización se debe de hacer después de las lluvias para que el árbol lo pueda absorber de la mejor manera."
        },

{
          "role": "user",
          "content": "¿Cómo fertilizar un árbol de limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "La aplicación de fertilizante en Limón Tahití debe hacerse con cuidado. Una técnica común es aplicar el fertilizante en la zona de gotera del árbol, que es el área directamente debajo del alcance de las ramas. Debes evitar que el fertilizante entre en contacto directo con las raíces para prevenir daños. Es importante que el suelo esté húmedo al momento de la aplicación para asegurar una absorción efectiva de los nutrientes. La aplicación puede ser al suelo o foliar, según las necesidades específicas del cultivo. Es importante aclarar que las fertilización se debe de hacer después de las lluvias para que el árbol lo pueda absorber de la mejor manera."
        },

{
          "role": "user",
          "content": "¿De qué manera se fertiliza un árbol?"
        },
        {
          "role": "assistant",
          "content": "La aplicación de fertilizante en Limón Tahití debe hacerse con cuidado. Una técnica común es aplicar el fertilizante en la zona de gotera del árbol, que es el área directamente debajo del alcance de las ramas. Debes evitar que el fertilizante entre en contacto directo con las raíces para prevenir daños. Es importante que el suelo esté húmedo al momento de la aplicación para asegurar una absorción efectiva de los nutrientes. La aplicación puede ser al suelo o foliar, según las necesidades específicas del cultivo. Es importante aclarar que las fertilización se debe de hacer después de las lluvias para que el árbol lo pueda absorber de la mejor manera."
        },

{
          "role": "user",
          "content": "¿Qué formas hay de fertilizar?"
        },
        {
          "role": "assistant",
          "content": "La aplicación de los fertilizantes sólidos se puede realizar principalmente al voleo  y en corona . El primer método causa que las plantas expandan las raíces superficiales por toda el área de la copa, y el segundo que las raíces crezcan hasta la gotera de la copa en busca del fertilizante, lo que genera un mejor anclaje.  En este sentido, se sugiere intercalar los dos métodos, para garantizar un buen desarrollo  de  las  raíces  y  un  mayor  aprovechamiento  del  fertilizante.  Es necesario tener en cuenta que, en el momento de aplicar los fertilizantes, el área que va de la gotera al tronco de la planta debe estar libre de malezas, y en ambos métodos es importante que el fertilizante sea incorporado al suelo, para asegurar una mayor eficiencia."
        },

{
          "role": "user",
          "content": "¿Cómo fertilizar correctamente un árbol de limón?"
        },
        {
          "role": "assistant",
          "content": "La aplicación de fertilizantes en Limón Tahití debe hacerse con cuidado. Una técnica común es aplicar el fertilizante en la zona de gotera del árbol, que es el área directamente debajo del alcance de las ramas. Debes evitar que el fertilizante entre en contacto directo con las raíces para prevenir daños. Es importante que el suelo esté húmedo al momento de la aplicación para asegurar una absorción efectiva de los nutrientes. La aplicación puede ser al suelo o foliar, según las necesidades específicas del cultivo. Es importante aclarar que las fertilización se debe de hacer después de las lluvias para que el árbol lo pueda absorber de la mejor manera."
        },

{
          "role": "user",
          "content": "¿Cómo aplicar un fertilizante?"
        },
        {
          "role": "assistant",
          "content": "La aplicación de fertilizante en Limón Tahití debe hacerse con cuidado. Una técnica común es aplicar el fertilizante en la zona de gotera del árbol, que es el área directamente debajo del alcance de las ramas. Debes evitar que el fertilizante entre en contacto directo con las raíces para prevenir daños. Es importante que el suelo esté húmedo al momento de la aplicación para asegurar una absorción efectiva de los nutrientes. La aplicación puede ser al suelo o foliar, según las necesidades específicas del cultivo. Es importante aclarar que las fertilización se debe de hacer después de las lluvias para que el árbol lo pueda absorber de la mejor manera."
        },


{
          "role": "user",
          "content": "¿En qué época es mejor fertilizar?"
        },
        {
          "role": "assistant",
          "content": "La mejor época para fertilizar es en la temporada de lluvias o después de alguna lluvia. Esto es porque el suelo al estar húmedo, las plantas tendrán mayor facilidad de absorberlo. Antes de una lluvia no es recomendable ya que se pueden lavar si es de mucho intensidad."
        },

{
          "role": "user",
          "content": "¿Cuánto fertilizante necesita el limón?"
        },
        {
          "role": "assistant",
          "content": "El manejo adecuado de los nutrientes es esencial para garantizar un crecimiento óptimo de los cultivos a lo largo de su ciclo de vida. Durante el primer año, se recomienda aplicar 12 kg/ha de nitrógeno, 3 kg/ha de fósforo y 15 kg/ha de potasio para establecer una base sólida para el desarrollo inicial de las plantas. A medida que el cultivo madura, las necesidades nutricionales aumentan: en el segundo año, se sugiere incrementar las cantidades a 24 kg/ha de nitrógeno, 6 kg/ha de fósforo y 31 kg/ha de potasio para apoyar un crecimiento más vigoroso. Para el tercer año, las demandas nutricionales continúan aumentando, con recomendaciones de 49 kg/ha de nitrógeno, 12 kg/ha de fósforo y 61 kg/ha de potasio para estimular una producción robusta y sostenible. El cuarto año marca una etapa crucial en el ciclo de vida del cultivo, donde se aconseja aplicar 98 kg/ha de nitrógeno, 24 kg/ha de fósforo y 123 kg/ha de potasio para mantener un rendimiento óptimo y una salud vigorosa de las plantas. Finalmente, durante el quinto año, se recomienda una aplicación de 122 kg/ha de nitrógeno, 76 kg/ha de fósforo y 384 kg/ha de potasio para garantizar una cosecha abundante y de alta calidad. Estas recomendaciones nutricionales proporcionan una guía fundamental para maximizar la productividad y la rentabilidad en el manejo de cultivos a lo largo de su ciclo de vida."
        },

{
          "role": "user",
          "content": "¿Cuánto fertilizante aplicarle al limón?"
        },
        {
          "role": "assistant",
          "content": "El manejo adecuado de los nutrientes es esencial para garantizar un crecimiento óptimo de los cultivos a lo largo de su ciclo de vida. Durante el primer año, se recomienda aplicar 12 kg/ha de nitrógeno, 3 kg/ha de fósforo y 15 kg/ha de potasio para establecer una base sólida para el desarrollo inicial de las plantas. A medida que el cultivo madura, las necesidades nutricionales aumentan: en el segundo año, se sugiere incrementar las cantidades a 24 kg/ha de nitrógeno, 6 kg/ha de fósforo y 31 kg/ha de potasio para apoyar un crecimiento más vigoroso. Para el tercer año, las demandas nutricionales continúan aumentando, con recomendaciones de 49 kg/ha de nitrógeno, 12 kg/ha de fósforo y 61 kg/ha de potasio para estimular una producción robusta y sostenible. El cuarto año marca una etapa crucial en el ciclo de vida del cultivo, donde se aconseja aplicar 98 kg/ha de nitrógeno, 24 kg/ha de fósforo y 123 kg/ha de potasio para mantener un rendimiento óptimo y una salud vigorosa de las plantas. Finalmente, durante el quinto año, se recomienda una aplicación de 122 kg/ha de nitrógeno, 76 kg/ha de fósforo y 384 kg/ha de potasio para garantizar una cosecha abundante y de alta calidad. Estas recomendaciones nutricionales proporcionan una guía fundamental para maximizar la productividad y la rentabilidad en el manejo de cultivos a lo largo de su ciclo de vida."
        },
        {
          "role": "user",
          "content": "¿Cómo puedo sembrar un árbol de limón Tahití?"
        },
        {
          "role": "assistant",
          "content": "Para la siembra de plantas, se recomienda un sistema de riego, permitiendo el trasplante en cualquier época del año. En ausencia de riego, el trasplante debe coincidir con el inicio de las lluvias. Los hoyos para el trasplante deben ser de 40x40x40 cm y la raíz debe quedar 5 cm por encima del suelo. Se aconseja aplicar 2 kg de compost y 250 g/planta de fertilizante 10-30-20. Si el pH del suelo es inferior a 5, se debe aplicar cal. Tras el trasplante, se debe asegurar el riego y el manejo fitosanitario. La preparación del terreno depende de las características del suelo. En terrenos planos, se utiliza maquinaria y el diseño de siembra es rectangular. En pendientes, se trazan curvas de nivel. Las distancias de siembra más comunes en Colombia son 6x6 o 7x6. Refuerza tus conocimientos, ¡visualiza este video complementario ahora! https://youtu.be/73l95nu79aY?si=yxppwjGSCo4bqdEl"
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

