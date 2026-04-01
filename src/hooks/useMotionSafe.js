import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

export const useMotionSafe = () => {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(
    () => (props) => (shouldReduceMotion ? {} : props),
    [shouldReduceMotion],
  );
};
