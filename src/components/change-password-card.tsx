import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import api from "@/api";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { apiErrorMessage, newPasswordField, PASSWORD_HINT } from "@/lib/password-policy";
import { useServicesStore, useUserStore } from "@/store";

const schema = z
  .object({
    current: z.string().min(1, "Informe a senha atual."),
    password: newPasswordField,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "As senhas não conferem.", path: ["confirm"] });
type FormData = z.infer<typeof schema>;

export function ChangePasswordCard() {
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);
  const clearServices = useServicesStore((s) => s.clear);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.user.changePassword(data.current, data.password);
      // O servidor encerra todas as sessões ao trocar a senha — entra de novo com a nova.
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      clearUser();
      clearServices();
      toast.success("Senha alterada. Entre novamente com a nova senha.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível alterar a senha."));
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
        <CardDescription>
          Trocar a senha encerra suas sessões abertas em todos os dispositivos.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">
          <Field>
            <FieldLabel htmlFor="current-password">Senha atual</FieldLabel>
            <PasswordInput id="current-password" autoComplete="current-password" {...register("current")} />
            {errors.current && <p className="text-sm text-destructive">{errors.current.message}</p>}
          </Field>
          <Field>
            <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
            <PasswordInput id="new-password" autoComplete="new-password" {...register("password")} />
            <p className="text-xs text-muted-foreground">{PASSWORD_HINT}</p>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirme a nova senha</FieldLabel>
            <PasswordInput id="confirm-password" autoComplete="new-password" {...register("confirm")} />
            {errors.confirm && <p className="text-sm text-destructive">{errors.confirm.message}</p>}
          </Field>
          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Salvando..." : "Alterar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
