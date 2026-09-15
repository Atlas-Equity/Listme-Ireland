import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";

import { CallProvider } from "@/components/CallProvider";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { ToastProvider } from "@/context/ToastContext";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.listme.ie';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ListMe Ireland | The Trusted Marketplace, Auctions & Local Services",
    template: "%s | ListMe Ireland",
  },
  description: "Ireland's modern marketplace. Buy & sell motors, electronics, fashion, find local trade services, bid in live auctions, and discover jobs in Dublin, Cork, Galway and nationwide.",
  keywords: [
    "Marketplace Ireland",
    "Buy and sell Ireland",
    "DoneDeal alternative",
    "Adverts alternative Ireland",
    "Dublin classifieds",
    "Cork classifieds",
    "Galway classifieds",
    "Irish auctions",
    "Used cars Ireland",
    "Electronics Ireland",
    "Trade services Ireland",
    "Jobs in Ireland",
    "Listme",
    "Listme Ireland",
  ],
  authors: [{ name: "ListMe Ireland" }],
  creator: "ListMe Ireland",
  publisher: "ListMe Ireland",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: siteUrl,
    siteName: "ListMe Ireland",
    title: "ListMe Ireland | The Trusted Marketplace, Auctions & Local Services",
    description: "Buy & sell motors, electronics, fashion, find local trade services, bid in live auctions, and discover jobs across Ireland.",
    images: [
      {
        url: "/clover-logo.png",
        width: 512,
        height: 512,
        alt: "ListMe Ireland Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ListMe Ireland | The Trusted Marketplace, Auctions & Local Services",
    description: "Buy & sell motors, electronics, fashion, find local trade services, bid in live auctions, and discover jobs across Ireland.",
    images: ["/clover-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "ListMe Ireland",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/clover-logo.png`,
        "caption": "ListMe Ireland",
      },
      "sameAs": [
        "https://www.facebook.com/profile.php?id=61594336620072",
      ],
      "areaServed": "IE",
      "description": "Ireland's modern marketplace for auctions, classifieds, trades, and local services.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "ListMe Ireland",
      "description": "Buy, sell, offer services, bid in auctions, and find jobs across Ireland.",
      "publisher": {
        "@id": `${siteUrl}/#organization`,
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://iaimexnxxwrchwpmbvlt.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://iaimexnxxwrchwpmbvlt.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-white text-gray-900 dark:bg-black dark:text-white">
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-06HGSQYVLM"
        />
        <Script id="google-tag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-06HGSQYVLM');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
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
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
