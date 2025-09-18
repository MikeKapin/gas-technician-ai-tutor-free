import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Canadian Gas Technician AI Tutor - Free",
  description: "Free access to CSA B149.1-25 training content for G3 and G2 gas technician certification. Study materials, code references, and professional exam preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </body>
    </html>
  );
}