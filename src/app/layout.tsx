import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Perfume Profit Tracker',
  description: 'Manage sales, investments, and inventory for your perfume business.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppProvider>
            <AppShell>
              {children}
              <Toaster />
            </AppShell>
          </AppProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
