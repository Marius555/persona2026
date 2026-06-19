import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import { ToastProvider } from "@/components/toast-provider";
import { RouteTransition } from "@/components/transitions/route-transition";
import { TransitionProvider } from "@/components/transitions/transition-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "persona2 — AI-powered creator personas",
  description: "Build your AI-powered creator persona, manage your content, and grow your audience with persona2.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme is rendered server-side from a cookie so there's no flash and no
  // client-side mutation of <html> (which would cause a hydration mismatch).
  // When unset, CSS `prefers-color-scheme` in globals.css follows the OS.
  const theme = (await cookies()).get("theme")?.value;
  const themeClass = theme === "dark" ? "dark" : theme === "light" ? "light" : "";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-hidden antialiased ${themeClass}`}
    >
      <body className="min-h-full flex flex-col">
        <TransitionProvider>
          <RouteTransition scope="section">{children}</RouteTransition>
        </TransitionProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
