import { apiClient } from "./api-client";

export const adminService = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res: any = await apiClient.get("/admin/users", { params });
    return res.data;
  },

  toggleUserStatus: async (userId: string, status: "active" | "suspended") => {
    const res: any = await apiClient.patch(`/admin/users/${userId}/status`, {
      status,
    });
    return res.data;
  },

  getAuditLogs: async () => {
    const res: any = await apiClient.get("/admin/audit-events");
    return res.data;
  },
};
