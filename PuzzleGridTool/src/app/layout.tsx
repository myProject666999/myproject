import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '九宫格拼图工具 - PuzzleGridTool',
  description: '在线制作朋友圈九宫格拼图，支持多图上传、布局选择、间距边框设置、文字水印、一键下载',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
