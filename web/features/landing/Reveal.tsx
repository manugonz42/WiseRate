"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in seconds for sequenced reveals. */
  delay?: number;
  className?: string;
}

// Scroll-reveal leaf (taste-skill §5.C). Motivation: hierarchy, sections settle
// into place as they enter.
//
// `initial` is kept identical on server and client (always the hidden state) so
// it never causes a hydration mismatch. Reduced motion can only be detected on
// the client, so it is honored via the transition (instant, no travel) rather
// than by branching `initial` — under reduce the element simply snaps visible.
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
