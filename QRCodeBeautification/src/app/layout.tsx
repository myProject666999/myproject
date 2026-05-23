import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "二维码美化生成器",
  description: "生成带Logo、圆点、颜色的美化二维码",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
