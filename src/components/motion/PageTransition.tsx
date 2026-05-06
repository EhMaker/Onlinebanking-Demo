import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  /** Optional key to force re-animation on route change */
  motionKey?: string;
}

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/**
 * Wraps a page's content with a subtle fade + slide-up enter/exit animation.
 * Use inside every protected page component.
 */
export function PageTransition({ children, motionKey }: PageTransitionProps) {
  return (
    <motion.div
      key={motionKey}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}
