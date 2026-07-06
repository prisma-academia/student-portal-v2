"use client";

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
        <h1 className="text-lg font-semibold">Sign in</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Use your school email or registration number.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="loginId">Email or registration number</Label>
          <Input
            id="loginId"
            name="loginId"
            autoComplete="username"
            required
            className="min-h-11"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="min-h-11"
          />
          <button
            type="button"
            className="text-primary text-xs font-medium self-start"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Hide" : "Show"} password
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <Checkbox
              id="persistent"
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
            />
            Remember me
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-primary text-xs font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          className="min-h-11 w-full sm:w-auto"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
