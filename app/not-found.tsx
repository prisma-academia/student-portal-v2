import Link from "next/link";
import { SchoolLogo } from "@/components/brand/school-logo";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <GradientMesh className="-z-10" />
      <SchoolLogo className="size-14 text-xl" />
      <h1 className="mt-6 text-3xl font-extrabold">This page doesn&apos;t exist</h1>
      <p className="text-muted-foreground mt-2 max-w-sm">
        The link may be old or mistyped. Your fees, results and notices are all on the home page.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/">Go to home</Link>
      </Button>
    </div>
  );
}
