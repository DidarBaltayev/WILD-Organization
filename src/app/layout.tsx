import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Teko } from "next/font/google";
import localFont from "next/font/local";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* Google fonts */
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const teko = Teko({
  subsets: ["latin", "latin-ext"],
  variable: "--font-teko",
  display: "swap",
});

/* ✅ ТВОЙ ШРИФТ — ПРАВИЛЬНО */
const dewi = localFont({
  src: "../fonts/RFDewiExpanded-Light.ttf",
  variable: "--font-dewi",
  display: "swap",
  weight: "300",
});

export const metadata: Metadata = {
  title: "WILD Cybersport",
  description: "WILD esports platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body
        className={[
          inter.variable,
          teko.variable,
          dewi.variable, // 🔥 ВАЖНО
          "bg-black text-white antialiased min-h-screen overflow-x-hidden",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
