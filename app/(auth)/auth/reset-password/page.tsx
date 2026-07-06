"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/api/student";

function ResetPasswordForm() {
  const router = useRouter();
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
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          className="min-h-11"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
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
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Saving…" : "Reset password"}
      </Button>
      <Link
        href="/auth/sign-in"
        className="text-primary text-center text-xs font-medium"
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
        <h1 className="text-lg font-semibold">Reset password</h1>
        <p className="text-muted-foreground mt-1 text-xs">
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
