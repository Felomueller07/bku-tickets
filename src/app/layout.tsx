import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "BKU Tickets - Josefi Konzert 2026",
  description: "Tickets für das Josefi Konzert 2026 der Bürgerkapelle Untermais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <SessionWrapper>
          {children}
          <Toaster position="top-center" richColors />
          <CookieBanner />
        </SessionWrapper>
      </body>
    </html>
  );
}
