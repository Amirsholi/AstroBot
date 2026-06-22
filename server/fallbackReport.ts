import type { PersonalReport, ReportInput } from "./generateReport.js";

type Position = {
  name: string;
  sign: string;
  house?: number | null;
};

type Aspect = {
  from: string;
  to: string;
  type: string;
  orb: number;
};

const signLanguage: Record<string, string> = {
  Aries: "busca avanzar con iniciativa y comprobar las cosas en movimiento",
  Tauro: "necesita tiempo, estabilidad y una experiencia concreta antes de confiar",
  Géminis: "ordena la experiencia al nombrarla, contrastarla y mirarla desde varios ángulos",
  Cáncer: "registra con profundidad el clima emocional y protege lo que considera íntimo",
  Leo: "necesita expresarse con autenticidad y sentir que su presencia tiene un lugar",
  Virgo: "observa matices, busca coherencia y transforma la inquietud en acciones concretas",
  Libra: "comprende mejor lo que ocurre cuando puede considerar al otro y recuperar equilibrio",
  Escorpio: "se acerca a la experiencia con intensidad y necesita llegar debajo de la superficie",
  Sagitario: "busca amplitud, sentido y una dirección que permita seguir creciendo",
  Capricornio: "tiende a sostener, organizar y construir incluso cuando el proceso exige paciencia",
  Acuario: "necesita conservar una mirada propia y encontrar formas menos previsibles de avanzar",
  Piscis: "percibe capas sutiles y necesita espacios donde sensibilidad e imaginación puedan respirar",
};

const signalLanguage: Record<string, string> = {
  introspection: "Tu primera respuesta suele ser interior: necesitas dejar que lo sentido encuentre nombre antes de exponerlo.",
  "verbal-processing": "La palabra y el intercambio te ayudan a descubrir qué estaba ocurriendo por dentro.",
  "self-control": "Frente a la intensidad, tiendes a sostener el funcionamiento antes de atender lo que se movió.",
  "action-regulation": "El cuerpo, el movimiento y el cambio de escenario suelen devolverte claridad.",
  "inner-coherence": "Las decisiones se vuelven posibles cuando reconoces una coherencia íntima, no sólo una ventaja práctica.",
  security: "Antes de decidir, necesitas sentir que existe un suelo suficiente y que el riesgo no te deja sin margen.",
  intuition: "Hay decisiones que reconoces primero como una sensación y sólo después puedes explicar.",
  "relational-awareness": "Tu criterio incluye naturalmente el efecto que una decisión tendrá sobre quienes participan.",
  "outer-adaptation": "Puedes responder rápido por fuera mientras una parte más profunda todavía está acomodándose.",
  "attachment-to-known": "Los cambios requieren un duelo silencioso por aquello que ya era familiar.",
  planning: "Cuando el escenario cambia, ordenar variables y construir un mapa reduce el ruido interno.",
  "openness-to-change": "La incertidumbre también puede sentirse como una puerta y despertar curiosidad.",
  "earned-trust": "La apertura aparece cuando la confianza se demuestra con continuidad y hechos.",
  autonomy: "Necesitas cercanía sin perder el espacio desde el cual sigues siendo tú.",
  "emotional-presence": "La reciprocidad y la atención emocional son la señal de que puedes bajar la guardia.",
  directness: "La honestidad clara, incluso incómoda, te permite sentir que el vínculo es real.",
  "belonging-autonomy": "Existe una búsqueda de pertenencia que no implique reducir tu singularidad.",
  independence: "La independencia te protege, aunque en ciertos momentos puede convertirse en distancia excesiva.",
  "over-responsibility": "Es fácil que sostengas más de lo que muestras y que pedir ayuda llegue demasiado tarde.",
  recognition: "Necesitas comprobar que tu voz no sólo es escuchada, sino que tiene un lugar legítimo.",
  "direct-action": "Cuando el deseo es claro, tu energía encuentra dirección y se vuelve iniciativa.",
  discernment: "Prefieres observar el deseo antes de entregarle movimiento, para distinguir impulso de verdad.",
  enthusiasm: "El entusiasmo aparece con fuerza, pero puede encontrarse pronto con preguntas que frenan su avance.",
  intensity: "Lo que deseas no suele quedarse en la superficie: reorganiza prioridades y mueve el entorno.",
  closure: "Este momento parece pedir una despedida consciente antes de abrir otra etapa.",
  construction: "La etapa actual se parece más a una obra paciente que a un cambio instantáneo.",
  "direction-search": "Hay una búsqueda activa de orientación, aunque la respuesta todavía no tenga una forma definitiva.",
  "change-impulse": "Algo ya comenzó a moverse por dentro y pide una vida más alineada con tu verdad actual.",
};

const titleByCurrentSignal: Record<string, string> = {
  closure: "El espacio que deja lo que termina",
  construction: "La paciencia de construir algo propio",
  "direction-search": "Una brújula que todavía se está formando",
  "change-impulse": "El movimiento que ya empezó por dentro",
};

const planetFunction: Record<string, string> = {
  Sol: "tu dirección consciente",
  Luna: "tus necesidades emocionales",
  Mercurio: "tu manera de comprender",
  Venus: "tu forma de vincularte y valorar",
  Marte: "tu impulso de acción",
  Júpiter: "tu búsqueda de amplitud y sentido",
  Saturno: "tu necesidad de estructura y maduración",
  Urano: "tu impulso de cambio y autenticidad",
  Neptuno: "tu sensibilidad e imaginación",
  Plutón: "tu capacidad de transformación",
};

function positionFrom(value: unknown): Position | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.name !== "string" || typeof item.sign !== "string") return null;
  return {
    name: item.name,
    sign: item.sign,
    house: typeof item.house === "number" ? item.house : null,
  };
}

function sentenceForSignal(input: ReportInput, answerIndex: number) {
  const signal = input.answers[answerIndex]?.signals[0];
  return signalLanguage[signal] ?? input.answers[answerIndex]?.answer ?? "";
}

function themeFor(position: Position | null) {
  return position ? signLanguage[position.sign] ?? "busca una forma propia de comprender lo que vive" : "busca una forma propia de comprender lo que vive";
}

function strongestAspect(values: unknown[]): Aspect | null {
  const aspects = values.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const item = value as Record<string, unknown>;
    if (
      typeof item.from !== "string" ||
      typeof item.to !== "string" ||
      typeof item.type !== "string" ||
      typeof item.orb !== "number"
    ) return [];
    return [{ from: item.from, to: item.to, type: item.type, orb: item.orb }];
  });
  return aspects.sort((left, right) => left.orb - right.orb)[0] ?? null;
}

function aspectParagraph(aspect: Aspect | null) {
  if (!aspect) {
    return "No hay una única clave que explique tu manera de moverte. La lectura aparece en la combinación entre necesidades distintas, algunas más visibles y otras más silenciosas. Darles lugar sin obligarlas a coincidir de inmediato puede ser una forma fértil de conocerte.";
  }
  const from = planetFunction[aspect.from] ?? "una parte de tu experiencia";
  const to = planetFunction[aspect.to] ?? "otra necesidad interna";
  const tense = aspect.type === "cuadratura" || aspect.type === "oposición";
  return tense
    ? `Aparece una tensión significativa entre ${from} y ${to}. No indica una falla: señala dos necesidades legítimas que pueden pedir respuestas diferentes al mismo tiempo. Cuando una domina por completo, la otra suele reaparecer como incomodidad. El desarrollo está en construir una conversación entre ambas, no en elegir cuál debería desaparecer.`
    : `También aparece un recurso natural cuando se crea una colaboración entre ${from} y ${to}. Esa facilidad no siempre es evidente porque puede sentirse demasiado conocida, pero se vuelve valiosa cuando la utilizas de manera consciente. Allí hay una capacidad disponible para traducir comprensión en movimiento y sostener cambios sin perder tu centro.`;
}

export function generateRuleBasedReport(input: ReportInput): PersonalReport {
  const positions = input.chart.planets.map(positionFrom).filter((item): item is Position => Boolean(item));
  const sun = positions.find((item) => item.name === "Sol") ?? null;
  const moon = positions.find((item) => item.name === "Luna") ?? null;
  const ascendant = positionFrom(input.chart.ascendant);
  const currentSignal = input.answers[6]?.signals[0] ?? "direction-search";
  const aspect = strongestAspect(input.chart.aspects);

  const opening = `Hay una parte de ti que ${themeFor(sun)}. No es una definición cerrada, sino una dirección que suele ganar fuerza cuando puedes actuar sin separarte de lo que para ti tiene sentido. A la vez, tu mundo emocional ${themeFor(moon)}. Esa combinación puede hacer que lo que muestras y lo que necesitas por dentro no siempre avancen al mismo ritmo.`;

  const emotional = `${sentenceForSignal(input, 0)} ${sentenceForSignal(input, 1)} Juntas, estas respuestas sugieren que la claridad no depende únicamente de pensar mejor: aparece cuando emoción, criterio y tiempo consiguen encontrarse. Tu desafío no parece ser sentir menos, sino reconocer qué tipo de espacio necesita cada experiencia para volverse comprensible.`;

  const change = `${sentenceForSignal(input, 2)} ${ascendant ? `Tu manera de entrar en situaciones nuevas también ${themeFor(ascendant)}.` : "Como no contamos con una hora exacta, esta lectura evita atribuirte una forma fija de presentarte ante el mundo."} Puede haber una diferencia entre la velocidad con la que respondes y la velocidad con la que integras lo vivido. Respetar esa diferencia permite que la adaptación no se convierta en desconexión.`;

  const relationships = `${sentenceForSignal(input, 3)} ${sentenceForSignal(input, 4)} En los vínculos, esto puede expresarse como una negociación constante entre cercanía y protección. No se trata de elegir uno de los dos extremos, sino de construir relaciones donde puedas participar sin desaparecer y conservar autonomía sin convertirla en aislamiento.`;

  const desire = `${sentenceForSignal(input, 5)} El deseo parece funcionar como una fuente de información: muestra qué parte de ti está lista para ocupar más espacio. Sin embargo, su movimiento necesita conversar con tus mecanismos de seguridad y con la forma en que procesas las consecuencias. Cuando esas partes dejan de competir, la acción puede sentirse menos impulsiva y más propia.`;

  const present = `${sentenceForSignal(input, 6)} Esta etapa no exige una respuesta total e inmediata. Parece pedir atención a los movimientos pequeños que ya están ocurriendo: lo que empieza a perder sentido, lo que necesita estructura y aquello que insiste en ser escuchado. La dirección puede emerger menos de una certeza repentina que de varias decisiones coherentes sostenidas en el tiempo.`;

  const innerDialogue = aspectParagraph(aspect);

  const closing = `Tu carta y tus respuestas no cuentan una historia de rasgos inmóviles. Muestran una forma de buscar equilibrio entre profundidad y movimiento, autonomía y pertenencia, cautela y deseo. Quizás el hilo común sea la necesidad de que cada paso tenga verdad interna. Cuando esa verdad falta, incluso lo correcto puede sentirse ajeno; cuando aparece, el proceso encuentra una calma distinta.`;

  return {
    title: titleByCurrentSignal[currentSignal] ?? "Una dirección que empieza a tomar forma",
    reading: [opening, emotional, change, relationships, desire, innerDialogue, present, closing].join("\n\n"),
    reflection: "No necesitas resolver todas estas tensiones. Puede ser suficiente reconocer cuál está pidiendo más espacio en este momento.",
    question: "¿Qué decisión pequeña se sentiría hoy más fiel a tu propio ritmo?",
    disclaimer: "Lectura simbólica para la reflexión personal. No constituye orientación médica ni psicológica.",
  };
}
