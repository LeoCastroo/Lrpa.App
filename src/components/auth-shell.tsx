import { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Moldura das telas sem sessão (login, esqueci a senha, redefinir senha): tela dividida com um
 * painel "ink" de marca (só em telas largas) e o formulário à direita. No celular fica só o
 * formulário, com o logo no topo.
 */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <aside className="bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div aria-hidden className="bg-ink-grid pointer-events-none absolute inset-0" />
        <BrandLogo
          className="relative"
          markClassName="size-9"
          textClassName="text-xl tracking-[0.2em]"
        />
        <div className="relative max-w-md">
          <p className="text-3xl leading-tight font-semibold tracking-tight">
            Seus processos automatizados, acompanhados em um só lugar.
          </p>
          <p className="text-sidebar-foreground/70 mt-4 text-sm">
            Veja o que os robôs processaram, o que está na fila e o que precisa de atenção.
          </p>
        </div>
        <p className="text-sidebar-foreground/50 relative text-xs">
          © {new Date().getFullYear()} LRPA
        </p>
      </aside>

      <main className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <BrandLogo className="mb-8 lg:hidden" />
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <div className="text-muted-foreground text-sm">{description}</div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
