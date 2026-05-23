import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starlight 选秀投票",
  description: "为你喜欢的选手投票，见证星光诞生",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-aurora font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
