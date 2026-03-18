import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TabProvider } from "@/components/providers/TabProvider";

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
        <html lang="ko" suppressHydrationWarning>
            <body className="font-sans antialiased min-h-screen flex text-zinc-900 dark:text-zinc-100">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TabProvider>
                        <Navigation>{children}</Navigation>
                    </TabProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
