import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'BKU Tickets - Josefi Konzert 2026',
  description: 'Tickets für das Josefi Konzert 2026 der Bürgerkapelle Untermais',
  metadataBase: new URL('https://bku-tickets.untgab.com/'), // DEINE URL
  openGraph: {
    title: 'BKU Tickets - Josefi Konzert 2026',
    description: 'Tickets für das Josefi Konzert 2026 der Bürgerkapelle Untermais',
    url: 'https://bku-tickets.untgab.com/',
    siteName: 'BKU Tickets',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BKU Tickets - Josefi Konzert 2026',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BKU Tickets - Josefi Konzert 2026',
    description: 'Tickets für das Josefi Konzert 2026 der Bürgerkapelle Untermais',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <SessionWrapper>
          {children}
          <Footer />
          <Toaster position="top-center" richColors />
          <CookieBanner />
        </SessionWrapper>
      </body>
    </html>
  );
}
