import { Sparkles, Network, FileText } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-base font-sans antialiased">
      {/* Left panel — branding, visible on large screens only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 border-r border-border-default/30 bg-bg-base">
        {/* Brand header */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary text-bg-base font-extrabold text-sm">
            G
          </div>
          <span className="font-bold text-text-primary text-base tracking-wide">Casper AI</span>
        </div>

        {/* Content Section */}
        <div className="my-auto max-w-lg">
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            Design systems at the speed of thought.
          </h1>
          <p className="mt-4 text-base text-text-secondary leading-relaxed">
            Describe your architecture in plain English. Casper AI maps it to a shared canvas your whole team can refine in real time.
          </p>

          <div className="mt-12 space-y-6">
            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim border border-accent-primary/20 text-accent-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">AI Architecture Generation</h3>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  Describe your system, AI maps it to nodes and edges on a live canvas.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim border border-accent-primary/20 text-accent-primary">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">Real-time Collaboration</h3>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  Live cursors, presence indicators, and shared node editing across your team.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim border border-accent-primary/20 text-accent-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">Instant Spec Generation</h3>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  Export a complete Markdown technical spec directly from the canvas graph.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Clerk form, always visible */}
      <div className="flex w-full items-center justify-center lg:w-1/2 bg-bg-base py-12 px-6">
        {children}
      </div>
    </div>
  );
}
