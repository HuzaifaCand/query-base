"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import ModalBase from "../layout/ModalBase";
import { NewClass } from "../join/new/NewClass";

export default function AddClassCard({
  role,
}: {
  role: "student" | "teacher";
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <ModalBase isOpen={showModal} onClose={() => setShowModal(false)}>
        <NewClass role={role} setShowModal={setShowModal} />
      </ModalBase>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative h-full overflow-hidden rounded-xl bg-card border-2 border-dashed border-border hover:border-primary/50 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[280px]"
        onClick={() => {
          setShowModal(true);
        }}
      >
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          {/* Icon */}
          <div className="mb-4 p-4 bg-primary/10 group-hover:bg-primary/20 rounded-full transition-colors duration-300">
            <Plus className="w-8 h-8 text-primary group-hover:rotate-90 transition-transform duration-300" />
          </div>

          {/* Text */}
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Add Another Class
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            Add a new class to start{" "}
            {role === "student" ? "learning" : "teaching"}
          </p>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.button>
    </>
  );
}
