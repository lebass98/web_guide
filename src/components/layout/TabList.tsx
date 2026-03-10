"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useTabs } from "@/components/providers/TabProvider";
import { cn } from "@/lib/utils";
import { TOOL_ITEMS } from "@/lib/constants";

export function TabList() {
    const { tabs, activeTabPath, removeTab } = useTabs();

    if (tabs.length === 0) return null;

    return (
        <div className="flex items-center gap-2 px-6 h-12 overflow-x-auto no-scrollbar bg-transparent border-t border-gray-100/50 dark:border-zinc-800/50">
            {tabs.map((tab) => {
                const isActive = activeTabPath === tab.path;
                const toolInfo = TOOL_ITEMS.find((t) => t.id === tab.id);
                const Icon = toolInfo?.icon;

                return (
                    <div
                        key={tab.path}
                        className={cn(
                            "group relative flex items-center h-8 px-4 rounded-xl transition-all duration-300 cursor-pointer border",
                            isActive
                                ? "bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-100/50 dark:border-indigo-500/20 shadow-sm backdrop-blur-md"
                                : "bg-white/40 dark:bg-zinc-900/40 border-transparent hover:bg-white/60 dark:hover:bg-zinc-800/60 backdrop-blur-sm"
                        )}
                    >
                        <Link
                            href={tab.path}
                            className="flex items-center gap-2 flex-1 mr-2"
                        >
                            {Icon && <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500")} />}
                            <span className={cn(
                                "text-[12px] font-bold whitespace-nowrap tracking-tight transition-colors",
                                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
                            )}>
                                {tab.label}
                            </span>
                        </Link>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeTab(tab.path);
                            }}
                            className={cn(
                                "p-0.5 rounded-lg transition-all",
                                isActive
                                    ? "text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-500/20"
                                    : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-gray-200/50 dark:hover:bg-zinc-700/50"
                            )}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Subtle Active Glow */}
                        {isActive && (
                            <div className="absolute -inset-[1px] rounded-xl bg-indigo-500/10 dark:bg-indigo-500/5 -z-10 blur-sm" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
