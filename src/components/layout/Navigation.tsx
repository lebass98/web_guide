"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
    children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex w-full min-h-screen bg-transparent">
            {/* Sticky Header */}
            <header
                className={cn(
                    "fixed top-0 right-0 left-0 h-16 glass-header z-30 flex items-center justify-between px-6 transition-all duration-300",
                    isSidebarCollapsed ? "lg:left-[80px]" : "lg:left-[240px]"
                )}
            >
                {/* Header Title / Logo Link */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="lg:hidden w-8 h-8 flex items-center justify-center bg-gray-900/90 backdrop-blur-md rounded-lg shadow-lg">
                        <span className="text-white font-bold text-[10px]">W</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 tracking-tight">WebTools Premium</span>
                </Link>

                {/* Mobile Menu Toggle inside Header */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2.5 glass-card !rounded-xl text-gray-500 hover:text-gray-900 active:scale-95 transition-all"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onClose={() => setIsSidebarOpen(false)}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div
                className={cn(
                    "flex-1 px-5 pt-28 pb-10 min-w-0 transition-all duration-300",
                    isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[240px]"
                )}
            >
                <main className="w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
