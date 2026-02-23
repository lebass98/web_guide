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
    { title: "HTML Special Chars", href: "/tools/html-chars", icon: Code },
    { title: "JSON Formatter", href: "/tools/json-formatter", icon: FileText },
    { title: "Color Converter", href: "/tools/color-converter", icon: Palette },
    { title: "Text Transformer", href: "/tools/text-transformer", icon: Type },
    { title: "Base64 Converter", href: "/tools/base64", icon: Binary },
    { title: "URL Encoder", href: "/tools/url-encoder", icon: LinkIcon },
    { title: "QR Generator", href: "/tools/qr-generator", icon: QrCode },
    { title: "Timestamp", href: "/tools/timestamp", icon: Clock },
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
