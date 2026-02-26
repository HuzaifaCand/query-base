"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function TransitionWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.42, 0, 0.58, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
