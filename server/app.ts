import "dotenv/config";
import express from "express";
import { calculateNatalChart, type ChartRequest } from "./astrology.js";
import { findPlaces } from "./places.js";
import { generatePersonalReport } from "./generateReport.js";

export const app = express();

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/places", async (request, response) => {
  const query = typeof request.query.q === "string" ? request.query.q.trim() : "";
  if (query.length < 2) return response.json([]);
  try {
    response.json(await findPlaces(query));
  } catch (error) {
    response.status(502).json({ error: error instanceof Error ? error.message : "No se pudieron buscar lugares." });
  }
});

app.post("/api/chart", (request, response) => {
  try {
    const payload = request.body as ChartRequest;
    if (!payload?.date || !payload?.place?.timezone) {
      return response.status(400).json({ error: "Faltan datos de nacimiento." });
    }
    if (!Number.isFinite(payload.place.latitude) || !Number.isFinite(payload.place.longitude)) {
      return response.status(400).json({ error: "La ubicación no es válida." });
    }
    response.json(calculateNatalChart(payload));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "No se pudo calcular la carta." });
  }
});

app.post("/api/report", async (request, response) => {
  try {
    const { chart, answers } = request.body as {
      chart?: {
        accuracy?: string;
        planets?: unknown[];
        ascendant?: unknown | null;
        midheaven?: unknown | null;
        aspects?: unknown[];
      };
      answers?: Array<{ question?: string; answer?: string; signals?: string[] }>;
    };

    if (!chart?.accuracy || !Array.isArray(chart.planets) || !Array.isArray(chart.aspects)) {
      return response.status(400).json({ error: "La carta natal no es válida." });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return response.status(400).json({ error: "Faltan respuestas personales." });
    }
    if (answers.some((item) => !item.question || !item.answer || !Array.isArray(item.signals))) {
      return response.status(400).json({ error: "Las respuestas no son válidas." });
    }
    if ((process.env.REPORT_PROVIDER || "rules").toLowerCase() === "openai" && !process.env.OPENAI_API_KEY) {
      return response.status(503).json({ error: "La generación con IA todavía no está configurada." });
    }

    const report = await generatePersonalReport({
      chart: {
        accuracy: chart.accuracy,
        planets: chart.planets,
        ascendant: chart.ascendant ?? null,
        midheaven: chart.midheaven ?? null,
        aspects: chart.aspects,
      },
      answers: answers as Array<{ question: string; answer: string; signals: string[] }>,
    });
    response.json(report);
  } catch (error) {
    const upstreamStatus = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : 0;
    console.error("Report generation failed", error instanceof Error ? error.message : error);
    if (upstreamStatus === 429) {
      return response.status(429).json({
        error: "La cuenta de OpenAI no tiene cuota disponible. Revisa el saldo o la facturación.",
      });
    }
    if (upstreamStatus === 401) {
      return response.status(503).json({
        error: "La credencial de OpenAI no es válida o fue revocada.",
      });
    }
    response.status(502).json({ error: "No pudimos generar la devolución. Intenta nuevamente." });
  }
});

export default app;
