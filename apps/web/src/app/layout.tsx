import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyQuest RPG",
  description: "Plataforma web de estudos gamificada para universitários.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('studyquest-theme');
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
      <body className={`${inter.className} bg-background-base text-text-primary antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
