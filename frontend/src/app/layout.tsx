"use client";

import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./theme-provider";
import { useEffect, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-oswald",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} ${oswald.variable} antialiased`}
      >
        <ThemeRegistry>{mounted ? children : null}</ThemeRegistry>
      </body>
    </html>
  );
}
