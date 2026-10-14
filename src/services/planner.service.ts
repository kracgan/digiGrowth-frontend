import { apiClient } from "./api-client";

export const plannerService = {
  getItems: async (params?: {
    status?: string;
    platform?: string;
    startDate?: string;
    endDate?: string;
    limit?: string;
    page?: string;
  }) => {
    const res: any = await apiClient.get("/planner-items", { params });
    return res.data;
  },

  createItem: async (data: {
    date: string | Date;
    platform: string;
    type: string;
    description: string;
    status?: string;
    lessonId?: string | null;
  }) => {
    const res: any = await apiClient.post("/planner-items", data);
    return res.data;
  },

  updateItem: async (id: string, data: any) => {
    const res: any = await apiClient.patch(`/planner-items/${id}`, data);
    return res.data;
  },

  deleteItem: async (id: string) => {
    const res: any = await apiClient.delete(`/planner-items/${id}`);
    return res.data;
  },
};
