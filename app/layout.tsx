import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

export const dynamic = 'force-dynamic';

import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { DevModeProvider } from "@/lib/contexts/DevModeContext";
import { GRCProvider } from "@/lib/contexts/GRCDataContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GRCma",
  description: "Governance · Risk · Compliance for the sovereign enterprise.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

import Footer from "@/components/Footer";

// ... existing imports ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
          suppressHydrationWarning
        >
          <DevModeProvider>
            <GRCProvider>
              <LanguageProvider>
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </LanguageProvider>
            </GRCProvider>
          </DevModeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
