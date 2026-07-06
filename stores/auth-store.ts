import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Student } from "@/types/student";

export type AuthState = {
  user: Student | null;
  token: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  logIn: (p: { user: Student; token: string; refreshToken: string }) => void;
  logOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      logIn: ({ user, token, refreshToken }) =>
        set({ user, token, refreshToken }),
      logOut: () => set({ user: null, token: null, refreshToken: null }),
    }),
    {
      name: "abcn_student_portal",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        refreshToken: s.refreshToken,
      }),
    },
  ),
);
