"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearChangePasswordTransfer,
  readChangePasswordTransfer,
} from "@/lib/auth-transfer";
import { changePassword } from "@/lib/api/student";
import { useAuthStore } from "@/stores/auth-store";

export default function ChangePasswordPage() {
  const router = useRouter();
  const logIn = useAuthStore((s) => s.logIn);
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const t = readChangePasswordTransfer();
    if (t?.student) {
      setEmail(t.student.email ?? "");
      setRegNumber(t.student.regNumber ?? "");
    } else if (user) {
      setEmail(user.email ?? "");
      setRegNumber(user.regNumber ?? "");
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: async () => {
      const e = email.trim();
      const r = regNumber.trim();
      if (!e && !r) throw new Error("Enter email or registration number.");
      if (!currentPassword || !newPassword) {
        throw new Error("Current and new password are required.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match.");
      }
      const res = await changePassword({
        ...(e && { email: e }),
        ...(r && { regNumber: r }),
        currentPassword,
        newPassword,
      });
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password changed");
      const t = readChangePasswordTransfer();
      clearChangePasswordTransfer();
      if (t?.student && t.token) {
        logIn({
          user: t.student,
          token: t.token,
          refreshToken: t.refreshToken ?? "",
        });
      }
      router.replace("/");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Change password</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Enter your email or registration number and passwords.
        </p>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email (optional if reg. no. set)</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="min-h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="regNumber">Registration number</Label>
          <Input
            id="regNumber"
            className="min-h-11"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="min-h-11"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            required
            className="min-h-11"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="min-h-11"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="min-h-11"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving…" : "Change password"}
        </Button>
      </form>
    </div>
  );
}
