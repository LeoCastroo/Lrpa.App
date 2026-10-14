import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  useDocumentTitle("Página não encontrada");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <BrandLogo />
      <p className="font-display text-7xl font-semibold tracking-tight text-primary sm:text-8xl">
        404
      </p>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-balance">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground text-sm">
          O endereço não existe ou você não tem acesso a ele.
        </p>
      </div>
      <Button
        onClick={() => {
          navigate("/", { replace: true });
        }}
      >
        Voltar
      </Button>
    </main>
  );
}
