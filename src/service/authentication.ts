import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import api from "./api";

/** Renova um pouco antes de expirar, para a requisição não chegar com o token vencido. */
const REFRESH_MARGIN_SECONDS = 30;

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

export async function revokeToken() {
  const refresh_token = localStorage.getItem("refresh_token");
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
