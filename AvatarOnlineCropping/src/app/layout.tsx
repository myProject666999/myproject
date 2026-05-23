import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "头像在线裁剪 - 专业头像制作工具",
  description: "上传图片，快速裁剪成圆形/方形头像，添加精美边框和节日皮肤",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
