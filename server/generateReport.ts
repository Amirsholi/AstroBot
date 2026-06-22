import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { chartPatternPrompt, manifestationPrompt, reportPrompt } from "./prompt.js";
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

  const patternResponse = await client.responses.parse({
    model,
    store: false,
    instructions: chartPatternPrompt,
    input: JSON.stringify(input.chart),
    reasoning: { effort: "medium" },
    text: {
      verbosity: "medium",
      format: zodTextFormat(chartPatternModelSchema, "chart_patterns"),
    },
  });
  if (!patternResponse.output_parsed) throw new Error("OpenAI no pudo extraer los patrones de la carta natal.");
  const chartPatterns = chartPatternModelSchema.parse(patternResponse.output_parsed);

  const manifestationResponse = await client.responses.parse({
    model,
    store: false,
    instructions: manifestationPrompt,
    input: JSON.stringify({
      patrones_astrologicos: chartPatterns,
      respuestas_personales: input.answers.map(({ question, answer }) => ({ question, answer })),
    }),
    reasoning: { effort: "medium" },
    text: {
      verbosity: "medium",
      format: zodTextFormat(manifestationModelSchema, "current_manifestation"),
    },
  });
  if (!manifestationResponse.output_parsed) {
    throw new Error("OpenAI no pudo contrastar la carta y las respuestas.");
  }
  const manifestation = manifestationModelSchema.parse(manifestationResponse.output_parsed);
  validateManifestation(chartPatterns, manifestation);

  const reportResponse = await client.responses.parse({
    model,
    store: false,
    instructions: reportPrompt,
    input: JSON.stringify({
      patrones_astrologicos: chartPatterns,
      manifestacion_actual: manifestation,
    }),
    reasoning: { effort: "medium" },
    text: {
      verbosity: "medium",
      format: zodTextFormat(modelReportSchema, "personal_report"),
    },
  });
  if (!reportResponse.output_parsed) throw new Error("OpenAI no devolvió un informe válido.");

  return reportSchema.parse({ ...reportResponse.output_parsed, disclaimer });
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
