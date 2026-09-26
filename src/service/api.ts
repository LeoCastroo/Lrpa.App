import axios from "axios";
import { checkToken, getNewToken } from "./authentication";

const env = process.env.APP_ENV ?? "hml";
const apiPrefix = env == "prd" ? "api" : `api-${env}`;

/** Rotas que não usam o access token (nem tentam renová-lo). */
const AUTH_ROUTES = ["/login", "/token/refresh", "/token/revoke", "/password/forgot", "/password/reset"];
/** Páginas que funcionam sem sessão — nelas um 401 não redireciona. */
const PUBLIC_PAGES = ["/login", "/forgot-password", "/reset-password"];

function isAuthRoute(url?: string) {
  return AUTH_ROUTES.includes(url ?? "");
}

/**
 * Sessão encerrada (refresh recusado ou 401 em rota autenticada): limpa tudo e volta para o
 * login com o aviso. Recarregar a página zera também o estado em memória.
 */
function endSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user-storage");
  if (!PUBLIC_PAGES.includes(window.location.pathname)) {
    window.location.assign("/login?sessao=expirada");
  }
}

/**
 * Erro de rede (API fora do ar, sem internet) NÃO desloga nem recarrega: a chamada falha e a
 * tela mostra o erro — antes isso virava um loop de recarregamento com o token ainda válido.
 */
const responseError = (error: any) => {
  if (error?.response?.status === 401 && !isAuthRoute(error.config?.url)) {
    endSession();
  }
  return Promise.reject(error);
};

let isRefreshing = false;
let refreshTokenPromise: Promise<void> | null = null;
let pendingRequests: { resolve: (token: string) => void; reject: (e: unknown) => void }[] = [];

const refreshTokenInterceptor = async (req: any) => {
  if (isAuthRoute(req.url)) {
    return req;
  }

  if (!checkToken() && !isRefreshing) {
    isRefreshing = true;

    refreshTokenPromise = getNewToken()
      .then((data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refresh_token", data.refresh_token);
        pendingRequests.forEach(({ resolve }) => resolve(data.token));
      })
      .catch((e) => {
        pendingRequests.forEach(({ reject }) => reject(e));
        endSession();
      })
      .finally(() => {
        pendingRequests = [];
        isRefreshing = false;
        refreshTokenPromise = null;
      });
  }

  if (refreshTokenPromise) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({
        resolve: (token) => {
          req.headers["Authorization"] = `Bearer ${token}`;
          resolve(req);
        },
        reject,
      });
    });
  }

  req.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
  return req;
};

const local = axios.create({
  baseURL: `http://localhost:3001`,
});

const live = axios.create({
  baseURL: `https://${apiPrefix}.lrpa.com.br`,
});

for (const instance of [local, live]) {
  instance.interceptors.request.use(refreshTokenInterceptor, (err) => Promise.reject(err));
  instance.interceptors.response.use((response) => response, responseError);
}

const api = process.env.NODE_ENV === "production" ? live : local;

export default api;
