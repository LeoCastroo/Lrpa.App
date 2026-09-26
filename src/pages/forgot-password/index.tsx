import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/password-policy";
import { requestPasswordReset } from "@/service/authentication";

const schema = z.object({ email: z.email("E-mail inválido") });
type FormData = z.infer<typeof schema>;

export default function Page() {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const message = await requestPasswordReset(data.email);
      setSentMessage(
        message ?? "Se o e-mail estiver cadastrado, você vai receber um link para redefinir a senha."
      );
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível enviar agora. Tente de novo."));
    }
  };

  if (sentMessage) {
    return (
      <AuthShell title="Verifique seu e-mail" description={sentMessage}>
        <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <MailCheck className="size-10 text-primary" />
          <p>O link vale por 30 minutos. Confira também a caixa de spam.</p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Voltar para o login</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Informe o e-mail da sua conta para receber um link de redefinição"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="usuario@exemplo.com"
            autoComplete="email"
            autoFocus
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Enviando..." : "Enviar link"}
        </Button>
        <Link to="/login" className="text-center text-sm underline underline-offset-4">
          Voltar para o login
        </Link>
      </form>
    </AuthShell>
  );
}
