import axios from "axios";
import { checkToken, getNewToken } from "./authentication";

const env = process.env.APP_ENV ?? "hml";
const apiPrefix = env == "prd" ? "api" : `api-${env}`;

const local = axios.create({
  baseURL: `http://localhost:3001`,
});

const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

local.interceptors.response.use(
  async (response) => {
    await delay(300);
    return response;
  },
  async (error) => {
    await delay(300);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let refreshTokenPromise: any = null;
let pendingRequests: any[] = [];

const responseError = (error: any) => {
  if (error.code.includes("ERR_NETWORK") && !window.location.pathname.includes("/login")) {
    window.location.assign("/login");
    return;
  }
  return Promise.reject(error);
};

const refreshTokenInterceptor = async (req: any) => {
  if (["/token/refresh", "/login", "/password/recover"].includes(req.url)) {
    return req;
  }

  if (!checkToken() && !isRefreshing) {
    isRefreshing = true;

    refreshTokenPromise = getNewToken()
      .then((data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refresh_token", data.refresh_token);

        pendingRequests.forEach(({ resolve }) => {
          resolve(data.token);
        });
        pendingRequests = [];
      })
      .catch((e) => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        pendingRequests.forEach(({ reject }) => {
          reject(e);
        });
        pendingRequests = [];
      })
      .finally(() => {
        isRefreshing = false;
        refreshTokenPromise = null;
      });
  }

  if (refreshTokenPromise) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({
        resolve: (token: any) => {
          if (req.url?.includes("/token")) {
            req.data.token = token;
          }
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

local.interceptors.request.use(refreshTokenInterceptor, (err) => Promise.reject(err));
local.interceptors.response.use(
  (response) => {
    if (window.location.pathname !== "/login" && response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      window.location.replace("/login");
    }

    return response;
  },
  (err) => responseError(err)
);

const live = axios.create({
  baseURL: `https://${apiPrefix}.lrpa.com.br`,
});

live.interceptors.request.use(refreshTokenInterceptor, (err) => Promise.reject(err));
live.interceptors.response.use(
  (response) => response,
  (err) => responseError(err)
);

const api = process.env.NODE_ENV === "production" ? live : local;

export default api;
