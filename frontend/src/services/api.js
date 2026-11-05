import axios from "axios";

// VITE_API_BASE_URL is baked in at `vite build` time — changing it needs a redeploy.
// Local dev: http://localhost:9191/api/
// Vercel production: set it in Vercel (Project -> Settings -> Environment Variables)
// to your PUBLIC Django base URL, e.g. https://your-backend.onrender.com/api/
// Must end with `/api/` — code calls `auth/login/` relative to it.
// If unset, fall back to same-origin `/api/` (relies on a proxy/rewrite), dev only otherwise.
const ENV_API_URL = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = ENV_API_URL
  ? ENV_API_URL.endsWith("/") ? ENV_API_URL : `${ENV_API_URL}/`
  : import.meta.env.DEV
    ? "http://localhost:9191/api/"
    : "/api/";

if (!ENV_API_URL && import.meta.env.PROD) {
  console.warn(
    "[api] VITE_API_BASE_URL is not set — requests will go to same-origin /api/ and fail unless you add a proxy. " +
    "Set it in Vercel env vars to your public Django URL (e.g. https://your-backend.onrender.com/api/) and redeploy."
  );
}

export { API_BASE_URL };

const API = axios.create({
    baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => error ? promise.reject(error) : promise.resolve(token));
  failedQueue = [];
};

API.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  if (error.response?.status !== 401 || request?._retry) return Promise.reject(error);
  request._retry = true;
  const refresh = localStorage.getItem("refresh");
  if (!refresh) { localStorage.removeItem("access"); localStorage.removeItem("refresh"); window.location.href = "/login"; return Promise.reject(error); }
  if (isRefreshing) {
    return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
      .then((token) => { request.headers.Authorization = `Bearer ${token}`; return API(request); })
      .catch(Promise.reject);
  }
  isRefreshing = true;
  try {
    const response = await axios.post(`${API_BASE_URL}auth/token/refresh/`, { refresh });
    const token = response.data.access;
    localStorage.setItem("access", token);
    processQueue(null, token);
    request.headers.Authorization = `Bearer ${token}`;
    return API(request);
  } catch (refreshError) {
    processQueue(refreshError);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
    return Promise.reject(refreshError);
  } finally { isRefreshing = false; }
});

export default API;
