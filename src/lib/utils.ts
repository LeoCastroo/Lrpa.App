import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Reduz a fonte de um número de KPI conforme o tamanho do texto, para valores longos
 *  (ex.: "R$ 72.466.756,39") caberem no card em vez de estourar a margem. */
export function kpiValueSize(text: string) {
  const length = text.length
  if (length <= 6) return "text-2xl sm:text-3xl"
  if (length <= 9) return "text-xl sm:text-2xl"
  if (length <= 13) return "text-lg sm:text-xl"
  return "text-base sm:text-lg"
}
