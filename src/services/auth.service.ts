import { apiClient } from "./api-client";

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res: any = await apiClient.post("/auth/login", credentials);
    return res.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    businessName: string;
    category?: string;
    serviceArea?: string;
    primaryGoal?: string;
    primaryChannel?: string;
  }) => {
    const res: any = await apiClient.post("/auth/register", data);
    return res.data;
  },

  logout: async () => {
    const res: any = await apiClient.post("/auth/logout");
    return res.data;
  },

  getMe: async () => {
    const res: any = await apiClient.get("/auth/me");
    return res.data;
  },

  updateProfile: async (data: { name?: string }) => {
    const res: any = await apiClient.patch("/auth/me", data);
    return res.data;
  },

  updateOrganization: async (data: any) => {
    const res: any = await apiClient.patch("/organizations", data);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res: any = await apiClient.post("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; password: string }) => {
    const res: any = await apiClient.post("/auth/reset-password", data);
    return res.data;
  },
};
