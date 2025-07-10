"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./theme-provider";
import { useEffect, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

// Fallback untuk Oswald font menggunakan Google Fonts CDN
const oswald = {
  variable: "--font-oswald",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} ${oswald.variable} antialiased`}
      >
        <ThemeRegistry>{mounted ? children : null}</ThemeRegistry>
      </body>
    </html>
  );
}
