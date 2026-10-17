"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPassword } from "@/lib/api/student";
import { navProgress, useNavPending } from "@/lib/nav-progress";

function ResetPasswordForm() {
  const router = useRouter();
  const leaving = useNavPending();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Missing reset token in link.");
      if (password !== confirm) throw new Error("Passwords do not match.");
      const res = await resetPassword(token, password);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password reset. You can sign in.");
      navProgress.start();
      router.replace("/auth/sign-in");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!token) {
    return (
      <p className="text-destructive text-sm">
        Invalid or missing reset link. Request a new link from forgot password.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          required
          className="min-h-11"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <PasswordInput
          id="confirm"
          autoComplete="new-password"
          required
          className="min-h-11"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="min-h-11"
        loading={mutation.isPending || leaving}
      >
        {mutation.isPending ? "Saving…" : leaving ? "Opening…" : "Reset password"}
      </Button>
      <Link
        href="/auth/sign-in"
        className="text-primary-ink inline-flex min-h-10 items-center justify-center text-center text-sm font-semibold hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Reset password</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose a new password for your account.
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">Loading…</p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
