import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wordmath',
  description: 'A minimalist Wordle-like daily game and practice mode.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Wordmath',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#121212'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
