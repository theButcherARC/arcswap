import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeFlow — Arc Testnet DEX",
  description: "Swap tokens and bulk pay on Arc Testnet",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen flex-col bg-[#f7f7fb] text-[#1e1c2e]">
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}