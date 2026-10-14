import { useEffect } from "react";

/** Título da aba do navegador: "<tela> · LRPA" (só "LRPA" quando não há título). */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · LRPA` : "LRPA";
  }, [title]);
}
