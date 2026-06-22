import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { reportPrompt } from "./prompt.js";
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

export async function generatePersonalReport(input: ReportInput): Promise<PersonalReport> {
  const provider = (process.env.REPORT_PROVIDER || "rules").toLowerCase();
  if (provider === "rules") {
    return generateRuleBasedReport(input);
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
    disclaimer: "Lectura simbólica para la reflexión personal. No constituye orientación médica ni psicológica.",
  });
}
