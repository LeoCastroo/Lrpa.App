import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { Spinner } from "@/components/ui/spinner";
import { checkToken } from "@/service/authentication";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function Page() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (checkToken()) {
      navigate("/");
      return;
    }

    if (params.get("sessao") === "expirada") {
      toast.info("Sua sessão expirou. Entre novamente.");
      setParams({}, { replace: true });
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <AuthShell title="Entrar" description="Informe seu e-mail e senha para acessar o portal">
      <LoginForm />
    </AuthShell>
  );
}
