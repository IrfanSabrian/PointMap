import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PointMap Polnep",
  description: "Peta Interaktif Politeknik Negeri Pontianak",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
