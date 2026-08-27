"use client";

import React from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface BoxItem {
    id: string;
    text: string;
    href?: string;
    badge?: string;
}

export interface ImpactBoxCardProps {
    titleLine1?: string;
    titleLine2?: string;
    subtitle?: string;
    items?: BoxItem[];
    glowColor?: string; // e.g. "rgba(255, 245, 167, 1)"
    className?: string;
    onItemClick?: (item: BoxItem, index: number) => void;
}

export const DEFAULT_BOX_ITEMS: BoxItem[] = [
    { id: "1", text: "토스 앱에 오픈하는 내 서비스" },
    { id: "2", text: "사장님의 경영을 돕는 결제 단말기" },
    { id: "3", text: "온라인 사업에 필요한 결제 솔루션" },
    { id: "4", text: "셀러와 사용자를 잇는 토스 쇼핑" },
];

export function ImpactBoxCard({
    titleLine1 = "impact for",
    titleLine2 = "growth",
    subtitle = "성장의 토대",
    items = DEFAULT_BOX_ITEMS,
    glowColor = "rgba(255, 245, 167, 1)",
    className,
    onItemClick,
}: ImpactBoxCardProps) {
    return (
        <div
            className={cn(
                "relative w-full rounded-[36px] sm:rounded-[45px] p-6 sm:p-10 lg:pt-[60px] lg:pr-16 lg:pb-[60px] lg:pl-16 overflow-hidden",
                "flex flex-col lg:flex-row gap-8 lg:gap-[80px] xl:gap-[100px] items-stretch justify-between",
                "bg-[#fcfcfa] dark:bg-zinc-900 border border-amber-100/80 dark:border-zinc-800 shadow-xl shadow-amber-500/5 dark:shadow-black/40",
                "transition-all duration-500",
                className
            )}
            style={{
                backgroundImage: `radial-gradient(closest-side, ${glowColor} 0%, rgba(255, 245, 167, 0) 72%)`,
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Dark mode overlay glow */}
            <div 
                className="absolute inset-0 opacity-0 dark:opacity-20 pointer-events-none transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at 30% 40%, ${glowColor} 0%, transparent 60%)`,
                }}
            />

            {/* Left Column: Heading & Subtitle */}
            <div className="flex flex-col justify-between items-start shrink-0 w-full lg:w-[295px] relative z-10 space-y-6 lg:space-y-0">
                <div className="flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-[#333d4b] dark:text-zinc-100 font-bold text-4xl sm:text-5xl lg:text-[60px] lg:leading-[66px] tracking-tight"
                    >
                        {titleLine1}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        className="text-[#333d4b] dark:text-zinc-100 font-bold text-4xl sm:text-5xl lg:text-[60px] lg:leading-[66px] tracking-tight"
                    >
                        {titleLine2}
                    </motion.div>
                </div>

                {/* Subtitle with subtle arrow */}
                {subtitle && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex items-center gap-2 group/sub cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
                    >
                        <span className="text-[#333d4b] dark:text-zinc-300 font-bold text-xl sm:text-2xl lg:text-3xl tracking-tight">
                            {subtitle}
                        </span>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#333d4b] dark:text-zinc-300 group-hover/sub:translate-x-1 transition-transform">
                            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Right Column: Pill List */}
            <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-[500px] shrink-0 justify-center relative z-10">
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 * idx }}
                        onClick={() => onItemClick?.(item, idx)}
                        className={cn(
                            "bg-white dark:bg-zinc-800/90 rounded-full py-4 sm:py-5 pl-6 sm:pl-7 pr-4 sm:pr-5",
                            "flex items-center justify-between gap-4 self-stretch",
                            "border border-white/80 dark:border-zinc-700/60 shadow-sm hover:shadow-lg hover:shadow-amber-900/5 dark:hover:shadow-black/30",
                            "hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        )}
                    >
                        <span className="text-[#333d4b] dark:text-zinc-100 font-semibold text-base sm:text-lg lg:text-xl tracking-tight group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                            {item.text}
                        </span>

                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-700/70 flex items-center justify-center text-zinc-500 dark:text-zinc-300 group-hover:bg-amber-400 group-hover:text-zinc-900 dark:group-hover:bg-amber-400 dark:group-hover:text-zinc-900 transition-all duration-300 shadow-xs">
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
