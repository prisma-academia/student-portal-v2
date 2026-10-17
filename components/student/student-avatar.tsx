"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveAssetUrl } from "@/lib/config";
import { displayName, fullName, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Student } from "@/types/student";

/**
 * The student's passport photo (stored as a relative /uploads path on the API),
 * as a rounded square like the ID card photo; initials while loading or missing.
 */
export function StudentAvatar({
  student,
  className,
}: {
  student: Student | null | undefined;
  className?: string;
}) {
  const name = displayName(fullName(student?.personalInfo)) || "Student";
  const src = resolveAssetUrl(student?.picture);
  return (
    <Avatar className={cn("size-9 rounded-[30%] ring-1 ring-black/5", className)}>
      {src ? (
        <AvatarImage src={src} alt={`${name}'s photo`} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-primary-soft text-primary-ink rounded-[30%] font-display font-bold">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
