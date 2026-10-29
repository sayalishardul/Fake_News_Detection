import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    request.headers.Authorization = `Bearer ${token}`;
  isRefreshing = true;
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}auth/token/refresh/`, { refresh });
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
