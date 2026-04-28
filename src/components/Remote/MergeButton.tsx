"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface MergeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

/**
 * MergeButton — botón verde grande para fusionar un PR. Usa un pulso suave
 * en hover y respeta `useReducedMotion`.
 */
export function MergeButton({
  onClick,
  disabled = false,
  label = "Merge pull request",
}: MergeButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileHover={
        disabled || reduceMotion
          ? undefined
          : { scale: 1.02, boxShadow: "0 0 0 6px rgba(61,220,151,0.18)" }
      }
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-success/40 bg-success px-4 py-3 text-sm font-semibold text-bg shadow-glow transition-colors",
        "hover:bg-success/90",
        disabled && "cursor-not-allowed opacity-50 hover:bg-success",
        !disabled && !reduceMotion && "animate-pulseGlow",
      )}
    >
      <MergeIcon className="h-4 w-4" />
      <span>{label}</span>
    </motion.button>
  );
}

function MergeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      {/* Stylised merge icon: two branches meeting */}
      <circle cx="4" cy="3.5" r="1.6" />
      <circle cx="4" cy="12.5" r="1.6" />
      <circle cx="12" cy="12.5" r="1.6" />
      <path
        d="M4 5.1v5.8"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M4 5.1c0 4 3.5 6 8 6"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default MergeButton;
