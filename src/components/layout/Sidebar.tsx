"use client";

import Link from "next/link";
import { useState } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { TOOL_ITEMS } from "@/lib/constants";
import { motion } from "framer-motion";

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
    onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const [hoverTool, setHoverTool] = useState<{ label: string; top: number } | null>(null);

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
                {/* Global Tooltip for Collapsed State */}
                {isCollapsed && hoverTool && (
                    <div 
                        className="fixed left-[80px] ml-4 px-3 py-2 bg-gray-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-gray-900 text-[11px] font-bold rounded-xl whitespace-nowrap z-[999] shadow-2xl pointer-events-none border border-white/10 dark:border-black/10 lg:block hidden animate-in fade-in zoom-in-95 duration-200"
                        style={{ top: hoverTool.top, transform: 'translateY(-50%)' }}
                    >
                        {hoverTool.label}
                        {/* Tooltip Arrow */}
                        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gray-900/95 dark:bg-white/95 rotate-45 border-l border-b border-white/10 dark:border-black/10" />
                    </div>
                )}

                <aside className="w-full h-full glass-sidebar flex flex-col items-center py-6 relative transition-all duration-300 overflow-hidden">
                    {/* Mobile Close Button & Title */}
                    <div className="lg:hidden w-full px-6 mb-8 flex items-center justify-between">
                        <div className="flex items-center">
                            <img 
                                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/JKWEBTOOLS.svg`}
                                alt="JKWEBTOOLS" 
                                className="h-[14px] w-auto dark:invert" 
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-[#1c1c1c] dark:hover:text-white active:scale-90 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>


                    {/* Menu Section */}
                    <div className="flex flex-col items-center gap-2 w-full mb-6 flex-1 px-4 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-track]:bg-transparent pr-2">
                        {/* Section: UI 요소 */}
                        <div className="w-full flex flex-col items-center gap-1 mb-2">
                            <span className={cn(
                                "text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 px-2 w-full transition-opacity duration-300",
                                "lg:block",
                                isCollapsed ? "lg:opacity-0 lg:h-0 lg:overflow-hidden lg:m-0" : "lg:opacity-100",
                                "block"
                            )}>
                                UI 요소
                            </span>
                            {TOOL_ITEMS.filter((item) => item.category === "ui").map((item, i) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={onClose}
                                    onMouseEnter={(e) => {
                                        if (isCollapsed) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setHoverTool({ label: `[UI 요소] ${item.label}`, top: rect.top + rect.height / 2 });
                                        }
                                    }}
                                    onMouseLeave={() => setHoverTool(null)}
                                    className={cn(
                                        "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-start",
                                        "w-full gap-4 px-4 shrink-0",
                                        isCollapsed ? "lg:w-12 lg:h-12 lg:justify-center lg:px-0" : "lg:w-full lg:gap-4 lg:px-4",
                                        pathname === item.href
                                            ? "text-[#1c1c1c] dark:text-white"
                                            : "text-zinc-600 dark:text-zinc-400 hover:text-[#1c1c1c] dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    {pathname === item.href && (
                                        <motion.div
                                            layoutId="activeSidebarBg"
                                            className="absolute inset-0 bg-gray-100 dark:bg-zinc-800 rounded-xl -z-10 shadow-sm"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className="w-5 h-5 relative z-10 shrink-0 text-indigo-600 dark:text-indigo-400" />
                                    <span className={cn(
                                        "text-sm font-semibold whitespace-nowrap transition-colors relative z-10",
                                        isCollapsed ? "lg:hidden" : "lg:block",
                                        "block"
                                    )}>
                                        {item.label}
                                    </span>

                                    {pathname === item.href && (
                                        <motion.div 
                                            layoutId="activeSidebarIndicator"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            className={cn(
                                                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r-full lg:block hidden",
                                                isCollapsed && "left-0"
                                            )} 
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className={cn(
                            "w-full border-t border-gray-100 dark:border-zinc-800 my-1",
                            isCollapsed ? "lg:w-8" : "lg:w-full"
                        )} />

                        {/* Section: Tools */}
                        <div className="w-full flex flex-col items-center gap-1">
                            <span className={cn(
                                "text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-2 w-full transition-opacity duration-300",
                                "lg:block",
                                isCollapsed ? "lg:opacity-0 lg:h-0 lg:overflow-hidden lg:m-0" : "lg:opacity-100",
                                "block"
                            )}>
                                Tools
                            </span>
                            {TOOL_ITEMS.filter((item) => item.category !== "ui").map((item, i) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={onClose}
                                    onMouseEnter={(e) => {
                                        if (isCollapsed) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setHoverTool({ label: item.label, top: rect.top + rect.height / 2 });
                                        }
                                    }}
                                    onMouseLeave={() => setHoverTool(null)}
                                    className={cn(
                                        "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-start",
                                        "w-full gap-4 px-4 shrink-0",
                                        isCollapsed ? "lg:w-12 lg:h-12 lg:justify-center lg:px-0" : "lg:w-full lg:gap-4 lg:px-4",
                                        pathname === item.href
                                            ? "text-[#1c1c1c] dark:text-white"
                                            : "text-zinc-600 dark:text-zinc-400 hover:text-[#1c1c1c] dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    {pathname === item.href && (
                                        <motion.div
                                            layoutId="activeSidebarBg"
                                            className="absolute inset-0 bg-gray-100 dark:bg-zinc-800 rounded-xl -z-10 shadow-sm"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className="w-5 h-5 relative z-10 shrink-0" />
                                    <span className={cn(
                                        "text-sm font-semibold whitespace-nowrap transition-colors relative z-10",
                                        isCollapsed ? "lg:hidden" : "lg:block",
                                        "block"
                                    )}>
                                        {item.label}
                                    </span>

                                    {pathname === item.href && (
                                        <motion.div 
                                            layoutId="activeSidebarIndicator"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            className={cn(
                                                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1c1c1c] dark:bg-white rounded-r-full lg:block hidden",
                                                isCollapsed && "left-0"
                                            )} 
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Collapse Toggle Button (PC) */}
                <button
                    onClick={onToggleCollapse}
                    className="absolute top-1/2 -translate-y-1/2 -right-4 hidden lg:flex w-8 h-8 items-center justify-center bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-full shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all z-[110] group/collapse"
                    title={isCollapsed ? "메뉴 펼치기" : "메뉴 접기"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-800 dark:text-zinc-200 transition-transform group-hover/collapse:translate-x-0.5" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-gray-800 dark:text-zinc-200 transition-transform group-hover/collapse:-translate-x-0.5" />
                    )}
                </button>
            </div>
        </>
    );
}
