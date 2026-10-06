import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/api";
import { ServiceCard } from "@/components/home/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryIcon, serviceIcon } from "@/lib/service-icons";
import { formatNumber } from "@/lib/time";
import { IClientResults } from "@/service/types/Client";
import { IServiceCategory, IServiceDefinition } from "@/service/types/Service";
import { useServicesStore } from "@/store";

function clientInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface CategoryGroup {
  category: IServiceCategory;
  services: IServiceDefinition[];
}

function groupByCategory(services: IServiceDefinition[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();
  for (const service of services) {
    const existing = groups.get(service.category.key);
    if (existing) existing.services.push(service);
    else groups.set(service.category.key, { category: service.category, services: [service] });
  }
  return [...groups.values()].sort((a, b) => a.category.order - b.category.order);
}

function categoryTotal(results: IClientResults | null, categoryKey: string): number {
  return results?.categories[categoryKey] ?? 0;
}

// Só devolve texto quando há volume: serviço sem resultado no período fica sem frase (nunca "0").
function serviceHighlight(
  service: IServiceDefinition,
  results: IClientResults | null,
  windowLabel: string
): string | undefined {
  const items = results?.services[service.key] ?? 0;
  if (items <= 0) return undefined;
  const unit = service.panel?.unit;
  const noun = unit ? (items === 1 ? unit.singular : unit.plural) : items === 1 ? "item" : "itens";
  return `${formatNumber(items)} ${noun} ${windowLabel}`;
}

export default function Page() {
  const { clientKey } = useParams();
  const { services, status } = useServicesStore();

  // Só entram os serviços que o usuário já pode ver — um cliente sem nenhum serviço permitido é
  // indistinguível de um cliente que não existe (mesma resposta, nada a confirmar).
  const clientServices = useMemo(
    () => services.filter((s) => s.client.key === clientKey),
    [services, clientKey]
  );
  const groups = useMemo(() => groupByCategory(clientServices), [clientServices]);
  const client = clientServices[0]?.client;

  const [results, setResults] = useState<IClientResults | null>(null);

  // Os números são um complemento: se a consulta falhar, a página continua igual, só sem eles.
  useEffect(() => {
    if (!clientKey) return;
    let cancelled = false;
    setResults(null);
    api.clients
      .getResults(clientKey)
      .then((data) => !cancelled && setResults(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [clientKey]);

  const windowLabel = results?.windowDays ? `nos últimos ${results.windowDays} dias` : "no período";

  if (status === "loading") {
    return (
      <div className="container mx-auto py-2 flex flex-col gap-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto py-2">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-muted-foreground">Cliente não encontrado.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2 flex flex-col gap-6">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Início
      </Link>

      <section className="relative overflow-hidden rounded-xl border bg-card p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 90% at 100% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
            {clientInitials(client.name)}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold">{client.name}</h1>
            <p className="text-sm text-muted-foreground">
              {clientServices.length} {clientServices.length === 1 ? "serviço" : "serviços"} em{" "}
              {groups.length} {groups.length === 1 ? "área" : "áreas"} de atuação
            </p>
            {results && results.total > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="size-4 shrink-0" />
                {formatNumber(results.total)} itens processados com sucesso {windowLabel}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-8">
        {groups.map(({ category, services: categoryServices }) => {
          const Icon = categoryIcon(category.key);
          return (
            <section key={category.key} className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold leading-tight">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                {categoryTotal(results, category.key) > 0 && (
                  <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium tabular-nums text-success">
                    {formatNumber(categoryTotal(results, category.key))} itens
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map((s) => (
                  <ServiceCard
                    key={s.key}
                    service={s}
                    icon={serviceIcon(s.key)}
                    highlight={serviceHighlight(s, results, windowLabel)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
