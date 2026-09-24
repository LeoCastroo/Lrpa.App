import dayjs from "dayjs";
import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { ValidationErrorsTable } from "@/components/imports/validation-errors-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadBlob } from "@/lib/download";
import { useService } from "@/hooks/use-service";
import { IImport } from "@/service/types/Import";
import { useUploadWindow } from "@/hooks/use-upload-window";

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export default function Page() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { serviceKey, service, isLoading: serviceLoading, notFound } = useService();
  const { isOpen: windowOpen } = useUploadWindow();

  const [item, setItem] = useState<IImport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (notFound) toast.error("Você não tem acesso a este serviço.");
  }, [notFound]);

  useEffect(() => {
    if (!service || !serviceKey || !id) return;
    setIsLoading(true);
    api.imports
      .getImport(serviceKey, id)
      .then(setItem)
      .catch((error) => {
        toast.error(error?.response?.data?.message ?? "Importação não encontrada.");
        navigate(`/services/${serviceKey}/imports`);
      })
      .finally(() => setIsLoading(false));
  }, [service, serviceKey, id]);

  async function handleDownload() {
    if (!serviceKey || !id || !item) return;
    try {
      setDownloading(true);
      const blob = await api.imports.getImportFile(serviceKey, id);
      downloadBlob(blob, item.file_name);
    } catch {
      toast.error("Não foi possível baixar a planilha.");
    } finally {
      setDownloading(false);
    }
  }

  if (serviceLoading || isLoading) {
    return (
      <div className="container mx-auto py-2 max-w-3xl">
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (notFound) {
    return <Navigate to="/" />;
  }

  if (!item) return null;

  return (
    <div className="container mx-auto py-2 max-w-3xl flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/")} className="cursor-pointer">
              Início
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate(`/services/${serviceKey}/imports`)}
              className="cursor-pointer"
            >
              {service!.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Importação de {dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Detalhe da importação</CardTitle>
          <ImportStatusBadge status={item.status} />
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 grid grid-cols-2 gap-4">
          <Info label="Arquivo" value={item.file_name} />
          <Info label="Enviado por" value={item.created_by_name} />
          <Info
            label="Enviado em"
            value={dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
          />
          <Info label="Nº de linhas" value={item.row_count} />
          {item.consolidated_at && (
            <Info
              label="Consolidada em"
              value={dayjs(item.consolidated_at).format("DD/MM/YYYY HH:mm")}
            />
          )}
        </CardContent>
        <Separator />
        <div className="flex flex-wrap justify-end gap-2 px-6 py-4">
          <Button variant="outline" onClick={handleDownload} disabled={downloading}>
            <Download className="size-4" />
            {downloading ? "Baixando..." : "Baixar planilha enviada"}
          </Button>
          {windowOpen && (
            <Button onClick={() => navigate(`/services/${serviceKey}/imports/new`)}>
              <Plus className="size-4" />
              Enviar nova planilha
            </Button>
          )}
        </div>
      </Card>

      {item.status === "REJECTED" &&
        item.validation_errors &&
        item.validation_errors.length > 0 && (
          <ValidationErrorsTable errors={item.validation_errors} />
        )}
    </div>
  );
}
