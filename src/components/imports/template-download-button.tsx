import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";

export function TemplateDownloadButton({
  serviceKey,
  fileName,
}: {
  serviceKey: string;
  fileName?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    try {
      setLoading(true);
      const blob = await api.services.getTemplate(serviceKey);
      downloadBlob(blob, fileName ?? `modelo-${serviceKey}.xlsx`);
    } catch {
      toast.error("Não foi possível baixar o modelo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleDownload} disabled={loading}>
      <Download className="size-4" />
      Baixar modelo (.xlsx)
    </Button>
  );
}
