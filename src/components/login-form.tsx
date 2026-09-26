import api from "@/api";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginUser } from "@/service/authentication";
import { useServicesStore, useUserStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import { apiErrorMessage, SUPPORT_EMAIL } from "@/lib/password-policy";
import { PasswordInput } from "./password-input";
import { Label } from "./ui/label";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data.email, data.password);

      localStorage.setItem("token", response.token);
      localStorage.setItem("refresh_token", response.refresh_token);

      const me = await api.user.getMe();
      setUser(me);

      // (re)hidrata os serviços permitidos para esta sessão.
      useServicesStore.getState().clear();
      await useServicesStore.getState().fetch();

      await navigate("/");
    } catch (error: any) {
      toast.error(apiErrorMessage(error, "Erro ao fazer login. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-2xl">
        <CardHeader className="text-center">
          <BrandLogo
            className="mb-2 justify-center"
            markClassName="size-11"
            textClassName="text-2xl"
          />
          <CardTitle className="text-lg">Entrar</CardTitle>
          <CardDescription>
            Informe seu e-mail e senha para acessar o portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  {...register("password")}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Problemas para acessar?{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="underline underline-offset-4"
              >
                Fale com a LRPA
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
