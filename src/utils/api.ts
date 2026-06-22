import { questions } from "../data/questions";
import type { Answer, BirthData, NatalChart, PersonalReport, PlaceSuggestion } from "../types";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    const fallbackMessage = response.status === 504
      ? "La lectura tardó más de lo esperado. Intenta nuevamente."
      : "No pudimos completar la solicitud.";
    throw new Error(payload?.error ?? fallbackMessage);
  }
  return response.json() as Promise<T>;
}

export async function searchPlaces(query: string, signal?: AbortSignal) {
  const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`, { signal });
  return parseResponse<PlaceSuggestion[]>(response);
}

export async function createNatalChart(birthData: BirthData) {
  const response = await fetch("/api/chart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(birthData),
  });
  return parseResponse<NatalChart>(response);
}

export async function createPersonalReport(chart: NatalChart, answers: Answer[]) {
  const answerPayload = answers.map((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    const option = question?.options.find((item) => item.id === answer.optionId);
    if (!question || !option) throw new Error("Una respuesta no coincide con el cuestionario.");
    return { question: question.prompt, answer: option.label, signals: option.signals };
  });

  const response = await fetch("/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chart, answers: answerPayload }),
  });
  return parseResponse<PersonalReport>(response);
}
