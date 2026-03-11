import type { Metadata } from 'next';
import { Inter, Syne, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/layout/Providers';
import { RootLayout as AppLayout } from '../components/layout/RootLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', weight: ['400', '500', '600', '700', '800'] });
const syne = Syne({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: ['600', '700', '800'] });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap', weight: ['400', '700'] });

export const metadata: Metadata = {
  title: { default: 'StudyQuest RPG', template: '%s | StudyQuest' },
  description: 'Transforme seus estudos em uma jornada épica. XP, níveis, rankings e banco de provas para universitários.',
  keywords: ['estudos', 'universidade', 'gamificação', 'RPG', 'pomodoro', 'banco de provas'],
  authors: [{ name: 'StudyQuest' }],
  themeColor: '#9333EA',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'StudyQuest RPG',
    title: 'StudyQuest RPG — Transforme seus estudos em uma jornada épica',
    description: 'XP, níveis, rankings e banco de provas para universitários.',
    images: [{ url: '/assets/og-image.png', width: 1200, height: 630, alt: 'StudyQuest RPG' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyQuest RPG',
    description: 'Transforme seus estudos em uma jornada épica.',
    images: ['/assets/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
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
