import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ServiceCard } from "@/components/home/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryIcon, serviceIcon } from "@/lib/service-icons";
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
                <div className="min-w-0">
                  <h2 className="text-base font-semibold leading-tight">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map((s) => (
                  <ServiceCard key={s.key} service={s} icon={serviceIcon(s.key)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
