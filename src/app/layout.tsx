import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Settings, FileText, Code, Link as LinkIcon, Hash, MapPin, QrCode, Type, Binary, Palette, Clock } from "lucide-react";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebTools - Premium Developer Utilities",
  description: "A collection of premium web utilities for developers including formatters, converters, and encoders.",
};

const navigationItems = [
  { title: "HTML Special Chars", href: "/tools/html-chars", icon: Code },
  { title: "JSON Formatter", href: "/tools/json-formatter", icon: FileText },
  { title: "Color Converter", href: "/tools/color-converter", icon: Palette },
  { title: "Text Transformer", href: "/tools/text-transformer", icon: Type },
  { title: "Base64 Converter", href: "/tools/base64", icon: Binary },
  { title: "URL Encoder", href: "/tools/url-encoder", icon: LinkIcon },
  { title: "QR Generator", href: "/tools/qr-generator", icon: QrCode },
  { title: "Timestamp", href: "/tools/timestamp", icon: Clock },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex bg-background`}
      >
        <Sidebar items={navigationItems} activePath="/" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
