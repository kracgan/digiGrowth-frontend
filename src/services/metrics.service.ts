import { apiClient } from "./api-client";

export const metricsService = {
  getMonthlyMetrics: async () => {
    const res: any = await apiClient.get("/monthly-metrics");
    return res.data;
  },

  upsertMonthlyMetrics: async (data: {
    month: string;
    source?: string;
    followers: number;
    posts: number;
    likes: number;
    comments: number;
    shares: number;
    enquiries: number;
    orders: number;
    reviews: number;
    rating: number;
    notes?: string;
  }) => {
    const res: any = await apiClient.post("/monthly-metrics", data);
    return res.data;
  },

  getSingleMonth: async (month: string) => {
    const res: any = await apiClient.get(`/monthly-metrics/${month}`);
    return res.data;
  },

  getGoals: async () => {
    const res: any = await apiClient.get("/monthly-metrics/goals");
    return res.data;
  },

  updateGoals: async (data: {
    followersTarget?: number;
    enquiriesTarget?: number;
    reviewsTarget?: number;
  }) => {
    const res: any = await apiClient.patch("/monthly-metrics/goals", data);
    return res.data;
  },
};
