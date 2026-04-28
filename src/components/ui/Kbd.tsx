import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Stylized `<kbd>` for representing a single key.
 */
export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "bg-bg-soft border border-white/10 rounded-md px-1.5 py-0.5 font-mono text-xs text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
