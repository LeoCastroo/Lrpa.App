// Baixa um Blob (ex.: XLSX vindo da API autenticada) sem perder o header
// Authorization — por isso usamos blob + objectURL em vez de window.location.
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
