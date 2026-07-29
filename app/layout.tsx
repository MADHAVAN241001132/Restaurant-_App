import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GustoBites | Premium Full-Stack Restaurant Ordering Platform",
  description: "Experience gourmet culinary delights delivered hot and fresh directly to your doorstep. Browse our multi-cuisine menu, apply coupons, and enjoy fast ordering.",
  keywords: ["restaurant", "food delivery", "online ordering", "pizza", "burger", "gourmet", "next.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased scroll-smooth">
      <body className={`${inter.variable} min-h-full flex flex-col bg-background text-foreground font-sans`}>
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
