"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoader } from "@/components/system/page-loader";
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
    return <PageLoader className="min-h-[50vh]" />;
  }

  return <>{children}</>;
}
