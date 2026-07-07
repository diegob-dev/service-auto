import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Se in futuro avrai un backend reale, basta cambiare questa env var
// (in .env: VITE_API_URL=http://localhost:3000)
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request interceptor ---
// Punto centrale per aggiungere token, header comuni, ecc. quando servirà
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Esempio futuro:
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Response interceptor ---
// Normalizza gli errori così i componenti/hook ricevono sempre un formato prevedibile
export interface ApiError {
  message: string;
  status?: number;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        "Errore di rete imprevisto",
      status: error.response?.status,
    };
    return Promise.reject(apiError);
  },
);
