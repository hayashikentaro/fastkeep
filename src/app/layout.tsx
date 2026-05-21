import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastKeep",
  description: "軽量なメモとカレンダー投影のための Web MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
