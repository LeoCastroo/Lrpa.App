import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho padrão das telas: título, descrição e, à direita, as ações da tela (filtros,
 * seletor de escritório, botão de criar) passadas como `children`. Uma linha fina separa o
 * cabeçalho do conteúdo.
 */
export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b pb-4",
        className
      )}
    >
      {/* Base de 18rem: com pouca largura as ações caem para a linha de baixo em vez de espremer o título. */}
      <div className="min-w-0 flex-1 basis-72">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
      </div>
      {children}
    </div>
  );
}
