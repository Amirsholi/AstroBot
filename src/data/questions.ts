export type QuestionOption = {
  id: string;
  label: string;
  signals: string[];
};

export type Question = {
  id: string;
  prompt: string;
  options: QuestionOption[];
};

export const questions: Question[] = [
  {
    id: "emotional-response",
    prompt: "Cuando algo te mueve emocionalmente, ¿qué suele pasarte primero?",
    options: [
      {
        id: "understand",
        label: "Necesito tiempo para entender qué me pasa.",
        signals: ["introspection", "emotional-processing", "slow-clarity"],
      },
      {
        id: "share",
        label: "Necesito decirlo o compartirlo para ordenarme.",
        signals: ["verbal-processing", "connection", "emotional-expression"],
      },
      {
        id: "function",
        label: "Intento mantener la calma y seguir funcionando.",
        signals: ["self-control", "continuity", "emotional-containment"],
      },
      {
        id: "move",
        label: "Me ayuda moverme, hacer algo o cambiar de ambiente.",
        signals: ["action-regulation", "movement", "environmental-shift"],
      },
    ],
  },
  {
    id: "important-decision",
    prompt: "Cuando tienes que tomar una decisión importante, ¿qué pesa más?",
    options: [
      {
        id: "coherence",
        label: "Necesito que tenga sentido y sea coherente para mí.",
        signals: ["inner-coherence", "meaning", "personal-values"],
      },
      {
        id: "security",
        label: "Necesito sentir que no estoy arriesgando demasiado.",
        signals: ["security", "risk-awareness", "stability"],
      },
      {
        id: "intuition",
        label: "Me guío mucho por una sensación interna difícil de explicar.",
        signals: ["intuition", "embodied-knowing", "inner-guidance"],
      },
      {
        id: "impact",
        label: "Pienso en cómo va a afectar a las personas involucradas.",
        signals: ["relational-awareness", "empathy", "shared-impact"],
      },
    ],
  },
  {
    id: "sudden-change",
    prompt: "Cuando la vida cambia de golpe, ¿cuál suele ser tu reacción inicial?",
    options: [
      {
        id: "adapt",
        label: "Me adapto rápido, aunque por dentro tarde más en acomodarme.",
        signals: ["outer-adaptation", "delayed-inner-processing", "resilience"],
      },
      {
        id: "hold",
        label: "Primero me cuesta soltar lo que ya conocía.",
        signals: ["attachment-to-known", "transition-resistance", "need-for-stability"],
      },
      {
        id: "plan",
        label: "Necesito ordenar, planificar y entender el nuevo escenario.",
        signals: ["planning", "cognitive-processing", "need-for-structure"],
      },
      {
        id: "opening",
        label: "Lo vivo como una apertura, incluso si trae incertidumbre.",
        signals: ["openness-to-change", "possibility", "uncertainty-tolerance"],
      },
    ],
  },
  {
    id: "close-bonds",
    prompt: "En tus vínculos cercanos, ¿qué necesitas sentir para abrirte de verdad?",
    options: [
      {
        id: "trust",
        label: "Confianza construida con tiempo y hechos concretos.",
        signals: ["earned-trust", "consistency", "slow-opening"],
      },
      {
        id: "space",
        label: "Espacio para ser yo sin sentirme absorbido.",
        signals: ["autonomy", "boundaries", "non-fusion"],
      },
      {
        id: "presence",
        label: "Presencia emocional, atención y reciprocidad.",
        signals: ["emotional-presence", "reciprocity", "attunement"],
      },
      {
        id: "honesty",
        label: "Honestidad directa, incluso cuando incomoda.",
        signals: ["directness", "truthfulness", "conflict-capacity"],
      },
    ],
  },
  {
    id: "familiar-tension",
    prompt: "¿Cuál de estas situaciones te resulta más familiar?",
    options: [
      {
        id: "belonging",
        label: "Necesito sentir que pertenezco sin dejar de ser quien soy.",
        signals: ["belonging-autonomy", "identity", "need-for-inclusion"],
      },
      {
        id: "distance",
        label: "Valoro mucho mi independencia, aunque a veces me aleje demasiado.",
        signals: ["independence", "self-protection", "withdrawal-risk"],
      },
      {
        id: "weight",
        label: "Me cuesta pedir ayuda cuando llevo demasiado peso encima.",
        signals: ["over-responsibility", "self-reliance", "difficulty-receiving"],
      },
      {
        id: "voice",
        label: "Necesito sentir que mi voz tiene un lugar.",
        signals: ["recognition", "voice", "personal-significance"],
      },
    ],
  },
  {
    id: "desire",
    prompt: "Cuando algo despierta deseo o entusiasmo en ti, ¿cómo sueles actuar?",
    options: [
      {
        id: "direct",
        label: "Voy hacia eso con bastante claridad.",
        signals: ["direct-action", "desire-clarity", "initiative"],
      },
      {
        id: "observe",
        label: "Primero observo si realmente lo quiero.",
        signals: ["discernment", "observation", "pacing"],
      },
      {
        id: "doubt",
        label: "Me entusiasmo, pero puedo frenarme por dudas.",
        signals: ["enthusiasm", "self-doubt", "inhibition"],
      },
      {
        id: "intensity",
        label: "Lo vivo con intensidad y suele mover muchas cosas a mi alrededor.",
        signals: ["intensity", "transformative-desire", "environmental-impact"],
      },
    ],
  },
  {
    id: "current-stage",
    prompt: "¿Qué sensación aparece con más frecuencia en esta etapa de tu vida?",
    options: [
      {
        id: "closing",
        label: "Estoy dejando atrás algo que ya cumplió su ciclo.",
        signals: ["closure", "transition", "release"],
      },
      {
        id: "building",
        label: "Estoy construyendo algo que necesita paciencia.",
        signals: ["construction", "patience", "long-term-structure"],
      },
      {
        id: "direction",
        label: "Estoy buscando una dirección más clara.",
        signals: ["direction-search", "meaning", "uncertainty"],
      },
      {
        id: "change",
        label: "Estoy sintiendo el impulso de cambiar ciertas cosas.",
        signals: ["change-impulse", "authenticity", "activation"],
      },
    ],
  },
];
