import {
  CalendarClock,
  Database,
  FileDown,
  FileSpreadsheet,
  FileUp,
  Gavel,
  ListChecks,
  ListTodo,
  MailCheck,
  ReceiptText,
  Scale,
  Search,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/home/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { groupServicesByClient } from "@/lib/group-by-client";
import { hourInSaoPaulo } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useServicesStore, useUserStore } from "@/store";

const iconByKey: Record<string, LucideIcon> = {
  BMG_UPDATES_BATCH: ListChecks,
  BMG_WORKFLOWS_BATCH: Workflow,
  BMG_MESSAGES_READ: MailCheck,
  BMG_DOWNLOAD_DOCUMENTS: FileDown,
  BMG_REGISTER_LAW_SUIT: Scale,
  BMG_UPLOAD_DOCUMENTS: FileUp,
  BMG_UPDATES_DEFENSE: Gavel,
  BMG_UPDATES_AUDIENCES: CalendarClock,
  MERCANTIL_REGISTER_LAW_SUIT: Scale,
  MERCANTIL_UPDATES: Gavel,
  MERCANTIL_UPLOAD_DOCUMENTS: FileUp,
  MERCANTIL_REFUNDS: ReceiptText,
  MERCANTIL_BATCH_UPDATES: ListChecks,
  INTER_REGISTER_LAW_SUIT: Scale,
  INTER_UPLOAD_DOCUMENTS: FileUp,
  INTER_REFUNDS: ReceiptText,
  INTER_TASKS: ListTodo,
  INTER_UPDATES: ListChecks,
  INTER_APPEAL_TASKS: Gavel,
  BMG_CITE_SE_PRAZOS: CalendarClock,
  BMG_CITE_SE_COPIA_INTEGRAL: FileDown,
  BMG_CITE_SE_LAKE: Database,
  UNIDAS_TASKS: ListTodo,
  UNIDAS_PROCESS_CLOSURE: Gavel,
  UNIDAS_UPDATE_BATCH: ListChecks,
  UNIDAS_TASK_SUBSIDIES: FileUp,
  UNIDAS_TASK_REGISTER_VALUES: ReceiptText,
  UNIDAS_TASK_PAYMENT_INVOICE: ReceiptText,
  UNIDAS_TASK_VERIFY_ACCIDENT_CLAIM: CalendarClock,
  LOCALIZA_TASKS: ListTodo,
  LOCALIZA_PROCESS_CLOSURE: Gavel,
  LOCALIZA_UPLOAD_DOCUMENTS: FileUp,
  LOCALIZA_DOWNLOAD_DOCUMENTS: FileDown,
  LOCALIZA_TASKS_NOTIFY: ListChecks,
  LOCALIZA_UPDATE_BATCH: ListChecks,
  LOCALIZA_TASKS_BATCH: ListTodo,
  LOCALIZA_REFUNDS: ReceiptText,
  LOCALIZA_WORKFLOW_ELAW: Workflow,
};

function greeting() {
  const hour = hourInSaoPaulo();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function clientInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const ALL = "all";

export default function Page() {
  const user = useUserStore((s) => s.user);
  const { services, status } = useServicesStore();
  const [query, setQuery] = useState("");
  const [clientFilter, setClientFilter] = useState<string>(ALL);

  const allGroups = useMemo(() => groupServicesByClient(services), [services]);

  const visibleGroups = useMemo(() => {
    const term = normalize(query.trim());
    return allGroups
      .filter(({ client }) => clientFilter === ALL || client.key === clientFilter)
      .map(({ client, services: clientServices }) => ({
        client,
        services: term
          ? clientServices.filter((s) =>
              normalize(`${s.name} ${s.description ?? ""} ${client.name}`).includes(term)
            )
          : clientServices,
      }))
      .filter((group) => group.services.length > 0);
  }, [allGroups, query, clientFilter]);

  const chips = [
    { key: ALL, name: "Todos", count: services.length },
    ...allGroups.map(({ client, services: s }) => ({
      key: client.key,
      name: client.name,
      count: s.length,
    })),
  ];

  const firstName = user.name.trim().split(/\s+/)[0];
  const filtering = query.trim() !== "" || clientFilter !== ALL;

  return (
    <div className="container mx-auto py-2 flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-xl border bg-card p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 90% at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent)",
          }}
        />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            {user.office?.name && (
              <p className="text-sm font-medium text-primary">{user.office.name}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold">
              {greeting()}
              {firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Escolha um serviço para acompanhar seus resultados e gerenciar as automações.
            </p>
          </div>

          {services.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar serviço"
                  aria-label="Buscar serviço"
                  className="bg-card pl-9 pr-9"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground sm:ml-auto">
                {services.length}{" "}
                {services.length === 1 ? "serviço disponível" : "serviços disponíveis"}
                {allGroups.length > 1 && ` em ${allGroups.length} clientes`}
              </p>
            </div>
          )}
        </div>
      </section>

      {allGroups.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por cliente">
          {chips.map((chip) => {
            const active = clientFilter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                aria-pressed={active}
                onClick={() => setClientFilter(chip.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {chip.name}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-primary-foreground/20" : "bg-muted"
                  )}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {status === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum serviço habilitado para seu escritório. Entre em contato com a LRPA.
          </CardContent>
        </Card>
      ) : visibleGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-muted-foreground">Nenhum serviço encontrado para essa busca.</p>
            {filtering && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setClientFilter(ALL);
                }}
              >
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        // Uma seção por cliente final (ex.: BMG) — um novo cliente ganha a própria seção
        // automaticamente, sem mudança de código.
        <div className="flex flex-col gap-8">
          {visibleGroups.map(({ client, services: clientServices }) => (
            <section key={client.key} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                  {clientInitials(client.name)}
                </span>
                <h2 className="text-base font-semibold">{client.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {clientServices.length} {clientServices.length === 1 ? "serviço" : "serviços"}
                </span>
                <span className="ml-1 h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {clientServices.map((s) => (
                  <ServiceCard
                    key={s.key}
                    service={s}
                    icon={iconByKey[s.key] ?? FileSpreadsheet}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
