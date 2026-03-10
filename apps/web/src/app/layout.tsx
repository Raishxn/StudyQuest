import type { Metadata } from 'next';
import { Inter, Cinzel, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/layout/Providers';
import { RootLayout as AppLayout } from '../components/layout/RootLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', weight: ['400', '500', '600', '700', '800'] });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', display: 'swap', weight: ['700', '800'] });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap', weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'StudyQuest RPG',
  description: 'Plataforma web de estudos gamificada para universitários.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'StudyQuest RPG',
    description: 'Plataforma web de estudos gamificada para universitários.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('studyquest-theme') || localStorage.getItem('sq-theme-store');
                if (theme) {
                   try { theme = JSON.parse(theme).state.theme; } catch(e) {}
                }
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? 'dark-purple' 
                    : 'light-purple';
                }
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-background-base text-text-primary antialiased min-h-screen font-sans flex flex-col">
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
