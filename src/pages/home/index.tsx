import {
  CalendarClock,
  FileDown,
  FileSpreadsheet,
  FileUp,
  Gavel,
  ListChecks,
  ListTodo,
  MailCheck,
  ReceiptText,
  Scale,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UploadWindowBanner } from "@/components/imports/upload-window-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { groupServicesByClient } from "@/lib/group-by-client";
import { useServicesStore } from "@/store";

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
};

export default function Page() {
  const navigate = useNavigate();
  const { services, status } = useServicesStore();
  const clientGroups = groupServicesByClient(services);

  return (
    <div className="container mx-auto py-2 flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl">Início</h1>
        <p className="text-sm text-muted-foreground">
          Selecione um serviço para gerenciar suas importações
        </p>
      </div>

      {services.some((s) => s.capabilities?.import) && <UploadWindowBanner />}

      {status === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum serviço habilitado para seu escritório. Entre em contato com a LRPA.
          </CardContent>
        </Card>
      ) : (
        // Uma seção por cliente final (ex.: BMG) — um novo cliente ganha a própria seção
        // automaticamente, sem mudança de código.
        <div className="flex flex-col gap-6">
          {clientGroups.map(({ client, services: clientServices }) => (
            <div key={client.key} className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {client.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {clientServices.map((s) => {
                  const Icon = iconByKey[s.key] ?? FileSpreadsheet;
                  return (
                    <Card key={s.key} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Icon className="size-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{s.name}</CardTitle>
                        </div>
                        {s.description && <CardDescription>{s.description}</CardDescription>}
                      </CardHeader>
                      <CardContent className="mt-auto">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/services/${s.key}`)}
                        >
                          Abrir
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
