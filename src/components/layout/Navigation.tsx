"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { TabList } from "./TabList";
import { useTabs } from "@/components/providers/TabProvider";

interface NavigationProps {
    children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    const pathname = usePathname();
    const { tabs } = useTabs();
    const familySites = [
        {
            name: "KRDS 예시 사이트",
            url: "https://lebass98.github.io/KRDS/",
        },
        {
            name: "Portfolio 2026",
            url: "https://lebass98.github.io/Portfolio_2026/",
        },
        {
            name: "BLOG. C (Editor)",
            url: "https://lebass98.github.io/Editor/",
        },
        {
            name: "출석체크",
            url: "https://lebass98.github.io/attendance/",
        },
        {
            name: "WebTools",
            url: "https://lebass98.github.io/web_guide/",
        },
        {
            name: "워드앤코드 디자인웹 템플릿",
            url: "http://lebass98.github.io/Wnc_WebGuide/",
        },
        {
            name: "워드앤코드 프로젝트",
            url: "https://lebass98.github.io/m16/?site=familynet&sort=no",
        },
    ];

    useEffect(() => {
        if (pathname === "/") {
            setIsSidebarCollapsed(true);
        }
    }, [pathname]);
    
    const isHome = pathname === "/";
    const showTabs = !isHome && tabs.length > 0;

    return (
        <div className="flex w-full min-h-screen bg-transparent">
            {/* Sticky Header */}
            <header
                className={cn(
                    "fixed top-0 right-0 left-0 glass-header z-30 flex flex-col transition-all duration-300",
                    showTabs ? "h-28" : "h-16",
                    isSidebarCollapsed ? "lg:left-[80px]" : "lg:left-[240px]"
                )}
            >
                {/* Top Row: Logo & Actions */}
                <div className="flex items-center justify-between px-6 h-16 w-full">
                    {/* Header Title / Logo Link */}
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <img 
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/JKWEBTOOLS.svg`}
                            alt="JKWEBTOOLS" 
                            className="h-[14px] w-auto dark:invert" 
                        />
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {/* Mobile Menu Toggle inside Header */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2.5 glass-card !rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95 transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Tab Menu */}
                {showTabs && <TabList />}
            </header>

            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onClose={() => setIsSidebarOpen(false)}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div
                className={cn(
                    "flex-1 px-5 pb-10 min-w-0 transition-all duration-300",
                    showTabs ? "pt-36" : "pt-24",
                    isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[240px]"
                )}
            >
                <main className="w-full">
                    {children}
                </main>
            </div>

            <button
                onClick={() => setIsFamilyModalOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-xl shadow-indigo-500/30 transition-colors"
                aria-label="패밀리 사이트 열기"
            >
                F
            </button>

            {isFamilyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                        onClick={() => setIsFamilyModalOpen(false)}
                        aria-label="패밀리 사이트 모달 닫기"
                    />
                    <div className="relative w-full max-w-md rounded-2xl p-6 space-y-4 bg-white/90 dark:bg-zinc-900/85 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-2xl shadow-black/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">패밀리 사이트</h2>
                            <button
                                onClick={() => setIsFamilyModalOpen(false)}
                                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                                aria-label="닫기"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">이동할 사이트를 선택하세요.</p>
                        <div className="space-y-2">
                            {familySites.map((site) => (
                                <button
                                    key={site.url}
                                    onClick={() => {
                                        window.open(site.url, "_blank", "noopener,noreferrer");
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-xl border border-white/70 dark:border-white/10 bg-white/55 dark:bg-zinc-900/40 backdrop-blur-md hover:bg-sky-100/70 dark:hover:bg-sky-500/15 hover:border-sky-300 dark:hover:border-sky-400/60 hover:shadow-md hover:shadow-sky-500/10 transition-all"
                                >
                                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">{site.name}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 break-all">{site.url}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
