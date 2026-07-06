"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { Toaster } from "sonner";
import { BrandingTheme } from "@/components/branding-theme";
import { useAuthStore } from "@/stores/auth-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  useLayoutEffect(() => {
    const markHydrated = () => {
      useAuthStore.setState({ _hasHydrated: true });
    };
    const unsub = useAuthStore.persist.onFinishHydration(markHydrated);
    // Persist can finish synchronously (sync localStorage) before this effect runs,
    // so onFinishHydration listeners would never fire.
    if (useAuthStore.persist.hasHydrated()) {
      markHydrated();
    }
    return unsub;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrandingTheme />
      {children}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
