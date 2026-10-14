import { apiClient } from "./api-client";

export const recommendationService = {
  getRecommendations: async () => {
    const res: any = await apiClient.get("/recommendations");
    return res.data;
  },

  updateStatus: async (ruleId: string, status: "completed" | "dismissed") => {
    const res: any = await apiClient.post(`/recommendations/${ruleId}/status`, {
      status,
    });
    return res.data;
  },
};
