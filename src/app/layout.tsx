import '@/app/globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans, JetBrains_Mono, Tajawal } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevPulse — GitHub Repository Health Monitor',
  description:
    'Monitor your GitHub repositories. Know which projects are active, cooling, or stale.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${ibmPlexSans.variable} ${tajawal.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
