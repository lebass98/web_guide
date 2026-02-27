"use client";

import Link from "next/link";
import {
    Home,
    Code,
    FileText,
    Palette,
    Type,
    Binary,
    Link as LinkIcon,
    QrCode,
    Clock,
    Paintbrush,
    Layers,
    MousePointer2,
    Settings,
    Hexagon,
    Sparkles,
    Layout,
    Monitor,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const toolItems = [
        { icon: Home, label: "공구함 홈", href: "/" },
        { icon: MousePointer2, label: "이미지 맵핑", href: "/tools/image-map" },
        { icon: Code, label: "HTML 특수문자", href: "/tools/html-chars" },
        { icon: FileText, label: "JSON 포매터", href: "/tools/json-formatter" },
        { icon: Palette, label: "색상 변환기", href: "/tools/color-converter" },
        { icon: Type, label: "텍스트 변환기", href: "/tools/text-transformer" },
        { icon: Binary, label: "Base64 변환기", href: "/tools/base64" },
        { icon: LinkIcon, label: "URL 인코더", href: "/tools/url-encoder" },
        { icon: QrCode, label: "QR 생성기", href: "/tools/qr-generator" },
        { icon: Clock, label: "타임스탬프", href: "/tools/timestamp" },
        { icon: Paintbrush, label: "CSS 그라데이션", href: "/tools/css-gradient" },
        { icon: Layers, label: "그라데이션 배경", href: "/tools/gradient-backgrounds" },
    ];

    const settingItems = [
        { icon: Sparkles, label: "Premium", href: "/premium" },
        { icon: Layout, label: "Layout", href: "/layout" },
        { icon: Monitor, label: "Display", href: "/display" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-gray-900/10 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside className={cn(
                "fixed top-0 h-screen w-[80px] glass-sidebar flex flex-col items-center py-6 transition-transform duration-300 lg:translate-x-0 z-[100]",
                "right-0 lg:right-auto lg:left-0",
                isOpen ? "translate-x-0" : "translate-x-full",
                "overflow-visible"
            )}>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="lg:hidden mb-6 p-2 text-gray-400 hover:text-[#1c1c1c] active:scale-90 transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Logo */}
                <div className="mb-6 lg:block hidden">
                    <Link href="/" onClick={onClose}>
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <Hexagon className="w-10 h-10 text-[#1c1c1c] fill-[#1c1c1c]" />
                            <span className="absolute text-white font-bold text-xs">W</span>
                        </div>
                    </Link>
                </div>

                {/* Menu Section */}
                <div className="flex flex-col items-center gap-2 w-full mb-6 flex-1 overflow-visible">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 lg:block hidden">Tools</span>
                    {toolItems.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-200 group relative",
                                pathname === item.href
                                    ? "bg-gray-50 text-[#1c1c1c]"
                                    : "text-gray-400 hover:text-[#1c1c1c] hover:bg-gray-50/50"
                            )}
                        >
                            <item.icon className="w-5 h-5 relative z-10" />

                            {/* Premium Tooltip */}
                            <div className={cn(
                                "absolute top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1c1c1c] text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[110] shadow-xl pointer-events-none",
                                "right-[calc(100%+12px)] translate-x-[8px] group-hover:translate-x-0 lg:right-auto lg:left-[calc(100%+12px)] lg:translate-x-[-8px] lg:group-hover:translate-x-0"
                            )}>
                                {item.label}
                                {/* Tooltip Arrow */}
                                <div className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1c1c1c] rotate-45",
                                    "right-[-4px] lg:right-auto lg:left-[-4px]"
                                )} />
                            </div>

                            {pathname === item.href && (
                                <div className="absolute left-0 lg:left-0 right-0 lg:right-auto top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1c1c1c] rounded-r-full lg:block hidden" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Settings Section */}
                <div className="flex flex-col items-center gap-2 w-full mb-6 pt-4 border-t border-gray-50 overflow-visible">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 lg:block hidden">Settings</span>
                    {settingItems.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-200 group relative",
                                pathname === item.href
                                    ? "bg-gray-50 text-[#1c1c1c]"
                                    : "text-gray-400 hover:text-[#1c1c1c] hover:bg-gray-50/50"
                            )}
                        >
                            <item.icon className="w-5 h-5 relative z-10" />

                            {/* Premium Tooltip */}
                            <div className={cn(
                                "absolute top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1c1c1c] text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[110] shadow-xl pointer-events-none",
                                "right-[calc(100%+12px)] translate-x-[8px] group-hover:translate-x-0 lg:right-auto lg:left-[calc(100%+12px)] lg:translate-x-[-8px] lg:group-hover:translate-x-0"
                            )}>
                                {item.label}
                                {/* Tooltip Arrow */}
                                <div className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1c1c1c] rotate-45",
                                    "right-[-4px] lg:right-auto lg:left-[-4px]"
                                )} />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Account Section */}
                <div className="mt-auto px-4 w-full flex flex-col items-center gap-4 pt-4 border-t border-gray-50">
                    <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform active:scale-95">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </aside>
        </>
    );
}
