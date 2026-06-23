import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { BirthData, NatalChart, PersonalReport } from "../types";

type ReportScreenProps = {
  birthData: BirthData;
  chart: NatalChart;
  report: PersonalReport;
  onRestart: () => void;
};

export function ReportScreen({ report, onRestart }: ReportScreenProps) {
  const paragraphs = report.reading.split(/\n{2,}/);

  return (
    <main className="report-screen report-screen--continuous">
      <motion.header
        className="report-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1>{report.title}</h1>
      </motion.header>

      <article className="continuous-reading">
        {paragraphs.map((paragraph, index) => (
          <motion.p
            key={paragraph.slice(0, 80)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + index * 0.24, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {paragraph}
          </motion.p>
        ))}
      </article>

      <motion.section
        className="continuous-reflection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 + paragraphs.length * 0.24, duration: 1.2 }}
      >
        <p>{report.virtues}</p>
        <blockquote>{report.closing}</blockquote>
      </motion.section>

      <footer className="report-footer">
        <p>{report.disclaimer}</p>
        <button type="button" onClick={onRestart}>
          <ArrowCounterClockwise aria-hidden="true" size={18} />
          Comenzar de nuevo
        </button>
      </footer>

    </main>
  );
}
