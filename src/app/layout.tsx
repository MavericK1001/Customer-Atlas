import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SHOPIFY_APP_URL ?? "http://localhost:3000"),
  title: "CustomerAtlas",
  applicationName: "CustomerAtlas",
  description:
    "Shopify customer intelligence platform for insights, segmentation, and LTV prediction.",
  icons: {
    icon: "/logo/CustomerAtlasLogo.png",
    shortcut: "/logo/CustomerAtlasLogo.png",
    apple: "/logo/CustomerAtlasLogo.png",
  },
  openGraph: {
    title: "CustomerAtlas",
    description:
      "Shopify customer intelligence platform for insights, segmentation, and LTV prediction.",
    images: ["/logo/CustomerAtlasLogo.png"],
  },
  twitter: {
    card: "summary",
    title: "CustomerAtlas",
    description:
      "Shopify customer intelligence platform for insights, segmentation, and LTV prediction.",
    images: ["/logo/CustomerAtlasLogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shopifyApiKey = process.env.SHOPIFY_API_KEY ?? "";

  return (
    <html lang="en">
      <head>
        <meta name="shopify-api-key" content={shopifyApiKey} />
        <Script
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
