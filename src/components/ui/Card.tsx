"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Generic surface used for grouping content. Glass-like background with subtle
 * border, generous padding, and a soft glow.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-bg-card/80 backdrop-blur border border-white/10 rounded-2xl p-5 shadow-glow",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
