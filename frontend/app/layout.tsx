import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Music Companion — Your library, understood",
  description: "用自然语言整理和重新发现你的 Apple Music 资料库。",
  openGraph: {
    title: "Music Companion — Your library, understood",
    description: "用自然语言整理和重新发现你的 Apple Music 资料库。",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Music Companion — Your library, understood",
    description: "用自然语言整理和重新发现你的 Apple Music 资料库。",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
