import { motion, useReducedMotion } from "motion/react";

export function GeneratingReading() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="generating-reading" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Preparando tu lectura.</span>
      <motion.div
        aria-hidden="true"
        className="generating-reading__light"
        animate={reduceMotion ? { opacity: 0.55 } : { opacity: [0.28, 0.72, 0.28], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />
    </main>
  );
}
