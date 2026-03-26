import { create } from "zustand";
import { api } from "../lib/axios";

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;        // ✅ qo'shildi
  resendOtp: (name: string, email: string, password: string) => Promise<void>; // ✅ qo'shildi
  getMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { access_token } = res.data;
    localStorage.setItem("token", access_token);
    set({ token: access_token });
    const me = await api.get("/auth/me");
    set({ user: me.data });
  },

  register: async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
  },

  verifyOtp: async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    const { access_token, refresh_token } = res.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    set({ token: access_token });
    const me = await api.get("/auth/me");
    set({ user: me.data });
  },

  resendOtp: async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
  },

  getMe: async () => {
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    set({ user: null, token: null });
  },
}));