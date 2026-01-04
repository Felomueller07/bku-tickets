import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BKU Tickets - Josefi Konzert 2026",
  description: "Ticketverkauf für das Josefi Konzert 2026 im Kursaal Meran",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SessionProviderWrapper>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
          <Toaster position="top-center" />
          <CookieBanner />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
