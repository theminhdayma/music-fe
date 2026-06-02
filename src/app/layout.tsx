import { AuthProvider } from "@/features/auth/providers/auth-provider";
import { GlobalMusicPlayerShell } from "@/features/player/components/global-music-player";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: {
    default: "Ecommerce Music",
    template: "%s | Ecommerce Music",
  },
  description: "Premium beat marketplace for discovering, licensing, and selling music.",
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
      <body className="min-h-full flex flex-col pb-[7.5rem]">
        <AuthProvider>
          {children}
          <GlobalMusicPlayerShell />
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
