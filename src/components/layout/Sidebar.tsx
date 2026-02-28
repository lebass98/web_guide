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
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
    onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();

    const toolItems = [
        { icon: Home, label: "공구함 홈", href: "/" },
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
        { icon: MousePointer2, label: "이미지 맵핑", href: "/tools/image-map" },
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

            <div className={cn(
                "fixed top-0 h-screen transition-all duration-300 lg:translate-x-0 z-[100]",
                "right-0 lg:right-auto lg:left-0",
                "w-[280px]", // Mobile width
                isCollapsed ? "lg:w-[80px]" : "lg:w-[240px]", // PC width
                isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
            )}>
                <aside className="w-full h-full glass-sidebar flex flex-col items-center py-6 overflow-y-auto overflow-x-hidden relative">
                    {/* Mobile Close Button & Title */}
                    <div className="lg:hidden w-full px-6 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-lg shadow-lg">
                                <span className="text-white font-bold text-[10px]">W</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 tracking-tight">WebTools</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-600 hover:text-[#1c1c1c] active:scale-90 transition-all rounded-xl hover:bg-gray-100"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* PC Logo */}
                    <div className="mb-10 lg:block hidden">
                        <Link href="/" onClick={onClose}>
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <Hexagon className="w-10 h-10 text-[#1c1c1c] fill-[#1c1c1c]" />
                                <span className="absolute text-white font-bold text-xs">W</span>
                            </div>
                        </Link>
                    </div>

                    {/* Menu Section */}
                    <div className="flex flex-col items-center gap-2 w-full mb-6 flex-1 overflow-visible px-4">
                        <span className={cn(
                            "text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 transition-opacity duration-300",
                            "lg:block",
                            isCollapsed ? "lg:opacity-0 lg:h-0 lg:overflow-hidden" : "lg:opacity-100",
                            "block" // Always block on mobile
                        )}>
                            Tools
                        </span>
                        {toolItems.map((item, i) => (
                            <Link
                                key={i}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-start",
                                    // Mobile: always full width. PC: based on collapse
                                    "w-full gap-4 px-4",
                                    isCollapsed ? "lg:w-12 lg:h-12 lg:justify-center lg:px-0" : "lg:w-full lg:gap-4 lg:px-4",
                                    pathname === item.href
                                        ? "bg-gray-100 text-[#1c1c1c] shadow-sm"
                                        : "text-zinc-600 hover:text-[#1c1c1c] hover:bg-gray-50/50"
                                )}
                                title={isCollapsed ? item.label : ""}
                            >
                                <item.icon className="w-5 h-5 relative z-10 shrink-0" />
                                <span className={cn(
                                    "text-sm font-semibold whitespace-nowrap transition-colors",
                                    isCollapsed ? "lg:hidden" : "lg:block",
                                    "block" // Always block on mobile
                                )}>
                                    {item.label}
                                </span>
                                {pathname === item.href && (
                                    <div className={cn(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1c1c1c] rounded-r-full lg:block hidden",
                                        isCollapsed && "left-0"
                                    )} />
                                )}
                            </Link>
                        ))}
                    </div>
                </aside>

                {/* Collapse Toggle Button (PC) */}
                <button
                    onClick={onToggleCollapse}
                    className="absolute top-1/2 -translate-y-1/2 -right-4 hidden lg:flex w-8 h-8 items-center justify-center bg-white border border-gray-100 rounded-full shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all z-[110] group/collapse"
                    title={isCollapsed ? "메뉴 펼치기" : "메뉴 접기"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-800 transition-transform group-hover/collapse:translate-x-0.5" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-gray-800 transition-transform group-hover/collapse:-translate-x-0.5" />
                    )}
                </button>
            </div>
        </>
    );
}
