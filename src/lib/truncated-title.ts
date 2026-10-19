/**
 * Define o `title` (dica nativa do navegador) de um item de menu só quando o texto está cortado
 * pelo "…" — assim o nome completo aparece ao passar o mouse, sem dica redundante nos itens que
 * cabem inteiros. O rótulo é o último <span> do item.
 */
export function titleIfTruncated(item: HTMLElement, fullText: string) {
  const label = item.querySelector<HTMLElement>("span:last-child");
  item.title = label && label.scrollWidth > label.clientWidth ? fullText : "";
}
