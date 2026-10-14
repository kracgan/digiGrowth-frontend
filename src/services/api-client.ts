import axios, { AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://digigrowth-backend-1.onrender.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach bearer token if stored in memory or localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("digigrowth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to format errors strictly from API response
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<any>) => {
    // Strictly extract message from API response
    const apiErrorMessage =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response.data.errors[0]?.message) ||
      error.message ||
      "An unexpected server error occurred.";

    const customError = new Error(apiErrorMessage);
    (customError as any).status = error.response?.status;
    (customError as any).errors = error.response?.data?.errors;
    (customError as any).data = error.response?.data;

    return Promise.reject(customError);
  }
);
