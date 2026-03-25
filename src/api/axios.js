import axios from "axios";

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const apiBaseUrl = envBaseUrl || "/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10_000, // 10 s — prevents requests from hanging indefinitely
});

let isRefreshing = false;
let queue = [];

const flushQueue = (error) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error); // propagate the error to all queued callers
    } else {
      resolve();
    }
  });
  queue = [];
};

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config: originalRequest } = error;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthRefreshRequest = requestUrl.includes("/auth/refresh");
    const isAuthLoginRequest = requestUrl.includes("/auth/login");
    const isAuthRegisterRequest = requestUrl.includes("/auth/register");

    if (!response) return Promise.reject(error);
    if (!originalRequest) return Promise.reject(error);

    if (
      response.status !== 401 ||
      originalRequest._retry ||
      isAuthRefreshRequest ||
      isAuthLoginRequest ||
      isAuthRegisterRequest
    )
      return Promise.reject(error);

    if (isRefreshing) {
      // Queue this request and wait until the ongoing refresh finishes
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err)); // ensure rejection propagates
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      flushQueue(null); // success — let all queued requests retry
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError); // failure — reject all queued requests
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
