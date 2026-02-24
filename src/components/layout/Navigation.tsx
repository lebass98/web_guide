"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";
import { type LucideIcon, Code, FileText, Palette, Type, Binary, Link as LinkIcon, QrCode, Clock } from "lucide-react";

interface NavigationItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

const navigationItems: NavigationItem[] = [
    { title: "HTML 특수문자 변환", href: "/tools/html-chars", icon: Code },
    { title: "JSON 포매터", href: "/tools/json-formatter", icon: FileText },
    { title: "색상 변환기", href: "/tools/color-converter", icon: Palette },
    { title: "텍스트 변환기", href: "/tools/text-transformer", icon: Type },
    { title: "Base64 변환기", href: "/tools/base64", icon: Binary },
    { title: "URL 인코더", href: "/tools/url-encoder", icon: LinkIcon },
    { title: "QR 코드 생성기", href: "/tools/qr-generator", icon: QrCode },
    { title: "타임스탬프 변환기", href: "/tools/timestamp", icon: Clock },
];

interface NavigationProps {
    children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <Sidebar
                items={navigationItems}
                activePath={pathname}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </>
    );
}
