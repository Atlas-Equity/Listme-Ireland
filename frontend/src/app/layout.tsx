import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";

import { CallProvider } from "@/components/CallProvider";
import { WatchlistProvider } from "@/context/WatchlistContext";

export const metadata: Metadata = {
  title: "ListMe | The Ultimate Marketplace",
  description: "Buy, sell, offer services, and post jobs all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-white text-gray-900 dark:bg-black dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WatchlistProvider>
            <CallProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <CookieConsent />
            </CallProvider>
          </WatchlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
