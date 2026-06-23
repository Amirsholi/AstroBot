export type LifeAxis =
  | "emotional-processing"
  | "decision-making"
  | "change-response"
  | "bonds"
  | "inner-tension"
  | "desire-action"
  | "identity-direction"
  | "current-stage";

export type InterpretationMode = "confirm" | "activate" | "tension" | "contrast";

export type AstrologyTargets = {
  planets?: string[];
  houses?: number[];
  signs?: string[];
  aspects?: string[];
  elements?: string[];
  modalities?: string[];
};

export type QuestionOption = {
  id: string;
  label: string;
  interpretation: {
    lifeAxis: LifeAxis;
    intensity: 1 | 2 | 3 | 4;
    mode: InterpretationMode;
    themes: string[];
    astrologyTargets: AstrologyTargets;
  };
};

export type Question = {
  id: LifeAxis;
  prompt: string;
  options: QuestionOption[];
};

export const questions: Question[] = [
  {
    id: "emotional-processing",
    prompt: "Cuando algo te mueve emocionalmente, que suele pasar primero?",
    options: [
      {
        id: "understand",
        label: "Necesito tiempo para entender que me pasa.",
        interpretation: {
          lifeAxis: "emotional-processing",
          intensity: 3,
          mode: "activate",
          themes: ["introspection", "slow-clarity", "emotional-containment"],
          astrologyTargets: { planets: ["Luna", "Saturno", "Mercurio"], houses: [4, 8, 12], aspects: ["cuadratura", "oposicion"], elements: ["agua", "tierra"] },
        },
      },
      {
        id: "share",
        label: "Necesito decirlo o compartirlo para ordenarme.",
        interpretation: {
          lifeAxis: "emotional-processing",
          intensity: 2,
          mode: "confirm",
          themes: ["verbal-processing", "emotional-expression", "relational-regulation"],
          astrologyTargets: { planets: ["Luna", "Mercurio", "Venus"], houses: [3, 7], signs: ["Geminis", "Libra"], elements: ["aire"] },
        },
      },
      {
        id: "function",
        label: "Intento mantener la calma y seguir funcionando.",
        interpretation: {
          lifeAxis: "emotional-processing",
          intensity: 3,
          mode: "tension",
          themes: ["self-control", "containment", "duty-over-feeling"],
          astrologyTargets: { planets: ["Luna", "Saturno", "Marte"], houses: [6, 10], signs: ["Capricornio", "Virgo"], aspects: ["cuadratura", "oposicion"] },
        },
      },
      {
        id: "move",
        label: "Me ayuda moverme, hacer algo o cambiar de ambiente.",
        interpretation: {
          lifeAxis: "emotional-processing",
          intensity: 2,
          mode: "contrast",
          themes: ["action-regulation", "body-movement", "environmental-shift"],
          astrologyTargets: { planets: ["Luna", "Marte", "Urano"], houses: [1, 3, 6], signs: ["Aries", "Sagitario", "Acuario"], modalities: ["cardinal", "mutable"] },
        },
      },
    ],
  },
  {
    id: "decision-making",
    prompt: "Cuando tienes que decidir algo importante, que pesa mas?",
    options: [
      {
        id: "coherence",
        label: "Necesito que tenga sentido y sea coherente para mi.",
        interpretation: {
          lifeAxis: "decision-making",
          intensity: 3,
          mode: "confirm",
          themes: ["inner-coherence", "meaning", "personal-values"],
          astrologyTargets: { planets: ["Sol", "Mercurio", "Jupiter"], houses: [2, 9], signs: ["Sagitario", "Acuario", "Leo"], elements: ["fuego", "aire"] },
        },
      },
      {
        id: "security",
        label: "Necesito sentir que no estoy arriesgando demasiado.",
        interpretation: {
          lifeAxis: "decision-making",
          intensity: 3,
          mode: "tension",
          themes: ["security", "risk-awareness", "stability"],
          astrologyTargets: { planets: ["Saturno", "Luna", "Venus"], houses: [2, 4, 10], signs: ["Tauro", "Cancer", "Capricornio"], elements: ["tierra", "agua"] },
        },
      },
      {
        id: "intuition",
        label: "Me guia una sensacion interna dificil de explicar.",
        interpretation: {
          lifeAxis: "decision-making",
          intensity: 2,
          mode: "activate",
          themes: ["intuition", "embodied-knowing", "nonlinear-perception"],
          astrologyTargets: { planets: ["Luna", "Neptuno", "Jupiter"], houses: [8, 9, 12], signs: ["Piscis", "Cancer", "Escorpio"], elements: ["agua"] },
        },
      },
      {
        id: "impact",
        label: "Pienso en como va a afectar a las personas involucradas.",
        interpretation: {
          lifeAxis: "decision-making",
          intensity: 2,
          mode: "confirm",
          themes: ["relational-awareness", "shared-impact", "reciprocity"],
          astrologyTargets: { planets: ["Venus", "Luna", "Mercurio"], houses: [7, 11], signs: ["Libra", "Cancer", "Acuario"], elements: ["aire", "agua"] },
        },
      },
    ],
  },
  {
    id: "change-response",
    prompt: "Cuando la vida cambia de golpe, cual es tu reaccion inicial?",
    options: [
      {
        id: "adapt",
        label: "Me adapto rapido, aunque por dentro tarde mas.",
        interpretation: {
          lifeAxis: "change-response",
          intensity: 3,
          mode: "contrast",
          themes: ["outer-adaptation", "delayed-inner-processing", "dual-speed"],
          astrologyTargets: { planets: ["Ascendente", "Luna", "Urano"], houses: [1, 4], signs: ["Geminis", "Sagitario", "Acuario"], modalities: ["mutable"] },
        },
      },
      {
        id: "hold",
        label: "Primero me cuesta soltar lo que ya conocia.",
        interpretation: {
          lifeAxis: "change-response",
          intensity: 3,
          mode: "tension",
          themes: ["attachment-to-known", "transition-resistance", "stability-need"],
          astrologyTargets: { planets: ["Luna", "Saturno", "Venus"], houses: [2, 4, 8], signs: ["Tauro", "Cancer", "Escorpio"], modalities: ["fixed"] },
        },
      },
      {
        id: "plan",
        label: "Necesito ordenar, planificar y entender el nuevo escenario.",
        interpretation: {
          lifeAxis: "change-response",
          intensity: 2,
          mode: "activate",
          themes: ["planning", "structure", "cognitive-control"],
          astrologyTargets: { planets: ["Mercurio", "Saturno"], houses: [3, 6, 10], signs: ["Virgo", "Capricornio"], elements: ["tierra"] },
        },
      },
      {
        id: "opening",
        label: "Lo vivo como una apertura, incluso si trae incertidumbre.",
        interpretation: {
          lifeAxis: "change-response",
          intensity: 2,
          mode: "confirm",
          themes: ["openness-to-change", "possibility", "uncertainty-tolerance"],
          astrologyTargets: { planets: ["Urano", "Jupiter", "Marte"], houses: [9, 11], signs: ["Sagitario", "Acuario", "Aries"], elements: ["fuego", "aire"] },
        },
      },
    ],
  },
  {
    id: "bonds",
    prompt: "En un vinculo cercano, que necesitas para abrirte de verdad?",
    options: [
      {
        id: "trust",
        label: "Confianza construida con tiempo y hechos concretos.",
        interpretation: {
          lifeAxis: "bonds",
          intensity: 3,
          mode: "confirm",
          themes: ["earned-trust", "consistency", "slow-opening"],
          astrologyTargets: { planets: ["Venus", "Luna", "Saturno"], houses: [4, 7, 8], signs: ["Tauro", "Cancer", "Capricornio"], elements: ["tierra", "agua"] },
        },
      },
      {
        id: "space",
        label: "Espacio para ser yo sin sentirme absorbido.",
        interpretation: {
          lifeAxis: "bonds",
          intensity: 4,
          mode: "tension",
          themes: ["autonomy", "boundaries", "non-fusion"],
          astrologyTargets: { planets: ["Venus", "Luna", "Urano"], houses: [1, 7, 11], signs: ["Acuario", "Aries", "Escorpio"], aspects: ["oposicion", "cuadratura"] },
        },
      },
      {
        id: "presence",
        label: "Presencia emocional, atencion y reciprocidad.",
        interpretation: {
          lifeAxis: "bonds",
          intensity: 3,
          mode: "activate",
          themes: ["emotional-presence", "reciprocity", "attunement"],
          astrologyTargets: { planets: ["Luna", "Venus"], houses: [4, 7], signs: ["Cancer", "Libra", "Piscis"], elements: ["agua", "aire"] },
        },
      },
      {
        id: "honesty",
        label: "Honestidad directa, incluso cuando incomoda.",
        interpretation: {
          lifeAxis: "bonds",
          intensity: 3,
          mode: "contrast",
          themes: ["directness", "truthfulness", "conflict-capacity"],
          astrologyTargets: { planets: ["Mercurio", "Marte", "Pluton"], houses: [3, 7, 8], signs: ["Aries", "Escorpio", "Sagitario"], aspects: ["conjuncion", "cuadratura"] },
        },
      },
    ],
  },
  {
    id: "inner-tension",
    prompt: "Cual de estas situaciones te resulta mas familiar?",
    options: [
      {
        id: "belonging",
        label: "Necesito pertenecer sin dejar de ser quien soy.",
        interpretation: {
          lifeAxis: "inner-tension",
          intensity: 4,
          mode: "tension",
          themes: ["belonging-autonomy", "identity", "inclusion-with-difference"],
          astrologyTargets: { planets: ["Sol", "Luna", "Urano"], houses: [1, 4, 7, 11], signs: ["Acuario", "Libra", "Cancer"], aspects: ["oposicion", "cuadratura"] },
        },
      },
      {
        id: "distance",
        label: "Valoro mi independencia, aunque a veces me aleje demasiado.",
        interpretation: {
          lifeAxis: "inner-tension",
          intensity: 4,
          mode: "contrast",
          themes: ["independence", "self-protection", "withdrawal-risk"],
          astrologyTargets: { planets: ["Urano", "Saturno", "Luna"], houses: [1, 7, 11, 12], signs: ["Acuario", "Capricornio", "Escorpio"], modalities: ["fixed"] },
        },
      },
      {
        id: "weight",
        label: "Me cuesta pedir ayuda cuando llevo demasiado peso.",
        interpretation: {
          lifeAxis: "inner-tension",
          intensity: 4,
          mode: "activate",
          themes: ["over-responsibility", "self-reliance", "difficulty-receiving"],
          astrologyTargets: { planets: ["Saturno", "Luna", "Venus"], houses: [6, 10, 12], signs: ["Capricornio", "Virgo", "Cancer"], elements: ["tierra"] },
        },
      },
      {
        id: "voice",
        label: "Necesito sentir que mi voz tiene un lugar.",
        interpretation: {
          lifeAxis: "inner-tension",
          intensity: 3,
          mode: "confirm",
          themes: ["recognition", "voice", "personal-significance"],
          astrologyTargets: { planets: ["Sol", "Mercurio", "Medio Cielo"], houses: [3, 5, 10], signs: ["Leo", "Geminis", "Acuario"], elements: ["fuego", "aire"] },
        },
      },
    ],
  },
  {
    id: "desire-action",
    prompt: "Cuando algo despierta deseo o entusiasmo en ti, como sueles actuar?",
    options: [
      {
        id: "direct",
        label: "Voy hacia eso con bastante claridad.",
        interpretation: {
          lifeAxis: "desire-action",
          intensity: 3,
          mode: "confirm",
          themes: ["direct-action", "desire-clarity", "initiative"],
          astrologyTargets: { planets: ["Marte", "Sol"], houses: [1, 5], signs: ["Aries", "Leo", "Sagitario"], elements: ["fuego"], modalities: ["cardinal"] },
        },
      },
      {
        id: "observe",
        label: "Primero observo si realmente lo quiero.",
        interpretation: {
          lifeAxis: "desire-action",
          intensity: 2,
          mode: "contrast",
          themes: ["discernment", "pacing", "desire-observation"],
          astrologyTargets: { planets: ["Venus", "Saturno", "Mercurio"], houses: [2, 6], signs: ["Tauro", "Virgo", "Capricornio"], elements: ["tierra"] },
        },
      },
      {
        id: "doubt",
        label: "Me entusiasmo, pero puedo frenarme por dudas.",
        interpretation: {
          lifeAxis: "desire-action",
          intensity: 4,
          mode: "tension",
          themes: ["enthusiasm", "self-doubt", "inhibition"],
          astrologyTargets: { planets: ["Marte", "Saturno", "Mercurio"], houses: [1, 5, 6, 10], aspects: ["cuadratura", "oposicion"], signs: ["Aries", "Capricornio", "Virgo"] },
        },
      },
      {
        id: "intensity",
        label: "Lo vivo con intensidad y suele mover muchas cosas.",
        interpretation: {
          lifeAxis: "desire-action",
          intensity: 4,
          mode: "activate",
          themes: ["intensity", "transformative-desire", "environmental-impact"],
          astrologyTargets: { planets: ["Marte", "Venus", "Pluton"], houses: [5, 8], signs: ["Escorpio", "Aries", "Leo"], aspects: ["conjuncion", "cuadratura"] },
        },
      },
    ],
  },
  {
    id: "identity-direction",
    prompt: "Cuando piensas en el lugar que quieres ocupar, que aparece primero?",
    options: [
      {
        id: "clarity-before-showing",
        label: "Necesito mas claridad antes de mostrarme.",
        interpretation: {
          lifeAxis: "identity-direction",
          intensity: 3,
          mode: "contrast",
          themes: ["visibility-delay", "self-definition", "inner-preparation"],
          astrologyTargets: { planets: ["Sol", "Ascendente", "Saturno"], houses: [1, 5, 10], signs: ["Capricornio", "Virgo", "Piscis"], aspects: ["cuadratura", "oposicion"] },
        },
      },
      {
        id: "own-expression",
        label: "Siento que algo propio todavia no termina de expresarse.",
        interpretation: {
          lifeAxis: "identity-direction",
          intensity: 4,
          mode: "activate",
          themes: ["latent-expression", "identity-emergence", "creative-self"],
          astrologyTargets: { planets: ["Sol", "Mercurio", "Venus"], houses: [1, 5, 10], signs: ["Leo", "Acuario", "Piscis"], elements: ["fuego", "aire"] },
        },
      },
      {
        id: "recognizable-work",
        label: "Me importa construir algo reconocible y consistente.",
        interpretation: {
          lifeAxis: "identity-direction",
          intensity: 3,
          mode: "confirm",
          themes: ["public-form", "consistency", "long-term-construction"],
          astrologyTargets: { planets: ["Sol", "Saturno", "Medio Cielo"], houses: [2, 6, 10], signs: ["Tauro", "Virgo", "Capricornio"], elements: ["tierra"] },
        },
      },
      {
        id: "free-role",
        label: "Prefiero moverme libremente antes que quedar definido por un rol.",
        interpretation: {
          lifeAxis: "identity-direction",
          intensity: 4,
          mode: "tension",
          themes: ["freedom-from-role", "nonconformity", "identity-mobility"],
          astrologyTargets: { planets: ["Sol", "Urano", "Jupiter"], houses: [1, 9, 11], signs: ["Acuario", "Sagitario", "Aries"], elements: ["aire", "fuego"] },
        },
      },
    ],
  },
  {
    id: "current-stage",
    prompt: "Que sensacion aparece con mas frecuencia en esta etapa de tu vida?",
    options: [
      {
        id: "closing",
        label: "Estoy dejando atras algo que ya cumplio su ciclo.",
        interpretation: {
          lifeAxis: "current-stage",
          intensity: 2,
          mode: "activate",
          themes: ["closure", "transition", "ending-cycle"],
          astrologyTargets: { planets: ["Luna", "Saturno", "Pluton", "Neptuno"], houses: [8, 12, 4], signs: ["Escorpio", "Piscis", "Capricornio"] },
        },
      },
      {
        id: "building",
        label: "Estoy construyendo algo que necesita paciencia.",
        interpretation: {
          lifeAxis: "current-stage",
          intensity: 2,
          mode: "activate",
          themes: ["construction", "patience", "long-term-structure"],
          astrologyTargets: { planets: ["Saturno", "Sol", "Medio Cielo"], houses: [2, 6, 10], signs: ["Tauro", "Virgo", "Capricornio"], elements: ["tierra"] },
        },
      },
      {
        id: "direction",
        label: "Estoy buscando una direccion mas clara.",
        interpretation: {
          lifeAxis: "current-stage",
          intensity: 2,
          mode: "activate",
          themes: ["direction-search", "meaning", "orientation"],
          astrologyTargets: { planets: ["Sol", "Jupiter", "Mercurio", "Medio Cielo"], houses: [9, 10, 11], signs: ["Sagitario", "Acuario", "Leo"] },
        },
      },
      {
        id: "change",
        label: "Estoy sintiendo el impulso de cambiar ciertas cosas.",
        interpretation: {
          lifeAxis: "current-stage",
          intensity: 2,
          mode: "activate",
          themes: ["change-impulse", "activation", "inner-restlessness"],
          astrologyTargets: { planets: ["Urano", "Marte", "Pluton"], houses: [1, 8, 11], signs: ["Acuario", "Aries", "Escorpio"], aspects: ["cuadratura", "conjuncion"] },
        },
      },
    ],
  },
];
