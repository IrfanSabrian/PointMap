"use client";

import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./theme-provider";
import { useEffect, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
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
        className={`${inter.variable} ${plusJakarta.variable} antialiased`}
      >
        <ThemeRegistry>{mounted ? children : null}</ThemeRegistry>
      </body>
    </html>
  );
}
