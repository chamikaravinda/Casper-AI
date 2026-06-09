import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-bg-base text-center p-6 relative">
      {/* Background glow matching Casper style */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,200,212,0.02),transparent_60%)]" />
      
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-default bg-bg-surface text-accent-primary mb-6 shadow-lg shadow-accent-primary-dim z-10">
        <Lock className="h-8 w-8" />
      </div>
      
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2 z-10">
        Access Denied
      </h1>
      
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed z-10">
        You do not have permission to view this project, or the project does not exist.
      </p>
      
      <Link href="/editor" passHref legacyBehavior>
        <Button
          variant="default"
          className="bg-accent-primary text-bg-base hover:bg-accent-primary/90 font-medium px-6 shadow-md transition-all hover:scale-[1.02] z-10"
        >
          Back to Projects
        </Button>
      </Link>
    </div>
  );
}
