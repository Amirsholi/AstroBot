import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { AnimatedScreen } from "./components/AnimatedScreen";
import { Layout } from "./components/Layout";
import { BirthDataScreen } from "./screens/BirthDataScreen";
import { LoadingScreen } from "./screens/LoadingScreen";
import { QuestionsScreen } from "./screens/QuestionsScreen";
import { ReportScreen } from "./screens/ReportScreen";
import { createNatalChart, createPersonalReport } from "./utils/api";
import type { Answer, BirthData, JourneyScreen, NatalChart, PersonalReport } from "./types";

export default function App() {
  const [screen, setScreen] = useState<JourneyScreen>("birth-data");
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [report, setReport] = useState<PersonalReport | null>(null);
  const [reportError, setReportError] = useState("");

  async function startQuestions(data: BirthData) {
    const nextChart = await createNatalChart(data);
    setBirthData(data);
    setChart(nextChart);
    setScreen("questions");
  }

  async function finishQuestions(nextAnswers: Answer[]) {
    setAnswers(nextAnswers);
    setScreen("processing");
    setReportError("");
    if (!chart) {
      setReportError("La carta natal no está disponible.");
      return;
    }
    try {
      const [nextReport] = await Promise.all([
        createPersonalReport(chart, nextAnswers, birthData?.gender ?? "feminine"),
        new Promise<void>((resolve) => window.setTimeout(resolve, 2800)),
      ]);
      setReport(nextReport);
      setScreen("report");
    } catch (error) {
      setReportError(error instanceof Error ? error.message : "No pudimos generar la devolución.");
    }
  }

  function retryReport() {
    void finishQuestions(answers);
  }

  function restart() {
    setBirthData(null);
    setChart(null);
    setAnswers([]);
    setReport(null);
    setReportError("");
    setScreen("birth-data");
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <AnimatedScreen className="screen-transition" key={screen}>
          {screen === "birth-data" && <BirthDataScreen onSubmit={startQuestions} />}
          {screen === "questions" && (
            <QuestionsScreen initialAnswers={answers} onComplete={finishQuestions} />
          )}
          {screen === "processing" && (
            <LoadingScreen error={reportError} onRetry={retryReport} />
          )}
          {screen === "report" && birthData && chart && report && (
            <ReportScreen birthData={birthData} chart={chart} report={report} onRestart={restart} />
          )}
        </AnimatedScreen>
      </AnimatePresence>
    </Layout>
  );
}
