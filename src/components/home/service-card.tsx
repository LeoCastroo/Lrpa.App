import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IServiceDefinition } from "@/service/types/Service";

function capabilityLabels(service: IServiceDefinition): string[] {
  const labels: string[] = [];
  if (service.capabilities?.import) labels.push("Importação");
  if (service.capabilities?.panel) labels.push("Painel");
  if (service.capabilities?.lake) labels.push("Jurimetria");
  if (service.capabilities?.docs) labels.push("Documentação");
  return labels;
}

export function ServiceCard({
  service,
  icon: Icon,
  highlight,
}: {
  service: IServiceDefinition;
  icon: LucideIcon;
  /** Frase curta de resultado (ex.: "1.118 andamentos nos últimos 30 dias"). Omitida quando não há volume. */
  highlight?: string;
}) {
  const labels = capabilityLabels(service);

  return (
    <Link
      to={`/services/${service.key}`}
      className="group flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug">{service.name}</h3>
          {service.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
          )}
        </div>
        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-50 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100 group-focus-visible:opacity-100" />
      </div>

      {highlight && (
        <p className="mt-auto flex items-center gap-1.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          <span className="min-w-0">{highlight}</span>
        </p>
      )}

      {labels.length > 0 && (
        <div className={cn("flex flex-wrap gap-1.5", !highlight && "mt-auto")}>
          {labels.map((label) => (
            <Badge key={label} variant="secondary" className="font-normal">
              {label}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
