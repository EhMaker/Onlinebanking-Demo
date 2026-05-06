import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Container — wraps a sibling set and staggers their entry
// ---------------------------------------------------------------------------

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className={className}
      style={{ display: "contents" }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Item — each list row / card that slides in
// ---------------------------------------------------------------------------

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
};

interface AnimatedListItemProps {
  children: ReactNode;
  /** Pass a wrapper style if needed */
  style?: React.CSSProperties;
  className?: string;
}

export function AnimatedListItem({
  children,
  style,
  className,
}: AnimatedListItemProps) {
  return (
    <motion.div variants={itemVariants} style={style} className={className}>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FadeIn — simple single-item fade used for sections / cards
// ---------------------------------------------------------------------------

interface FadeInProps {
  children: ReactNode;
  delay?: number;
}

export function FadeIn({ children, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
