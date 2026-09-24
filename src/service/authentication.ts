import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import api from "./api";

export function checkToken(): boolean {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  const decoded = jwtDecode(token);
  if (!decoded?.exp) {
    return false;
  }

  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) {
    return false;
  }

  const expires = decoded.exp * 1000;
  const liveToken = dayjs(expires).diff(dayjs(), "second") * 0.9 > 0;

  if (!liveToken) {
    return false;
  }

  return true;
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
