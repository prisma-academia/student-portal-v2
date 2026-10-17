"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  clearSetupTransfer,
  readSetupTransfer,
} from "@/lib/auth-transfer";
import { setupAccountFormData } from "@/lib/api/student";
import { unwrapData } from "@/lib/api/client";
import { navProgress, useNavPending } from "@/lib/nav-progress";
import { useAuthStore } from "@/stores/auth-store";
import type { Student } from "@/types/student";

export default function SetupPage() {
  const router = useRouter();
  const leaving = useNavPending();
  const logIn = useAuthStore((s) => s.logIn);
  const [transfer, setTransfer] = useState<ReturnType<
    typeof readSetupTransfer
  > | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    const t = readSetupTransfer();
    if (!t?.student) {
      toast.error("Session expired. Please sign in again.");
      router.replace("/auth/sign-in");
      return;
    }
    setTransfer(t);
  }, [router]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!transfer?.student) throw new Error("Missing student");
      const email = transfer.student.email?.trim();
      const regNumber = transfer.student.regNumber?.trim();
      if (!email && !regNumber) {
        throw new Error("Student email or registration number is missing.");
      }
      if (!form.currentPassword || !form.newPassword) {
        throw new Error("Current and new password are required.");
      }
      if (form.newPassword !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (!form.dateOfBirth) {
        throw new Error("Date of birth is required.");
      }
      if (!file) {
        throw new Error("A profile picture is required.");
      }

      // The picture is required, so setup is always multipart.
      const fd = new FormData();
      if (email) fd.append("email", email);
      if (regNumber) fd.append("regNumber", regNumber);
      fd.append("currentPassword", form.currentPassword);
      fd.append("newPassword", form.newPassword);
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("picture", file);
      const res = await setupAccountFormData(fd);
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (data) => {
      const payload = unwrapData<{
        student?: Student;
        token?: string;
        refreshToken?: string;
      }>(data);
      if (!payload?.student || !payload.token) {
        toast.error("Invalid setup response");
        return;
      }
      clearSetupTransfer();
      logIn({
        user: payload.student,
        token: payload.token,
        refreshToken: payload.refreshToken ?? "",
      });
      toast.success("Account activated");
      navProgress.start();
      router.replace("/");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!transfer) {
    return (
      <p className="text-muted-foreground text-center text-sm">Loading…</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Activate account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Set your password and date of birth, and add a profile photo.
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
          <Label htmlFor="currentPassword">Current password</Label>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            required
            className="min-h-11"
            value={form.currentPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, currentPassword: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            required
            className="min-h-11"
            value={form.newPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, newPassword: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            required
            className="min-h-11"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, confirmPassword: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            required
            className="min-h-11"
            value={form.dateOfBirth}
            onChange={(e) =>
              setForm((f) => ({ ...f, dateOfBirth: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="picture">Profile picture</Label>
          <Input
            id="picture"
            type="file"
            accept="image/*"
            required
            className="min-h-11 py-2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button
          type="submit"
          className="min-h-11"
          loading={mutation.isPending || leaving}
        >
          {mutation.isPending ? "Saving…" : leaving ? "Opening…" : "Complete setup"}
        </Button>
      </form>
    </div>
  );
}
