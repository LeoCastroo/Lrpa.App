import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { LayoutSpecTable } from "@/components/imports/layout-spec-table";
import { ReplacementAlert } from "@/components/imports/replacement-alert";
import { TemplateDownloadButton } from "@/components/imports/template-download-button";
import { UploadWindowBanner } from "@/components/imports/upload-window-banner";
import { ValidationErrorsTable } from "@/components/imports/validation-errors-table";
import { XlsxDropzone } from "@/components/imports/xlsx-dropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useService } from "@/hooks/use-service";
import { useUploadWindow } from "@/hooks/use-upload-window";
import { IImport, IValidationError } from "@/service/types/Import";

const MAX_SIZE_MB = 10;

export default function Page() {
  const navigate = useNavigate();
  const { serviceKey, service, isLoading: serviceLoading, notFound } = useService();
  const { isOpen: windowOpen } = useUploadWindow();

  const [todaysImport, setTodaysImport] = useState<IImport | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<IValidationError[] | null>(null);

  useEffect(() => {
    if (notFound) toast.error("Você não tem acesso a este serviço.");
  }, [notFound]);

  useEffect(() => {
    if (!service || !serviceKey) return;
    api.imports
      .getImports({ serviceKey, page: 1, limit: 1, period: "today" })
      .then((res) => setTodaysImport(res.todays_import))
      .catch(() => {});
  }, [service, serviceKey]);

  function handleFileChange(next: File | null) {
    setFileError(null);
    setErrors(null);
    if (next) {
      if (!next.name.toLowerCase().endsWith(".xlsx")) {
        setFileError("Apenas arquivos .xlsx são aceitos.");
        return;
      }
      if (next.size > MAX_SIZE_MB * 1024 * 1024) {
        setFileError(`O arquivo excede ${MAX_SIZE_MB} MB.`);
        return;
      }
    }
    setFile(next);
  }

  async function handleSubmit() {
    if (!serviceKey) return;
    if (!file) {
      setFileError("Selecione um arquivo.");
      return;
    }
    setIsSubmitting(true);
    setErrors(null);
    try {
      await api.imports.createImport(serviceKey, file);
      toast.success(
        "Planilha enviada com sucesso. Ela será consolidada e enviada ao RPA às 18h."
      );
      navigate(`/services/${serviceKey}/imports`);
    } catch (error: any) {
      const data = error?.response?.data;
      if (error?.response?.status === 400 && Array.isArray(data?.errors)) {
        setErrors(data.errors);
      } else if (error?.response?.status === 409) {
        toast.error(data?.message ?? "Envios permitidos somente das 08h às 18h.");
      } else {
        toast.error(data?.message ?? "Erro ao enviar a planilha. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (serviceLoading) {
    return (
      <div className="container mx-auto py-2 max-w-3xl">
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (notFound) {
    return <Navigate to="/" />;
  }

  const disabled = !windowOpen || isSubmitting;

  return (
    <div className="container mx-auto py-2 max-w-3xl flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl">Nova importação — {service!.name}</h1>
        {service!.description && (
          <p className="text-sm text-muted-foreground">{service!.description}</p>
        )}
      </div>

      <UploadWindowBanner />
      <ReplacementAlert todaysImport={todaysImport} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Layout esperado da planilha</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <LayoutSpecTable columns={service!.layout?.columns ?? []} />
          <p className="text-sm text-muted-foreground">
            A primeira linha da planilha deve conter exatamente os cabeçalhos acima.
            Formato aceito: .xlsx.
          </p>
          <div>
            <TemplateDownloadButton serviceKey={serviceKey!} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Arquivo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <XlsxDropzone file={file} onFileChange={handleFileChange} disabled={disabled} />
          {fileError && <p className="text-sm text-destructive">{fileError}</p>}
        </CardContent>
      </Card>

      {errors && errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>
            A planilha contém {errors.length} erro(s) e não foi importada.
          </AlertTitle>
          <AlertDescription>
            Corrija os problemas abaixo e envie novamente.
          </AlertDescription>
        </Alert>
      )}
      {errors && errors.length > 0 && <ValidationErrorsTable errors={errors} />}

      <Separator />
      <div className="flex justify-end gap-2 pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`/services/${serviceKey}/imports`)}
        >
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={disabled}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Validando planilha..." : "Enviar planilha"}
        </Button>
      </div>
    </div>
  );
}
