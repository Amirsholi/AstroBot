import { motion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedScreenProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedScreen({ children, className }: AnimatedScreenProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
