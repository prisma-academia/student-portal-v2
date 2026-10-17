"use client";

import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveChangePasswordTransfer,
  saveSetupTransfer,
} from "@/lib/auth-transfer";
import { login, type LoginBody } from "@/lib/api/student";
import { useAuthStore } from "@/stores/auth-store";
import type { Student } from "@/types/student";

type LoginJson = {
  ok?: boolean;
  message?: string;
  redirectTo?: string;
  mustChangePassword?: boolean;
  data?: {
    student?: Student;
    token?: string;
    refreshToken?: string;
  };
};

export default function SignInPage() {
  const router = useRouter();
  const logIn = useAuthStore((s) => s.logIn);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s._hasHydrated);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/");
    }
  }, [hydrated, token, router]);

  const mutation = useMutation({
    mutationFn: async (payload: LoginBody) => {
      const res = await login(payload);
      if (!res.ok) throw new Error(res.message);
      return res.data as LoginJson;
    },
    onSuccess: (json) => {
      const inner = json.data;
      if (json.redirectTo && inner?.student && inner.token) {
        saveSetupTransfer({
          student: inner.student,
          token: inner.token,
          refreshToken: inner.refreshToken ?? "",
        });
        router.push("/auth/setup");
        return;
      }
      if (json.mustChangePassword && inner?.student && inner.token) {
        saveChangePasswordTransfer({
          student: inner.student,
          token: inner.token,
          refreshToken: inner.refreshToken ?? "",
        });
        router.push("/auth/change-password");
        return;
      }
      if (inner?.student && inner.token) {
        toast.success("Signed in");
        logIn({
          user: inner.student,
          token: inner.token,
          refreshToken: inner.refreshToken ?? "",
        });
        router.replace("/");
        return;
      }
      toast.error("Unexpected login response");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const loginId = String(fd.get("loginId") ?? "").trim();
    if (!loginId) {
      toast.error("Enter email or registration number");
      return;
    }
    const isEmail = loginId.includes("@");
    const password = String(fd.get("password") ?? "");
    mutation.mutate(
      isEmail
        ? { email: loginId, password, persistent: remember }
        : { regNumber: loginId, password, persistent: remember },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in with your registration number or school email.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="loginId">Reg number or email</Label>
          <Input
            id="loginId"
            name="loginId"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="e.g. BM/01/037"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-primary-ink inline-flex min-h-8 items-center text-sm font-semibold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="pr-12"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-[var(--radius-md)]"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
            </button>
          </div>
        </div>
        <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox
            id="persistent"
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
          />
          Keep me signed in on this device
        </label>
        <Button type="submit" size="lg" className="mt-1 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? <IconLoader2 className="animate-spin" /> : null}
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="text-muted-foreground text-center text-sm">
        First time here? Sign in with the password the school gave you. We&apos;ll help you set up your account.
      </p>
    </div>
  );
}
