import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import api from "./api";

/** Renova um pouco antes de expirar, para a requisição não chegar com o token vencido. */
const REFRESH_MARGIN_SECONDS = 30;

/**
 * Depois do "Sair" a sessão fica fechada até o próximo login. Uma renovação de token que já estava
 * em andamento quando o usuário clicou em Sair terminava depois e regravava os tokens — a tela de
 * login via o token válido, redirecionava para o Início e o usuário ficava preso numa tela vazia
 * (sem nome, sem serviços). Com a sessão fechada, nenhuma gravação tardia de token é aceita.
 */
let sessionClosed = false;

/** Guarda os tokens recebidos do login ou de uma renovação (recusa se a sessão foi encerrada). */
export function saveTokens(data: { token: string; refresh_token: string }, options?: { login?: boolean }) {
  if (options?.login) {
    sessionClosed = false;
  } else if (sessionClosed) {
    // Renovação que terminou depois do logout: descarta e revoga o refresh token recém-emitido.
    void revokeToken(data.refresh_token);
    return;
  }
  localStorage.setItem("token", data.token);
  localStorage.setItem("refresh_token", data.refresh_token);
}

/** Encerra a sessão local: apaga tokens e usuário e bloqueia gravações tardias de token. */
export function closeSession() {
  sessionClosed = true;
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user-storage");
}

export function checkToken(): boolean {
  const token = localStorage.getItem("token");
  const refresh_token = localStorage.getItem("refresh_token");
  if (!token || !refresh_token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    if (!decoded?.exp) return false;
    return dayjs(decoded.exp * 1000).diff(dayjs(), "second") > REFRESH_MARGIN_SECONDS;
  } catch {
    return false;
  }
}

export async function getNewToken() {
  const refresh_token = localStorage.getItem("refresh_token");

  const { data } = await api.post("/token/refresh", {
    refresh_token,
  });

  return data;
}

export async function loginUser(email: string, password: string) {
  const { data } = await api.post("/login", {
    email,
    password,
  });

  return data;
}

export async function revokeToken(refreshToken?: string | null) {
  const refresh_token = refreshToken ?? localStorage.getItem("refresh_token");
  if (!refresh_token) return;
  try {
    await api.post("/token/revoke", { refresh_token });
  } catch {
    // logout deve prosseguir mesmo se a revogação falhar
  }
}

export async function requestPasswordReset(email: string): Promise<string> {
  const { data } = await api.post("/password/forgot", { email });
  return data?.message;
}

export async function resetPassword(token: string, new_password: string): Promise<void> {
  await api.post("/password/reset", { token, new_password });
}
