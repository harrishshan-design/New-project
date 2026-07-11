import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://realitygenius.company";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "RealityGenius | AI Property Operating Platform Malaysia",
  description:
    "RealityGenius is an AI-powered property operating platform for Malaysian buyers, agents, Telegram listing import, admin approval, and buyer-agent matching.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "RealityGenius",
    title: "RealityGenius | AI Property Operating Platform Malaysia",
    description:
      "Search verified Malaysian property with AI insights, 360 immersive tours, and direct agent contact. Agents get an AI workspace that uploads listings in 60 seconds.",
    images: [{ url: "/og-cover.png", width: 1440, height: 1000, alt: "RealityGenius property platform" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "RealityGenius | AI Property Operating Platform Malaysia",
    description:
      "Search verified Malaysian property with AI insights, 360 immersive tours, and direct agent contact.",
    images: ["/og-cover.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-100QC1J9RT" strategy="afterInteractive" />
        <Script id="rg-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-100QC1J9RT');`}
        </Script>
      </body>
    </html>
  );
}
