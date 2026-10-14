import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Faixa de destaque do topo da Home e da página do cliente: plana, com borda de acento à esquerda. */
export function PageHero({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "bg-card rounded-lg border border-l-4 border-l-primary p-6 sm:p-8",
        className
      )}
    >
      {children}
    </section>
  );
}
