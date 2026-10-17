"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandLoader } from "@/components/system/brand-loader";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/auth/sign-in");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return <BrandLoader fullscreen />;
  }

  return <>{children}</>;
}
