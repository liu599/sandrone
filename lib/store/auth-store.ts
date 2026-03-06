import { create } from "zustand";

const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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
  checkTokenExpiration: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,
  hydrated: false,

  setAuth: (token, user) => {
    const expiryTimestamp = Date.now() + TOKEN_EXPIRY_TIME;
    localStorage.setItem("userToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    localStorage.setItem("tokenExpiry", expiryTimestamp.toString());
    set({ token, user, isLoggedIn: true });
  },

  clearAuth: () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("tokenExpiry");
    set({ token: null, user: null, isLoggedIn: false });
  },

  hydrateFromStorage: () => {
    const token = localStorage.getItem("userToken");
    const userStr = localStorage.getItem("authUser");
    const expiryStr = localStorage.getItem("tokenExpiry");
    let user: AuthUser | null = null;

    try {
      if (userStr) user = JSON.parse(userStr);
    } catch {
      // ignore
    }

    // Check if token has expired
    let isExpired = false;
    if (expiryStr) {
      const expiryTime = parseInt(expiryStr, 10);
      const currentTime = Date.now();
      isExpired = currentTime >= expiryTime;
    }

    if (token && user && !isExpired) {
      set({ token, user, isLoggedIn: true, hydrated: true });
    } else {
      // Clear expired token
      if (isExpired || !token) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("tokenExpiry");
      }
      set({ token: null, user: null, isLoggedIn: false, hydrated: true });
    }
  },

  checkTokenExpiration: () => {
    const expiryStr = localStorage.getItem("tokenExpiry");
    if (!expiryStr) return;

    const expiryTime = parseInt(expiryStr, 10);
    const currentTime = Date.now();

    if (currentTime >= expiryTime) {
      // Token has expired, clear auth state
      localStorage.removeItem("userToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("tokenExpiry");
      set({ token: null, user: null, isLoggedIn: false });
    }
  },
}));
