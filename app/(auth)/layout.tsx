import { AuthLayoutClient } from "@/components/auth-layout-client";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
