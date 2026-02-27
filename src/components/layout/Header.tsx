"use client";

import Link from "next/link";
import { Menu, Github } from "lucide-react";

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="h-16 w-full glass border-b border-zinc-200/50 flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500 cursor-pointer hover:opacity-80 transition-opacity">
                        WebTools
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <a
                    href="#"
                    className="text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <Github className="w-5 h-5" />
                    <span className="hidden sm:inline">GitHub</span>
                </a>
                <button
                    className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
}
