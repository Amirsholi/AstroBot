import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { contextualizedReportPrompt } from "./prompt.js";

const modelReportSchema = z.object({
  title: z.string().min(4),
  reading: z.string().min(900),
  virtues: z.string().min(120),
  closing: z.string().min(20),
});

export const reportSchema = modelReportSchema.extend({
  disclaimer: z.string(),
});

export type PersonalReport = z.infer<typeof reportSchema>;

type ChartPosition = {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number | null;
  retrograde: boolean;
};

type ChartAspect = {
  from: string;
  to: string;
  type: string;
  angle: number;
  orb: number;
};

type AnswerInterpretation = {
  lifeAxis: string;
  intensity: 1 | 2 | 3 | 4;
  mode: "confirm" | "activate" | "tension" | "contrast";
  themes: string[];
  astrologyTargets: {
    planets?: string[];
    houses?: number[];
    signs?: string[];
    aspects?: string[];
    elements?: string[];
    modalities?: string[];
  };
};

export type ReportInput = {
  chart: {
    accuracy: string;
    planets: unknown[];
    ascendant: unknown | null;
    midheaven: unknown | null;
    houses?: unknown[] | null;
    aspects: unknown[];
  };
  gender: "masculine" | "feminine";
  answers: Array<{ question: string; answer: string; interpretation: AnswerInterpretation }>;
};

const disclaimer = "Lectura simbolica para la reflexion personal. No constituye orientacion medica ni psicologica.";

const signMeta: Record<string, { element: string; modality: string; expression: string }> = {
  Aries: { element: "fuego", modality: "cardinal", expression: "iniciar, afirmar y entrar en movimiento" },
  Tauro: { element: "tierra", modality: "fixed", expression: "estabilizar, sostener y comprobar valor" },
  Geminis: { element: "aire", modality: "mutable", expression: "nombrar, relacionar y abrir posibilidades mentales" },
  Géminis: { element: "aire", modality: "mutable", expression: "nombrar, relacionar y abrir posibilidades mentales" },
  Cancer: { element: "agua", modality: "cardinal", expression: "proteger, recordar y elaborar pertenencia" },
  Cáncer: { element: "agua", modality: "cardinal", expression: "proteger, recordar y elaborar pertenencia" },
  Leo: { element: "fuego", modality: "fixed", expression: "expresar, irradiar y reclamar lugar propio" },
  Virgo: { element: "tierra", modality: "mutable", expression: "discernir, ajustar y volver util lo percibido" },
  Libra: { element: "aire", modality: "cardinal", expression: "vincular, contrastar y buscar reciprocidad" },
  Escorpio: { element: "agua", modality: "fixed", expression: "profundizar, intensificar y transformar" },
  Sagitario: { element: "fuego", modality: "mutable", expression: "ampliar, explorar y encontrar sentido" },
  Capricornio: { element: "tierra", modality: "cardinal", expression: "estructurar, resistir y construir a largo plazo" },
  Acuario: { element: "aire", modality: "fixed", expression: "diferenciarse, renovar y preservar autonomia" },
  Piscis: { element: "agua", modality: "mutable", expression: "sensibilizar, imaginar y percibir limites difusos" },
};

const planetFunction: Record<string, string> = {
  Sol: "centro consciente, vitalidad y direccion",
  Luna: "necesidad emocional, memoria afectiva y regulacion",
  Ascendente: "forma de entrar en la experiencia",
  "Medio Cielo": "direccion publica, vocacion y contribucion",
  Mercurio: "percepcion, pensamiento y comunicacion",
  Venus: "valoracion, vinculo y manera de recibir afecto",
  Marte: "deseo, accion y afirmacion",
  Jupiter: "expansion, confianza y sentido",
  Júpiter: "expansion, confianza y sentido",
  Saturno: "limite, responsabilidad, temor y maduracion",
  Urano: "independencia, ruptura y cambio",
  Neptuno: "sensibilidad, imaginacion e idealizacion",
  Pluton: "intensidad, poder interno y transformacion",
  Plutón: "intensidad, poder interno y transformacion",
};

const houseArea: Record<number, string> = {
  1: "presencia, iniciativa y forma de entrar en la vida",
  2: "recursos, sosten, valores y relacion con lo propio",
  3: "lenguaje, aprendizaje cercano y conexion de informacion",
  4: "raices, intimidad, pertenencia y base emocional",
  5: "creatividad, deseo de expresion y placer",
  6: "habitos, cuidado cotidiano, trabajo y ajuste",
  7: "encuentro con el otro, acuerdos y proyecciones vinculares",
  8: "intimidad profunda, recursos compartidos, perdida y transformacion",
  9: "creencias, vision de mundo, exploracion y sentido",
  10: "direccion publica, autoridad, contribucion y vocacion",
  11: "comunidad, amistades, ideales y futuro",
  12: "retiro, vida psiquica no visible, entrega y cierres",
};

function normalize(longitude: number) {
  return ((longitude % 360) + 360) % 360;
}

function distanceDegrees(a: number, b: number) {
  const raw = Math.abs(normalize(a) - normalize(b));
  return Math.min(raw, 360 - raw);
}

function parsePosition(value: unknown): ChartPosition | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.name !== "string" ||
    typeof item.longitude !== "number" ||
    typeof item.sign !== "string" ||
    typeof item.degree !== "number"
  ) return null;
  return {
    name: item.name,
    longitude: item.longitude,
    sign: item.sign,
    degree: item.degree,
    house: typeof item.house === "number" ? item.house : null,
    retrograde: item.retrograde === true,
  };
}

function parseAspect(value: unknown): ChartAspect | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.from !== "string" ||
    typeof item.to !== "string" ||
    typeof item.type !== "string" ||
    typeof item.angle !== "number" ||
    typeof item.orb !== "number"
  ) return null;
  return { from: item.from, to: item.to, type: item.type, angle: item.angle, orb: item.orb };
}

function positionEvidence(position: ChartPosition) {
  const house = position.house ? `, casa ${position.house}` : "";
  const retrograde = position.retrograde ? ", retrogrado" : "";
  return `${position.name} en ${position.sign} ${position.degree.toFixed(2)}°${house}${retrograde}`;
}

function aspectWeight(aspect: ChartAspect) {
  const personal = ["Sol", "Luna", "Mercurio", "Venus", "Marte"];
  const angles = ["Ascendente", "Medio Cielo"];
  const relevance = (name: string) => name === "Sol" || name === "Luna" ? 5 : personal.includes(name) ? 4 : angles.includes(name) ? 4 : 2;
  const tension = aspect.type === "cuadratura" || aspect.type === "oposicion" || aspect.type === "oposición" ? 2 : 0;
  return relevance(aspect.from) + relevance(aspect.to) + Math.max(0, 8 - aspect.orb) + tension;
}

function countBy<T extends string | number>(values: T[]) {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
}

function buildAstrologicalProfile(chart: ReportInput["chart"]) {
  const planets = chart.planets.map(parsePosition).filter((item): item is ChartPosition => Boolean(item));
  const ascendant = parsePosition(chart.ascendant);
  const midheaven = parsePosition(chart.midheaven);
  const allPositions = [...planets, ...(ascendant ? [ascendant] : []), ...(midheaven ? [midheaven] : [])];
  const aspects = chart.aspects.map(parseAspect).filter((item): item is ChartAspect => Boolean(item));

  const byName = new Map(allPositions.map((position) => [position.name, position]));
  const elements = countBy(planets.map((position) => signMeta[position.sign]?.element).filter((item): item is string => Boolean(item)));
  const modalities = countBy(planets.map((position) => signMeta[position.sign]?.modality).filter((item): item is string => Boolean(item)));
  const houseEmphasis = countBy(planets.map((position) => position.house).filter((item): item is number => typeof item === "number"));
  const retrogrades = planets.filter((position) => position.retrograde).map(positionEvidence);

  const angles = [
    ascendant ? { name: "Ascendente", longitude: ascendant.longitude } : null,
    ascendant ? { name: "Descendente", longitude: normalize(ascendant.longitude + 180) } : null,
    midheaven ? { name: "Medio Cielo", longitude: midheaven.longitude } : null,
    midheaven ? { name: "Fondo del Cielo", longitude: normalize(midheaven.longitude + 180) } : null,
  ].filter((item): item is { name: string; longitude: number } => Boolean(item));

  const angularPlanets = planets.flatMap((planet) => {
    const nearest = angles
      .map((angle) => ({ angle: angle.name, distance: distanceDegrees(planet.longitude, angle.longitude) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (!nearest || nearest.distance > 8) return [];
    return [`${positionEvidence(planet)} cerca de ${nearest.angle}, distancia ${nearest.distance.toFixed(2)}°`];
  });

  const primaryPositions = ["Sol", "Luna", "Ascendente", "Medio Cielo", "Mercurio", "Venus", "Marte", "Saturno"]
    .map((name) => byName.get(name))
    .filter((item): item is ChartPosition => Boolean(item))
    .map((position) => ({
      body: position.name,
      evidence: positionEvidence(position),
      function: planetFunction[position.name] ?? position.name,
      signExpression: signMeta[position.sign]?.expression ?? "expresion no clasificada",
      houseArea: position.house ? houseArea[position.house] : null,
    }));

  const strongestAspects = aspects
    .sort((a, b) => aspectWeight(b) - aspectWeight(a))
    .slice(0, 10)
    .map((aspect) => {
      const from = byName.get(aspect.from);
      const to = byName.get(aspect.to);
      return {
        evidence: `${aspect.type} ${aspect.from}-${aspect.to}, orbe ${aspect.orb}°`,
        dynamic: aspect.type,
        weight: Number(aspectWeight(aspect).toFixed(2)),
        from: from ? {
          body: from.name,
          function: planetFunction[from.name] ?? from.name,
          sign: from.sign,
          house: from.house,
        } : { body: aspect.from },
        to: to ? {
          body: to.name,
          function: planetFunction[to.name] ?? to.name,
          sign: to.sign,
          house: to.house,
        } : { body: aspect.to },
      };
    });

  const repeatedThemes = [
    ...elements.slice(0, 2).map((item) => `Enfasis de elemento ${item.value}: ${item.count} planetas`),
    ...modalities.slice(0, 2).map((item) => `Enfasis de modalidad ${item.value}: ${item.count} planetas`),
    ...houseEmphasis.slice(0, 3).map((item) => `Enfasis de casa ${item.value} (${houseArea[item.value]}): ${item.count} planetas`),
  ];

  return {
    source: "Swiss Ephemeris natal chart",
    accuracy: chart.accuracy,
    instruction: "La carta natal es la fuente principal. Interpreta configuraciones, no posiciones aisladas.",
    primaryPositions,
    strongestAspects,
    repeatedThemes,
    angularPlanets,
    retrogrades,
    fullPlacements: planets.map((position) => ({
      body: position.name,
      sign: position.sign,
      degree: Number(position.degree.toFixed(2)),
      house: position.house,
      retrograde: position.retrograde,
      function: planetFunction[position.name] ?? position.name,
      signExpression: signMeta[position.sign]?.expression ?? null,
      houseArea: position.house ? houseArea[position.house] : null,
    })),
  };
}

function buildAnswerContext(answers: ReportInput["answers"]) {
  return answers.map((answer) => ({
    lifeAxis: answer.interpretation.lifeAxis,
    selectedAnswer: answer.answer,
    intensity: answer.interpretation.intensity,
    mode: answer.interpretation.mode,
    themes: answer.interpretation.themes,
    astrologyTargets: answer.interpretation.astrologyTargets,
    rule: "Esta respuesta solo puede confirmar, activar, tensar o contrastar temas que ya existan en la carta natal.",
  }));
}

export async function generatePersonalReport(input: ReportInput): Promise<PersonalReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY no esta configurada.");

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const requestedOutputTokens = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 1600);
  const maxOutputTokens = Number.isFinite(requestedOutputTokens)
    ? Math.min(Math.max(Math.trunc(requestedOutputTokens), 1000), 2200)
    : 1600;

  const profile = buildAstrologicalProfile(input.chart);
  const answerContext = buildAnswerContext(input.answers);

  const response = await client.responses.parse({
    model,
    store: false,
    max_output_tokens: maxOutputTokens,
    instructions: contextualizedReportPrompt,
    input: JSON.stringify({
      redaccion: input.gender,
      perfil_astrologico: profile,
      respuestas_orientadas: answerContext,
    }),
    reasoning: { effort: "low" },
    text: {
      verbosity: "low",
      format: zodTextFormat(modelReportSchema, "personal_reading"),
    },
  });

  if (!response.output_parsed) throw new Error("OpenAI no devolvio una lectura valida.");
  return reportSchema.parse({ ...response.output_parsed, disclaimer });
}
