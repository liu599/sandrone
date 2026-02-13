import { create } from "zustand";

interface AuthUser {
  username: string;
  phone?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,
  hydrated: false,

  setAuth: (token, user) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    set({ token, user, isLoggedIn: true });
  },

  clearAuth: () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("authUser");
    set({ token: null, user: null, isLoggedIn: false });
  },

  hydrateFromStorage: () => {
    const token = localStorage.getItem("userToken");
    const userStr = localStorage.getItem("authUser");
    let user: AuthUser | null = null;
    try {
      if (userStr) user = JSON.parse(userStr);
    } catch {
      // ignore
    }
    if (token && user) {
      set({ token, user, isLoggedIn: true, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },
}));
