import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import AuthProvider from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: "Josefi Konzert 2026 - Kartenverkauf",
  description: "Sichere dir jetzt deine Tickets für das Josefi Konzert 2026",
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
        <link 
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=block" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <AuthProvider>
          <Toaster position="bottom-right" richColors expand={true} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}