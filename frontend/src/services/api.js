import axios from "axios";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
//
// VITE_API_BASE_URL is baked in at build time (see .env.production).
//
//   "/api/"                       -> same origin (single-service deploy, or a
//                                    dev server that proxies /api to Django)
//   "https://api.example.com/api/" -> separate backend service
//
// If it is not set at all we fall back to "/api/", which works whenever the
// frontend and API share an origin. For the old two-port local setup
// (frontend :5173, backend :9191) create frontend/.env.local with:
//
//   VITE_API_BASE_URL=http://127.0.0.1:9191/api/

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

const API_BASE_URL = configuredBaseUrl
  ? configuredBaseUrl.endsWith("/")
    ? configuredBaseUrl
    : `${configuredBaseUrl}/`
  : "/api/";

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
}

API.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  if (error.response?.status !== 401 || request?._retry) return Promise.reject(error);
  request._retry = true;
  const refresh = localStorage.getItem("refresh");
  if (!refresh) { localStorage.removeItem("access"); localStorage.removeItem("refresh"); window.location.href = "/login"; return Promise.reject(error); }

  // While a refresh is already in flight, queue the other 401s instead of
  // firing several refresh requests (which would blacklist the token).
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        request.headers.Authorization = `Bearer ${token}`;
        return API(request);
      })
      .catch((queuedError) => Promise.reject(queuedError));
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
