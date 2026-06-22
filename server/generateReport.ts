import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { chartSynthesisPrompt, reportPrompt } from "./prompt.js";
import { generateRuleBasedReport } from "./fallbackReport.js";

const modelReportSchema = z.object({
  title: z.string(),
  reading: z.string(),
  reflection: z.string(),
  question: z.string(),
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

const chartSynthesisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    dominantPatterns: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dynamic: { type: "string" },
          evidence: { type: "string" },
          need: { type: "string" },
          tension: { type: "string" },
          resource: { type: "string" },
          everydayExpression: { type: "string" },
        },
        required: ["dynamic", "evidence", "need", "tension", "resource", "everydayExpression"],
      },
    },
    centralTension: { type: "string" },
    underestimatedResource: { type: "string" },
    visibleVersusNeeded: { type: "string" },
  },
  required: ["dominantPatterns", "centralTension", "underestimatedResource", "visibleVersusNeeded"],
};

const disclaimer = "Lectura simbólica para la reflexión personal. No constituye orientación médica ni psicológica.";

async function generateWithGemini(input: ReportInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada.");

  const client = new GoogleGenAI({ apiKey });
  const synthesisResponse = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: JSON.stringify(input.chart),
    config: {
      systemInstruction: chartSynthesisPrompt,
      responseMimeType: "application/json",
      responseJsonSchema: chartSynthesisJsonSchema,
      maxOutputTokens: 4096,
      temperature: 0.35,
      thinkingConfig: { thinkingBudget: 1024 },
    },
  });
  if (!synthesisResponse.text) throw new Error("Gemini no pudo sintetizar la carta natal.");

  const chartSynthesis = JSON.parse(synthesisResponse.text) as unknown;
  const modelInput = {
    sintesis_astrologica: chartSynthesis,
    respuestas_personales: input.answers.map(({ question, answer }) => ({ question, answer })),
  };
  const response = await client.models.generateContent({
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
  });

  if (!response.text) throw new Error("Gemini no devolvió un informe válido.");
  return reportSchema.parse({ ...JSON.parse(response.text), disclaimer });
}

export async function generatePersonalReport(input: ReportInput): Promise<PersonalReport> {
  const provider = (process.env.REPORT_PROVIDER || "rules").toLowerCase();
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no está configurada.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-5.5",
    store: false,
    instructions: reportPrompt,
    input: JSON.stringify(input),
    reasoning: { effort: "medium" },
    text: {
      verbosity: "medium",
      format: zodTextFormat(modelReportSchema, "personal_report"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI no devolvió un informe válido.");
  }
  return reportSchema.parse({
    ...response.output_parsed,
    disclaimer,
  });
}
