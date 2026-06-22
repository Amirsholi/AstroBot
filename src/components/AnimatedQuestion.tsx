import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedQuestionProps = {
  children: ReactNode;
  questionKey: string;
};

export function AnimatedQuestion({ children, questionKey }: AnimatedQuestionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.section
        aria-labelledby="question-title"
        className="question-panel"
        key={questionKey}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.section>
    </AnimatePresence>
  );
}
