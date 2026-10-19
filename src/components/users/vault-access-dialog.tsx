import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { apiErrorMessage } from "@/lib/password-policy";
import { IOfficeUserSummary } from "@/service/types/AdminUser";
import { IUserVaultAccess } from "@/service/types/Credential";

/**
 * ADMIN: define se o usuário abre o Cofre de Credenciais e exatamente quais credenciais ele
 * enxerga. Só aparecem as credenciais dos clientes que o usuário já atende; credenciais globais
 * (como o ElawIO) nunca aparecem aqui porque só o ADMIN as vê.
 */
export function VaultAccessDialog({ user }: { user: IOfficeUserSummary }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<IUserVaultAccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function load() {
    setLoading(true);
    setData(null);
    api.users
      .getVaultAccess(user.id)
      .then((result) => {
        setData(result);
        setEnabled(result.hasVaultAccess);
        setSelected(
          new Set(result.clients.flatMap((c) => c.credentials.filter((cr) => cr.granted).map((cr) => cr.id)))
        );
      })
      .catch((error) => toast.error(apiErrorMessage(error, "Não foi possível carregar o acesso ao Cofre.")))
      .finally(() => setLoading(false));
  }

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleClient = (ids: string[], checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) checked ? next.add(id) : next.delete(id);
      return next;
    });

  async function onSave() {
    setSaving(true);
    try {
      await api.users.setVaultAccess(user.id, { hasVaultAccess: enabled, credentialIds: Array.from(selected) });
      toast.success("Acesso ao Cofre atualizado.");
      setOpen(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível salvar o acesso ao Cofre."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) load();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="size-4" />
          Cofre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acesso ao Cofre — {user.name}</DialogTitle>
          <DialogDescription>
            {user.email}. Escolha quais credenciais este usuário pode ver. Credenciais globais (sem
            cliente) são visíveis apenas para administradores.
          </DialogDescription>
        </DialogHeader>

        {loading || !data ? (
          <div className="flex flex-col gap-2 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <label className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
              <span className="flex flex-col">
                <span className="font-medium">Pode abrir o Cofre de Credenciais</span>
                <span className="text-muted-foreground">
                  Desligado, o usuário não vê o Cofre, mesmo com credenciais marcadas abaixo.
                </span>
              </span>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </label>

            {data.clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este usuário não atende nenhum cliente ainda — não há credenciais para liberar.
              </p>
            ) : (
              <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
                {data.clients.map((client) => {
                  const ids = client.credentials.map((c) => c.id);
                  const all = ids.length > 0 && ids.every((id) => selected.has(id));
                  const some = ids.some((id) => selected.has(id));
                  return (
                    <div key={client.key} className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground cursor-pointer">
                        <Checkbox
                          checked={all ? true : some ? "indeterminate" : false}
                          disabled={ids.length === 0}
                          onCheckedChange={(value) => toggleClient(ids, !!value)}
                        />
                        {client.name}
                      </label>
                      {client.credentials.length === 0 ? (
                        <p className="pl-6 text-sm text-muted-foreground">Nenhuma credencial cadastrada.</p>
                      ) : (
                        client.credentials.map((credential) => (
                          <label
                            key={credential.id}
                            className="flex items-center gap-2 pl-6 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={selected.has(credential.id)}
                              onCheckedChange={() => toggle(credential.id)}
                            />
                            <span>
                              {credential.system} — {credential.username}
                            </span>
                            {credential.status !== "ACTIVE" && <Badge variant="outline">Inativo</Badge>}
                          </label>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onSave} disabled={saving || loading || !data}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
