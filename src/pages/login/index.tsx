import { LoginForm } from "@/components/login-form";
import { Spinner } from "@/components/ui/spinner";
import { checkToken } from "@/service/authentication";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Page() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (checkToken()) {
      navigate("/");
      return;
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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
