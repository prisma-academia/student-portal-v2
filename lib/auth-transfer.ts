import type { Student } from "@/types/student";

const SETUP = "portal_setup";
const CHANGE_PWD = "portal_change_pwd";

export type TransferPayload = {
  student: Student;
  token: string;
  refreshToken: string;
};

export function saveSetupTransfer(p: TransferPayload) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(SETUP, JSON.stringify(p));
}

export function readSetupTransfer(): TransferPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(SETUP);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TransferPayload;
  } catch {
    return null;
  }
}

export function clearSetupTransfer() {
  sessionStorage.removeItem(SETUP);
}

export function saveChangePasswordTransfer(p: TransferPayload) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(CHANGE_PWD, JSON.stringify(p));
}

export function readChangePasswordTransfer(): TransferPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(CHANGE_PWD);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TransferPayload;
  } catch {
    return null;
  }
}

export function clearChangePasswordTransfer() {
  sessionStorage.removeItem(CHANGE_PWD);
}
