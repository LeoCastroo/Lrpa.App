import z from "zod";

/** Espelha a política do backend (PasswordPolicy.ts) para validar antes de enviar. */
export const PASSWORD_MIN_LENGTH = 10;

export const newPasswordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`)
  .max(128, "Use no máximo 128 caracteres.")
  .regex(/[A-Za-z]/, "Inclua pelo menos uma letra.")
  .regex(/\d/, "Inclua pelo menos um número.");

export const PASSWORD_HINT = `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres, com letras e números.`;

export const SUPPORT_EMAIL = "leonardo.santos@lrpa.com.br";

/** Mensagem de erro da API, com os detalhes de campo quando vierem (validação 400). */
export function apiErrorMessage(error: any, fallback: string): string {
  const data = error?.response?.data;
  const firstField = data?.fields ? Object.values<any>(data.fields)[0]?.message : undefined;
  if (!error?.response) return "Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.";
  return firstField || data?.message || fallback;
}
