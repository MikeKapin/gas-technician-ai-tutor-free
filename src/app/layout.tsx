import type { Metadata } from "next";
import "./globals.css";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

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
      <body>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </body>
    </html>
  );
}