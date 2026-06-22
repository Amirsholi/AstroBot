import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { chartPatternPrompt, contextualizedReportPrompt, manifestationPrompt, reportPrompt } from "./prompt.js";
import { generateRuleBasedReport } from "./fallbackReport.js";

const modelReportSchema = z.object({
  title: z.string().min(4),
  reading: z.string().min(1200),
  reflection: z.string().min(20),
  question: z.string().min(10),
});

export const reportSchema = modelReportSchema.extend({
  disclaimer: z.string(),
});

export type PersonalReport = z.infer<typeof reportSchema>;

export type ReportInput = {
  chart: {
    accuracy: string;
    planets: unknown[];
    ascendant: unknown | null;
    midheaven: unknown | null;
    aspects: unknown[];
  };
  answers: Array<{ question: string; answer: string; signals: string[] }>;
};

const reportJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    reading: { type: "string" },
    reflection: { type: "string" },
    question: { type: "string" },
  },
  required: ["title", "reading", "reflection", "question"],
};

const chartPatternModelSchema = z.object({
  patterns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    evidence: z.array(z.string()),
    mechanism: z.string(),
    weight: z.number().int().min(1).max(5),
  })).length(5),
});

const manifestationItemSchema = z.object({
  patternId: z.string(),
  manifestation: z.string(),
});

const manifestationModelSchema = z.object({
  confirmed: z.array(manifestationItemSchema),
  active: z.array(manifestationItemSchema),
  tension: z.array(manifestationItemSchema),
  notObserved: z.array(z.string()),
});

const contextualizedReportSchema = z.object({
  manifestation: manifestationModelSchema,
  report: modelReportSchema,
});

const chartPatternJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    patterns: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          evidence: { type: "array", items: { type: "string" } },
          mechanism: { type: "string" },
          weight: { type: "integer", minimum: 1, maximum: 5 },
        },
        required: ["id", "name", "evidence", "mechanism", "weight"],
      },
    },
  },
  required: ["patterns"],
};

const manifestationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    confirmed: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { patternId: { type: "string" }, manifestation: { type: "string" } },
        required: ["patternId", "manifestation"],
      },
    },
    active: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { patternId: { type: "string" }, manifestation: { type: "string" } },
        required: ["patternId", "manifestation"],
      },
    },
    tension: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { patternId: { type: "string" }, manifestation: { type: "string" } },
        required: ["patternId", "manifestation"],
      },
    },
    notObserved: { type: "array", items: { type: "string" } },
  },
  required: ["confirmed", "active", "tension", "notObserved"],
};

const disclaimer = "Lectura simbólica para la reflexión personal. No constituye orientación médica ni psicológica.";

const planetFunctions: Record<string, string> = {
  Sol: "dirección consciente",
  Luna: "regulación emocional",
  Mercurio: "pensamiento y palabra",
  Venus: "vínculo y valoración",
  Marte: "deseo y acción",
  Júpiter: "expansión y significado",
  Saturno: "estructura y límite",
  Urano: "cambio e independencia",
  Neptuno: "sensibilidad e imaginación",
  Plutón: "intensidad y transformación",
};

const houseAreas: Record<number, string> = {
  1: "presencia e iniciativa", 2: "recursos y valores", 3: "lenguaje y aprendizaje",
  4: "intimidad y pertenencia", 5: "creatividad y expresión", 6: "hábitos y trabajo cotidiano",
  7: "vínculos y acuerdos", 8: "intimidad profunda y transformación", 9: "visión y creencias",
  10: "dirección pública y vocación", 11: "comunidad y futuro", 12: "vida interior y cierres",
};

type ParsedPosition = { name: string; sign: string; house: number | null };
type ParsedAspect = { from: string; to: string; type: string; orb: number };

function parsePosition(value: unknown): ParsedPosition | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.name !== "string" || typeof item.sign !== "string") return null;
  return { name: item.name, sign: item.sign, house: typeof item.house === "number" ? item.house : null };
}

function parseAspect(value: unknown): ParsedAspect | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.from !== "string" || typeof item.to !== "string" || typeof item.type !== "string" || typeof item.orb !== "number") return null;
  return { from: item.from, to: item.to, type: item.type, orb: item.orb };
}

function positionEvidence(position: ParsedPosition) {
  return `${position.name} en ${position.sign}${position.house ? `, casa ${position.house}` : ""}`;
}

function buildChartPatterns(chart: ReportInput["chart"]) {
  const positions = chart.planets.map(parsePosition).filter((item): item is ParsedPosition => Boolean(item));
  const byName = new Map(positions.map((position) => [position.name, position]));
  const relevance = (name: string) => name === "Sol" || name === "Luna" ? 4 : ["Mercurio", "Venus", "Marte"].includes(name) ? 3 : 1;
  const aspectDynamics: Record<string, string> = {
    conjunción: "se fusiona con",
    oposición: "oscila frente a",
    cuadratura: "entra en fricción con",
    trígono: "fluye junto a",
    sextil: "encuentra una vía de cooperación con",
  };

  const aspects = chart.aspects.map(parseAspect).filter((item): item is ParsedAspect => Boolean(item))
    .sort((left, right) => {
      const score = (aspect: ParsedAspect) => relevance(aspect.from) + relevance(aspect.to) + Math.max(0, 8 - aspect.orb);
      return score(right) - score(left);
    })
    .slice(0, 4);

  const patterns = aspects.flatMap((aspect, index) => {
    const from = byName.get(aspect.from);
    const to = byName.get(aspect.to);
    if (!from || !to) return [];
    const fromFunction = planetFunctions[from.name] ?? from.name;
    const toFunction = planetFunctions[to.name] ?? to.name;
    const dynamic = aspectDynamics[aspect.type] ?? "se relaciona con";
    const fromArea = from.house ? houseAreas[from.house] : null;
    const toArea = to.house ? houseAreas[to.house] : null;
    return [{
      id: `aspect-${index + 1}`,
      name: `${fromFunction} ${dynamic} ${toFunction}`,
      evidence: [positionEvidence(from), positionEvidence(to), `${aspect.type} ${from.name}-${to.name}, orbe ${aspect.orb}°`],
      mechanism: `La ${fromFunction}, expresada desde ${from.sign}${fromArea ? ` en ${fromArea}` : ""}, ${dynamic} la ${toFunction}, expresada desde ${to.sign}${toArea ? ` en ${toArea}` : ""}.`,
      weight: Math.max(2, 5 - index),
    }];
  });

  const sun = byName.get("Sol");
  const moon = byName.get("Luna");
  const ascendant = parsePosition(chart.ascendant);
  if (sun && moon) {
    patterns.unshift({
      id: "core-configuration",
      name: `Dirigir desde ${sun.sign} mientras la emoción responde desde ${moon.sign}`,
      evidence: [positionEvidence(sun), positionEvidence(moon), ...(ascendant ? [positionEvidence(ascendant)] : [])],
      mechanism: `La dirección consciente adopta el modo de ${sun.sign}, mientras la regulación emocional responde desde ${moon.sign}${ascendant ? ` y la entrada visible a la experiencia ocurre desde ${ascendant.sign}` : ""}.`,
      weight: 5,
    });
  }

  const fillers = positions.filter((position) => ["Mercurio", "Venus", "Marte", "Saturno"].includes(position.name));
  for (const position of fillers) {
    if (patterns.length >= 5) break;
    patterns.push({
      id: `placement-${position.name.toLowerCase()}`,
      name: `${planetFunctions[position.name] ?? position.name} expresada desde ${position.sign}`,
      evidence: [positionEvidence(position)],
      mechanism: `La función de ${planetFunctions[position.name] ?? position.name} opera al modo de ${position.sign}${position.house ? ` en el ámbito de ${houseAreas[position.house]}` : ""}.`,
      weight: 2,
    });
  }

  return chartPatternModelSchema.parse({ patterns: patterns.slice(0, 5) });
}

function validateManifestation(
  chartPatterns: z.infer<typeof chartPatternModelSchema>,
  manifestation: z.infer<typeof manifestationModelSchema>,
) {
  const patternIds = new Set(chartPatterns.patterns.map((pattern) => pattern.id));
  const observed = [...manifestation.confirmed, ...manifestation.active, ...manifestation.tension];
  const referencedIds = [...observed.map((item) => item.patternId), ...manifestation.notObserved];

  if (observed.length > 3) {
    throw new Error("El contraste dio demasiado peso al cuestionario.");
  }
  if (referencedIds.some((id) => !patternIds.has(id))) {
    throw new Error("El contraste introdujo un tema que no existe en la carta.");
  }
  if (new Set(referencedIds).size !== referencedIds.length) {
    throw new Error("El contraste clasificó un patrón más de una vez.");
  }
}

function upstreamStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return 0;
  if ("status" in error && typeof error.status === "number") return error.status;
  if ("error" in error && typeof error.error === "object" && error.error !== null && "code" in error.error) {
    return Number(error.error.code) || 0;
  }
  return 0;
}

async function retryTemporaryFailure<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (upstreamStatus(error) !== 503) throw error;
    await new Promise((resolve) => setTimeout(resolve, 900));
    return operation();
  }
}

async function generateWithGemini(input: ReportInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada.");

  const client = new GoogleGenAI({ apiKey });
  const patternResponse = await retryTemporaryFailure(() => client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: JSON.stringify(input.chart),
    config: {
      systemInstruction: chartPatternPrompt,
      responseMimeType: "application/json",
      responseJsonSchema: chartPatternJsonSchema,
      maxOutputTokens: 4096,
      temperature: 0.25,
      thinkingConfig: { thinkingBudget: 1024 },
    },
  }));
  if (!patternResponse.text) throw new Error("Gemini no pudo extraer los patrones de la carta natal.");
  const chartPatterns = chartPatternModelSchema.parse(JSON.parse(patternResponse.text));

  const manifestationResponse = await retryTemporaryFailure(() => client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: JSON.stringify({
      patrones_astrologicos: chartPatterns,
      respuestas_personales: input.answers.map(({ question, answer }) => ({ question, answer })),
    }),
    config: {
      systemInstruction: manifestationPrompt,
      responseMimeType: "application/json",
      responseJsonSchema: manifestationJsonSchema,
      maxOutputTokens: 3072,
      temperature: 0.2,
      thinkingConfig: { thinkingBudget: 512 },
    },
  }));
  if (!manifestationResponse.text) throw new Error("Gemini no pudo contrastar la carta y las respuestas.");
  const manifestation = manifestationModelSchema.parse(JSON.parse(manifestationResponse.text));
  validateManifestation(chartPatterns, manifestation);

  const modelInput = {
    patrones_astrologicos: chartPatterns,
    manifestacion_actual: manifestation,
  };
  const response = await retryTemporaryFailure(() => client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: JSON.stringify(modelInput),
    config: {
      systemInstruction: reportPrompt,
      responseMimeType: "application/json",
      responseJsonSchema: reportJsonSchema,
      maxOutputTokens: 8192,
      temperature: 0.68,
      thinkingConfig: { thinkingBudget: 1024 },
    },
  }));

  if (!response.text) throw new Error("Gemini no devolvió un informe válido.");
  return reportSchema.parse({ ...JSON.parse(response.text), disclaimer });
}

async function generateWithOpenAI(input: ReportInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY no está configurada.");

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-5.5-pro-2026-04-23";

  const chartPatterns = buildChartPatterns(input.chart);

  const finalResponse = await client.responses.parse({
    model,
    store: false,
    instructions: contextualizedReportPrompt,
    input: JSON.stringify({
      patrones_astrologicos: chartPatterns,
      respuestas_personales: input.answers.map(({ question, answer }) => ({ question, answer })),
    }),
    reasoning: { effort: "medium" },
    text: {
      verbosity: "medium",
      format: zodTextFormat(contextualizedReportSchema, "contextualized_report"),
    },
  });
  if (!finalResponse.output_parsed) throw new Error("OpenAI no devolvió un informe válido.");
  const finalResult = contextualizedReportSchema.parse(finalResponse.output_parsed);
  validateManifestation(chartPatterns, finalResult.manifestation);

  return reportSchema.parse({ ...finalResult.report, disclaimer });
}

export async function generatePersonalReport(input: ReportInput): Promise<PersonalReport> {
  const provider = (process.env.REPORT_PROVIDER || "openai").toLowerCase();
  if (provider === "rules") {
    return generateRuleBasedReport(input);
  }
  if (provider === "gemini") {
    try {
      return await generateWithGemini(input);
    } catch (error) {
      if ((process.env.REPORT_FALLBACK || "rules").toLowerCase() === "rules") {
        console.error("Gemini report failed; using local fallback", error instanceof Error ? error.message : error);
        return generateRuleBasedReport(input);
      }
      throw error;
    }
  }
  if (provider !== "openai") {
    throw new Error(`REPORT_PROVIDER no soportado: ${provider}`);
  }

  return generateWithOpenAI(input);
}
