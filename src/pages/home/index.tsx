import {
  FileDown,
  FileSpreadsheet,
  ListChecks,
  MailCheck,
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
import { useServicesStore } from "@/store";

const iconByKey: Record<string, LucideIcon> = {
  BMG_UPDATES_BATCH: ListChecks,
  BMG_WORKFLOWS_BATCH: Workflow,
  BMG_MESSAGES_READ: MailCheck,
  BMG_DOWNLOAD_DOCUMENTS: FileDown,
};

export default function Page() {
  const navigate = useNavigate();
  const { services, status } = useServicesStore();

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
            Nenhum serviço habilitado para seu escritório. Entre em contato com a LCS.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
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
      )}
    </div>
  );
}
