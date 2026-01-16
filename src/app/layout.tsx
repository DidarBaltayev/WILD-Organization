import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Teko } from "next/font/google";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// ✅ Премиум Inter: полный диапазон весов + корректные fallback метрики
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  adjustFontFallback: true,
});

// ✅ Заголовочный шрифт: оставляем Teko, но он будет жить только на headings через CSS
const teko = Teko({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-teko",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WILD Cybersport — CS2 Platform",
    template: "%s · WILD",
  },
  description: "Матчи, рейтинги, составы и стримы WILD по CS2.",
  keywords: ["WILD", "CS2", "киберспорт", "esports", "матчи", "рейтинги"],
  applicationName: "WILD Cybersport",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "WILD Cybersport",
    title: "WILD Cybersport — CS2 Platform",
    description: "Матчи, рейтинги, составы и стримы WILD по CS2.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "WILD Cybersport" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WILD Cybersport — CS2 Platform",
    description: "Матчи, рейтинги, составы и стримы WILD по CS2.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
  },
  category: "esports",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className={`${inter.variable} ${teko.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
