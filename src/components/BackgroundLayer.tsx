import { motion, useReducedMotion } from "motion/react";

export function BackgroundLayer() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="background-layer" aria-hidden="true">
      <motion.div
        className="background-layer__halo"
        animate={reduceMotion ? { opacity: 0.55 } : { opacity: [0.38, 0.62, 0.38], scaleX: [0.96, 1.04, 0.96] }}
        transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
      />
      <div className="background-layer__depth" />
    </div>
  );
}
