import { create } from "zustand";

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  status?: string;
}

export interface IOrganizationProfile {
  id: string;
  name: string;
  category: string;
  serviceArea?: string;
  primaryGoal?: string;
  primaryChannel?: string;
  role?: string;
}

export interface AuthState {
  user: IUserProfile | null;
  organization: IOrganizationProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IUserProfile, org: IOrganizationProfile, token?: string) => void;
  updateUser: (user: Partial<IUserProfile>) => void;
  updateOrganization: (org: Partial<IOrganizationProfile>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, org, token) => {
    if (token && typeof window !== "undefined") {
      localStorage.setItem("digigrowth_token", token);
    }
    set({
      user,
      organization: org,
      token: token || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (updated) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null,
    })),

  updateOrganization: (updated) =>
    set((state) => ({
      organization: state.organization
        ? { ...state.organization, ...updated }
        : null,
    })),

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("digigrowth_token");
    }
    set({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
