import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/src/components/providers/i18n-provider";
import { ThemeProvider } from "@/src/components/providers/theme-provider";
import { Header } from "@/src/components/common/header";
import { AuthProvider } from "@/src/components/providers/auth-provider";
import { ReactQueryProvider } from "@/src/components/providers/react-query-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Application",
  description: "Fullstack application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <I18nProvider>
              <AuthProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
                <Toaster richColors position="bottom-right" />
              </AuthProvider>
            </I18nProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

