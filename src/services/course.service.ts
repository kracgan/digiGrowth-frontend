import { apiClient } from "./api-client";

export const courseService = {
  getCourses: async () => {
    const res: any = await apiClient.get("/learning/courses");
    return res.data;
  },

  getCourseById: async (id: string) => {
    const res: any = await apiClient.get(`/learning/courses/${id}`);
    return res.data;
  },

  enrollCourse: async (id: string) => {
    const res: any = await apiClient.post(`/learning/courses/${id}/enroll`);
    return res.data;
  },

  getLessonById: async (id: string) => {
    const res: any = await apiClient.get(`/learning/lessons/${id}`);
    return res.data;
  },

  updateLessonProgress: async (id: string, status: "completed" | "in_progress") => {
    const res: any = await apiClient.put(`/learning/lessons/${id}/progress`, {
      status,
    });
    return res.data;
  },

  submitQuiz: async (lessonId: string, answers: number[]) => {
    const res: any = await apiClient.post(
      `/learning/lessons/${lessonId}/quiz-attempts`,
      { answers }
    );
    return res.data;
  },
};
