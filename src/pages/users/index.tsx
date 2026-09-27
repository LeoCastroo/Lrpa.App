import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import api from "@/api";
import { PasswordInput } from "@/components/password-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiErrorMessage, newPasswordField, PASSWORD_HINT } from "@/lib/password-policy";
import { groupServicesByClient } from "@/lib/group-by-client";
import { IServiceDefinition } from "@/service/types/Service";
import { IOfficeUserSummary } from "@/service/types/AdminUser";
import { useServicesStore, useUserStore } from "@/store";

/** Escritórios disponíveis: união dos `offices` de todos os serviços — o ADMIN já carrega
 *  os serviços com essa lista (ver ListPermittedServices, lado ADMIN). */
function useOffices() {
  const { services } = useServicesStore();
  return Array.from(
    new Map(services.flatMap((s) => s.offices ?? []).map((o) => [o.rpa_code, o])).values()
  );
}

/** Checklist de serviços agrupado por cliente (mesma estrutura da sidebar), com checkbox. */
function ServiceChecklist({
  services,
  selected,
  onToggle,
}: {
  services: IServiceDefinition[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  const groups = groupServicesByClient(services);

  if (!groups.length) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Este escritório não contratou nenhum serviço ainda.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
      {groups.map(({ client, services: clientServices }) => (
        <div key={client.key} className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {client.name}
          </p>
          <div className="flex flex-col gap-2">
            {clientServices.map((service) => (
              <label
                key={service.key}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selected.has(service.key)}
                  onCheckedChange={() => onToggle(service.key)}
                />
                {service.name}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  email: z.email("Informe um e-mail válido."),
  password: newPasswordField,
});
type CreateUserFormData = z.infer<typeof createUserSchema>;

function CreateUserDialog({
  office,
  officeServices,
  onCreated,
}: {
  office: string;
  officeServices: IServiceDefinition[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({ resolver: zodResolver(createUserSchema) });

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await api.users.createUser({
        ...data,
        office,
        serviceKeys: Array.from(selected),
      });
      toast.success("Usuário criado.");
      reset();
      setSelected(new Set());
      setOpen(false);
      onCreated();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível criar o usuário."));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          setSelected(new Set());
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="size-4" /> Novo usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>
              Defina os dados de acesso e quais serviços este usuário vai enxergar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="new-user-name">Nome</FieldLabel>
              <Input id="new-user-name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="new-user-email">E-mail</FieldLabel>
              <Input id="new-user-email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="new-user-password">Senha</FieldLabel>
              <PasswordInput
                id="new-user-password"
                autoComplete="new-password"
                {...register("password")}
              />
              <p className="text-xs text-muted-foreground">{PASSWORD_HINT}</p>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel>Serviços</FieldLabel>
              <ServiceChecklist
                services={officeServices}
                selected={selected}
                onToggle={toggle}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSubmitting ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditServicesDialog({
  user,
  officeServices,
  onSaved,
}: {
  user: IOfficeUserSummary;
  officeServices: IServiceDefinition[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(user.serviceKeys));
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const onSave = async () => {
    setSaving(true);
    try {
      await api.users.setUserServices(user.id, Array.from(selected));
      toast.success("Serviços atualizados.");
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível salvar os serviços."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected(new Set(user.serviceKeys));
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar serviços
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ServiceChecklist services={officeServices} selected={selected} onToggle={toggle} />
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  const currentUser = useUserStore((s) => s.user);
  const offices = useOffices();
  const { services: allServices } = useServicesStore();
  const [office, setOffice] = useState<string | undefined>(undefined);
  const [users, setUsers] = useState<IOfficeUserSummary[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!office && offices.length) setOffice(offices[0].rpa_code);
  }, [offices, office]);

  const officeServices = useMemo(
    () => allServices.filter((s) => s.offices?.some((o) => o.rpa_code === office)),
    [allServices, office]
  );

  const load = () => {
    if (!office) return;
    setLoading(true);
    api.users
      .listUsers(office)
      .then(setUsers)
      .catch((err) => toast.error(apiErrorMessage(err, "Erro ao carregar os usuários.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [office]);

  if (currentUser.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-2 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Controle quais serviços cada usuário do escritório pode acessar.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Select value={office ?? ""} onValueChange={setOffice}>
            <SelectTrigger className="w-full sm:w-56 bg-card">
              <SelectValue placeholder="Selecione o escritório" />
            </SelectTrigger>
            <SelectContent>
              {offices.map((o) => (
                <SelectItem key={o.rpa_code} value={o.rpa_code}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {office && (
            <CreateUserDialog office={office} officeServices={officeServices} onCreated={load} />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do escritório</CardTitle>
          <CardDescription>
            Cada usuário só enxerga a Home, a sidebar e a Central de Pendências dos serviços
            marcados para ele.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !users?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhum usuário cadastrado neste escritório ainda.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Serviços</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="whitespace-nowrap">{u.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{u.email}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {u.serviceKeys.length} serviço{u.serviceKeys.length === 1 ? "" : "s"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === "ACTIVE" ? "default" : "outline"}>
                          {u.status === "ACTIVE" ? "Ativo" : u.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <EditServicesDialog
                          user={u}
                          officeServices={officeServices}
                          onSaved={load}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
