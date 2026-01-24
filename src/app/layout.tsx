import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layouts/Providers";
import { ConditionalLayout } from "@/components/layouts/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CepetDeal - Marketplace Mobil Baru & Bekas Terpercaya",
    template: "%s | CepetDeal",
  },
  description: "Jual beli mobil baru dan bekas dengan mudah dan aman. Temukan ribuan mobil dengan harga terbaik di CepetDeal.",
  keywords: ["jual mobil", "beli mobil", "mobil bekas", "mobil baru", "marketplace mobil", "dealer mobil"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}

