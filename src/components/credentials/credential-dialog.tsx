import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import api from "@/api";
import { PasswordInput } from "@/components/password-input";
import { CredentialEditWarningDialog } from "@/components/credentials/credential-edit-warning-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiErrorMessage } from "@/lib/password-policy";
import { ICredentialSummary } from "@/service/types/Credential";

function makeSchema(mode: "create" | "edit") {
  return z
    .object({
      system: z.string().min(1, "Informe o sistema."),
      username: z.string().min(1, "Informe o usuário/login."),
      password: z.string(),
      notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (mode === "create" && !data.password.trim()) {
        ctx.addIssue({ code: "custom", path: ["password"], message: "Informe a senha." });
      }
    });
}
type CredentialFormData = z.infer<ReturnType<typeof makeSchema>>;

interface CredentialDialogProps {
  mode: "create" | "edit";
  availableClients: { key: string; name: string }[];
  credential?: ICredentialSummary;
  onSaved: () => void;
}

export function CredentialDialog({
  mode,
  availableClients,
  credential,
  onSaved,
}: CredentialDialogProps) {
  const [open, setOpen] = useState(false);
  const [clientKey, setClientKey] = useState(credential?.client_key ?? "");
  const [clientKeyError, setClientKeyError] = useState<string | null>(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [pendingData, setPendingData] = useState<CredentialFormData | null>(null);

  const schema = useMemo(() => makeSchema(mode), [mode]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CredentialFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      system: credential?.system ?? "",
      username: credential?.username ?? "",
      password: "",
      notes: credential?.notes ?? "",
    },
  });

  function resetAll() {
    reset({
      system: credential?.system ?? "",
      username: credential?.username ?? "",
      password: "",
      notes: credential?.notes ?? "",
    });
    setClientKey(credential?.client_key ?? "");
    setClientKeyError(null);
    setPendingData(null);
  }

  async function save(data: CredentialFormData, acknowledged: boolean) {
    if (mode === "create") {
      await api.credentials.createCredential({
        client_key: clientKey,
        system: data.system,
        username: data.username,
        password: data.password,
        notes: data.notes || undefined,
      });
      toast.success("Credencial criada.");
    } else {
      await api.credentials.updateCredential(credential!.id, {
        system: data.system,
        username: data.username,
        password: data.password.trim() ? data.password : undefined,
        notes: data.notes ?? "",
        acknowledged: acknowledged || undefined,
      });
      toast.success("Credencial atualizada.");
    }
    setOpen(false);
    onSaved();
  }

  const onSubmit = async (data: CredentialFormData) => {
    if (mode === "create" && !clientKey) {
      setClientKeyError("Selecione o cliente.");
      return;
    }
    setClientKeyError(null);

    const touchesSensitive =
      mode === "edit" &&
      (data.username !== credential!.username || data.password.trim().length > 0);

    if (touchesSensitive) {
      setPendingData(data);
      setWarningOpen(true);
      return;
    }

    try {
      await save(data, false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível salvar a credencial."));
    }
  };

  async function handleWarningConfirm() {
    if (!pendingData) return;
    try {
      await save(pendingData, true);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível salvar a credencial."));
      throw error;
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetAll();
        }}
      >
        <DialogTrigger asChild>
          {mode === "create" ? (
            <Button className="w-full sm:w-auto">
              <Plus className="size-4" /> Nova credencial
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              Editar
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{mode === "create" ? "Nova credencial" : "Editar credencial"}</DialogTitle>
              <DialogDescription>
                Esta é só a guarda centralizada da credencial — nenhum robô lê ou é atualizado a
                partir daqui nesta versão.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Field>
                <FieldLabel>Cliente</FieldLabel>
                {mode === "create" ? (
                  <Select value={clientKey} onValueChange={setClientKey}>
                    <SelectTrigger className="w-full bg-card">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClients.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={credential?.clientName ?? ""} disabled />
                )}
                {clientKeyError && <p className="text-sm text-destructive">{clientKeyError}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="credential-system">Sistema</FieldLabel>
                <Input
                  id="credential-system"
                  placeholder="Ex.: Elaw, ElawIO, Exyon, Benner"
                  {...register("system")}
                />
                {errors.system && (
                  <p className="text-sm text-destructive">{errors.system.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="credential-username">Usuário/Login</FieldLabel>
                <Input id="credential-username" {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="credential-password">Senha</FieldLabel>
                <PasswordInput id="credential-password" autoComplete="new-password" {...register("password")} />
                {mode === "edit" && (
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para manter a senha atual.
                  </p>
                )}
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="credential-notes">Observações (opcional)</FieldLabel>
                <Textarea id="credential-notes" rows={2} {...register("notes")} />
              </Field>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CredentialEditWarningDialog
        open={warningOpen}
        onOpenChange={setWarningOpen}
        onConfirm={handleWarningConfirm}
      />
    </>
  );
}
