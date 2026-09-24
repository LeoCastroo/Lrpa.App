import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Theme, useTheme } from "@/hooks/use-theme";
import { useUserStore } from "@/store";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  CLIENT: "Cliente",
};

const themeOptions: { value: Theme; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "auto", label: "Automático" },
];

export default function Page() {
  const user = useUserStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto py-2 max-w-3xl">
      <div className="flex flex-col py-2 mb-6">
        <h1 className="text-2xl">Minha Conta</h1>
        <p className="text-sm text-muted-foreground">Seus dados e preferências</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados</CardTitle>
          <CardDescription>Informações da sua conta</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 flex flex-col gap-4">
          <Field>
            <FieldLabel>Nome</FieldLabel>
            <Input value={user.name} disabled />
          </Field>
          <Field>
            <FieldLabel>E-mail</FieldLabel>
            <Input value={user.email} disabled />
          </Field>
          <Field>
            <FieldLabel>Escritório</FieldLabel>
            <Input value={user.office?.name ?? "—"} disabled />
          </Field>
          <Field>
            <FieldLabel>Perfil</FieldLabel>
            <Input value={roleLabel[user.role] ?? user.role} disabled />
          </Field>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>Personalize a aparência do sistema</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <Field>
            <FieldLabel>Tema</FieldLabel>
            <div className="flex rounded-md border border-border overflow-hidden w-fit">
              {themeOptions.map((option, index) => {
                const isActive = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={[
                      "px-4 py-2 text-sm font-medium transition-colors",
                      index > 0 ? "border-l border-border" : "",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}
