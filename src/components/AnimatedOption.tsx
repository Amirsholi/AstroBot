import { motion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedOptionProps = {
  children: ReactNode;
  className: string;
  index: number;
};

export function AnimatedOption({ children, className, index }: AnimatedOptionProps) {
  return (
    <motion.label
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.28 + index * 0.12,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.label>
  );
}
