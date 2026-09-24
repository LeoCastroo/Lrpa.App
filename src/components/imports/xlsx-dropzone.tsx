import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ACCEPT = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function XlsxDropzone({
  file,
  onFileChange,
  disabled,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    onFileChange(files[0]);
  }

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileSpreadsheet className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Remover arquivo"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-accent/50",
        dragging && "border-primary bg-accent/50"
      )}
    >
      <UploadCloud className="size-6 text-muted-foreground" />
      <p className="text-sm">Arraste a planilha aqui ou clique para selecionar</p>
      <p className="text-xs text-muted-foreground">Somente arquivos .xlsx</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
