"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/api/student";

export default function ForgotPasswordPage() {
  const mutation = useMutation({
    mutationFn: async (body: { email: string; regNumber: string }) => {
      const res = await forgotPassword(body);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Check your email for reset instructions.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      email: String(fd.get("email") ?? "").trim(),
      regNumber: String(fd.get("regNumber") ?? "").trim(),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Forgot password</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter your email and registration number. We will email you a reset
          link.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="min-h-11"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="regNumber">Registration number</Label>
          <Input
            id="regNumber"
            name="regNumber"
            required
            className="min-h-11"
          />
        </div>
        <Button
          type="submit"
          className="min-h-11"
          loading={mutation.isPending}
        >
          {mutation.isPending ? "Sending…" : "Send reset link"}
        </Button>
        <Link
          href="/auth/sign-in"
          className="text-primary-ink inline-flex min-h-10 items-center justify-center text-center text-sm font-semibold hover:underline"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
