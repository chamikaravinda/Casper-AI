import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = {
  variable: "--font-geist-sans",
};

const geistMono = {
  variable: "--font-geist-mono",
};

export const metadata: Metadata = {
  title: "Casper AI",
  description: "Casper AI",
};

const localization = {
  signIn: {
    start: {
      title: "Sign in to Casper AI",
      subtitle: "Welcome back! Please sign in to continue",
    },
  },
  signUp: {
    start: {
      title: "Sign up to Casper AI",
      subtitle: "Create your account to get started",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          localization={localization}
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: "var(--accent-primary)",
              colorBackground: "var(--bg-surface)",
              colorForeground: "var(--text-primary)",
              colorMutedForeground: "var(--text-muted)",
              colorInput: "var(--bg-elevated)",
              colorInputForeground: "var(--text-primary)",
              colorBorder: "var(--border-default)",
              colorNeutral: "var(--text-secondary)",
              borderRadius: "0.75rem",
            },
            elements: {
              cardBox: "shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-border-default/50 rounded-3xl overflow-hidden",
              card: "bg-bg-surface border-0 shadow-none rounded-3xl p-6 md:p-8",
              headerTitle: "text-text-primary font-bold text-xl",
              headerSubtitle: "text-text-muted text-sm",
              socialButtonsBlockButton: "bg-bg-elevated border border-border-default hover:bg-bg-subtle text-text-primary rounded-xl font-medium transition-all duration-200",
              formFieldLabel: "text-text-secondary font-medium text-xs",
              formFieldInput: "bg-bg-subtle border border-border-default text-text-primary rounded-xl focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all duration-200",
              formButtonPrimary: "bg-accent-primary hover:bg-accent-primary/90 text-bg-base font-bold transition-all duration-200 rounded-xl",
              footerActionLink: "text-accent-primary hover:text-accent-primary/80 transition-all font-medium",
              footerActionText: "text-text-muted",
              dividerRow: "text-text-muted",
              dividerLine: "bg-border-default",
              dividerText: "text-text-muted font-medium text-xs",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}