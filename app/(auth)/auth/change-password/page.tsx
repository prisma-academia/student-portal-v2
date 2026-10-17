"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  clearChangePasswordTransfer,
  readChangePasswordTransfer,
} from "@/lib/auth-transfer";
import { changePassword } from "@/lib/api/student";
import { navProgress, useNavPending } from "@/lib/nav-progress";
import { useAuthStore } from "@/stores/auth-store";

export default function ChangePasswordPage() {
  const router = useRouter();
  const leaving = useNavPending();
  const logIn = useAuthStore((s) => s.logIn);
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const t = readChangePasswordTransfer();
    if (t?.student) {
      setEmail(t.student.email ?? "");
      setRegNumber(t.student.regNumber ?? "");
    } else if (user) {
      setEmail(user.email ?? "");
      setRegNumber(user.regNumber ?? "");
      setSignedIn(true);
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
      if (newPassword.length < 8) {
        throw new Error("Use at least 8 characters for your new password.");
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
      navProgress.start();
      router.replace("/");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Change password</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {signedIn ? (
            <>
              For <span className="num text-foreground font-semibold">{regNumber || email}</span>. You&apos;ll stay signed in.
            </>
          ) : (
            "Enter your email or registration number, then your current and new password."
          )}
        </p>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        {!signedIn ? (
        <>
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
        </>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            required
            className="min-h-11"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            required
            className="min-h-11"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
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
          loading={mutation.isPending || leaving}
        >
          {mutation.isPending ? "Saving…" : leaving ? "Opening…" : "Change password"}
        </Button>
        {signedIn ? (
          <Button asChild variant="ghost" className="min-h-11">
            <Link href="/profile">Back to my profile</Link>
          </Button>
        ) : null}
      </form>
    </div>
  );
}
