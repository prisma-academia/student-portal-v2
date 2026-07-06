"use client";

import Link from "next/link";
import { getConfig } from "@/lib/config";

export function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  const { branding } = getConfig();

  return (
    <div className="relative flex min-h-full flex-col">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center dark:hidden"
        style={{ backgroundImage: `url(${branding.authBackgroundImageUrl})` }}
      />
      <div
        className="absolute inset-0 -z-10 hidden bg-cover bg-center dark:block"
        style={{
          backgroundImage: `url(${branding.authBackgroundImageUrlDark})`,
        }}
      />
      <div className="flex flex-1 flex-col items-center justify-center p-4 pb-8 sm:p-6">
        <div className="bg-card/95 w-full max-w-md rounded-xl border p-4 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-card/85 sm:p-6">
          <Link
            href="/auth/sign-in"
            className="mb-6 flex min-h-11 justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={branding.logoUrl}
              alt={branding.logoAlt}
              className="h-10 max-h-12 w-auto max-w-full object-contain"
            />
          </Link>
          {children}
        </div>
        <p className="text-muted-foreground mt-6 max-w-md px-2 text-center text-xs leading-relaxed">
          {branding.footerText}
        </p>
      </div>
    </div>
  );
}
