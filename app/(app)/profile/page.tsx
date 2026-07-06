"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/system/page-loader";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { fetchMe, patchMe } from "@/lib/api/student";
import { useAuthStore } from "@/stores/auth-store";
import type { Student } from "@/types/student";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const logIn = useAuthStore((s) => s.logIn);
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [form, setForm] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      middleName: "",
      dateOfBirth: "",
    },
    contactInfo: { phone: "", email: "", address: "" },
  });

  const q = useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const res = await fetchMe();
      if (!res.ok) throw new Error(res.message);
      return res.data as Student;
    },
  });

  useEffect(() => {
    const p = q.data;
    if (!p) return;
    setForm({
      personalInfo: {
        firstName: p.personalInfo?.firstName ?? "",
        lastName: p.personalInfo?.lastName ?? "",
        middleName: p.personalInfo?.middleName ?? "",
        dateOfBirth: p.personalInfo?.dateOfBirth
          ? new Date(p.personalInfo.dateOfBirth).toISOString().slice(0, 10)
          : "",
      },
      contactInfo: {
        phone: p.contactInfo?.phone ?? "",
        email: p.email ?? p.contactInfo?.email ?? "",
        address: p.contactInfo?.address ?? "",
      },
    });
  }, [q.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await patchMe({
        personalInfo: form.personalInfo,
        contactInfo: form.contactInfo,
      });
      if (!res.ok) throw new Error(res.message);
      return res.data as Student;
    },
    onSuccess: (updated) => {
      toast.success("Profile updated");
      queryClient.setQueryData(["profile", "me"], updated);
      if (token) {
        logIn({
          user: updated,
          token,
          refreshToken: refreshToken ?? "",
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isPending) return <PageLoader className="min-h-[200px]" />;
  if (q.isError) {
    return (
      <QueryErrorPanel
        message={q.error.message}
        onRetry={() => q.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Update your personal and contact details.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal</CardTitle>
          <CardDescription>Legal name and date of birth.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                className="min-h-11"
                value={form.personalInfo.firstName}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    personalInfo: {
                      ...f.personalInfo,
                      firstName: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                className="min-h-11"
                value={form.personalInfo.lastName}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    personalInfo: {
                      ...f.personalInfo,
                      lastName: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="middleName">Middle name</Label>
              <Input
                id="middleName"
                className="min-h-11"
                value={form.personalInfo.middleName}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    personalInfo: {
                      ...f.personalInfo,
                      middleName: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input
                id="dob"
                type="date"
                className="min-h-11"
                value={form.personalInfo.dateOfBirth}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    personalInfo: {
                      ...f.personalInfo,
                      dateOfBirth: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
          <CardDescription>How we reach you.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              className="min-h-11"
              value={form.contactInfo.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactInfo: { ...f.contactInfo, phone: e.target.value },
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="min-h-11"
              value={form.contactInfo.email}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactInfo: { ...f.contactInfo, email: e.target.value },
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              className="min-h-11"
              value={form.contactInfo.address}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactInfo: { ...f.contactInfo, address: e.target.value },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void q.refetch();
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
