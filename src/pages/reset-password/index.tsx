import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiErrorMessage, newPasswordField, PASSWORD_HINT } from "@/lib/password-policy";
import { resetPassword } from "@/service/authentication";

const schema = z
  .object({ password: newPasswordField, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "As senhas não conferem.", path: ["confirm"] });
type FormData = z.infer<typeof schema>;

export default function Page() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <AuthShell title="Link inválido" description="Este link de redefinição está incompleto.">
        <Button asChild className="w-full">
          <Link to="/forgot-password">Pedir um novo link</Link>
        </Button>
      </AuthShell>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword(token, data.password);
      toast.success("Senha redefinida. Entre com a nova senha.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível redefinir a senha."));
    }
  };

  return (
    <AuthShell title="Criar nova senha" description={PASSWORD_HINT}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">Nova senha</Label>
          <PasswordInput id="password" autoComplete="new-password" autoFocus {...register("password")} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirme a nova senha</Label>
          <PasswordInput id="confirm" autoComplete="new-password" {...register("confirm")} />
          {errors.confirm && <p className="text-sm text-destructive">{errors.confirm.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Salvando..." : "Redefinir senha"}
        </Button>
      </form>
    </AuthShell>
  );
}
