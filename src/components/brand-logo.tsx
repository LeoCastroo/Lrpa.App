import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Glifo da marca LRPA (nó-e-fluxo) — só o traço roxo, sem chapa de fundo (mesma versão que a
 * landpage usa no cabeçalho, não a do favicon/ícone de app). Fica correto tanto sobre o fundo
 * claro quanto o escuro do sistema. `useId` evita colisão de gradiente quando a marca aparece
 * mais de uma vez na mesma página (sidebar + eventuais outros usos).
 */
export function BrandMark({ className }: { className?: string }) {
  const gradId = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="LRPA"
      className={cn("shrink-0", className)}
    >
      <path
        d="M9 8V19.5C9 21.4 10.6 23 12.5 23H24"
        stroke={`url(#${gradId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="8" r="3" fill="none" stroke={`url(#${gradId})`} strokeWidth="2.4" />
      <circle cx="12.5" cy="23" r="2.6" fill={`url(#${gradId})`} />
      <circle cx="24" cy="23" r="3" fill="none" stroke="#A78BFA" strokeWidth="2.4" />
      <defs>
        <linearGradient id={gradId} x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C6BF0" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Marca completa (glifo + "LRPA"), na tipografia de destaque reservada à marca. */
export function BrandLogo({
  className,
  markClassName,
  textClassName,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className={cn("size-8", markClassName)} />
      <span className={cn("font-display text-lg font-bold tracking-tight", textClassName)}>
        LRPA
      </span>
    </div>
  );
}
