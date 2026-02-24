import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

export const metadata: Metadata = {
  title: "WebTools - 프리미엄 개발자 유틸리티",
  description: "포매터, 변환기 및 인코더를 포함한 개발자를 위한 프리미엄 웹 유틸리티 모음입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="font-sans antialiased min-h-screen flex bg-white text-zinc-900"
      >
        <Navigation>{children}</Navigation>
      </body>
    </html>
  );
}
