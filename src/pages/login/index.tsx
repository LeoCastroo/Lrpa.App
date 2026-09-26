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
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6 md:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(600px 400px at 50% -10%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
