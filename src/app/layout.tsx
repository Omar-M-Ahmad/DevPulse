import '@/app/globals.css';
import { IBM_Plex_Sans, JetBrains_Mono, Tajawal } from 'next/font/google';

/*
 * preload: false — prevents Turbopack from trying to fetch font files
 * at build time. Fonts will still load normally in the browser via
 * the @font-face rules injected by next/font.
 * This is necessary in environments where fonts.gstatic.com is unreachable.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex',
  display: 'swap',
  preload: false,
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
  preload: false,
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): React.JSX.Element {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${ibmPlexSans.variable} ${tajawal.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
