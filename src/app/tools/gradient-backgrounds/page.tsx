"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Curated list of beautiful gradients inspired by cssgradient.io & uigradients
const gradients = [
    { name: "Atlas", css: "linear-gradient(to right, #FEAC5E, #C779D0, #4BC0C8)" },
    { name: "Endless River", css: "linear-gradient(to right, #43cea2, #185a9d)" },
    { name: "Sherbert", css: "linear-gradient(to right, #f79d00, #64f38c)" },
    { name: "Blood Red", css: "linear-gradient(to right, #f85032, #e73827)" },
    { name: "Sun on the Horizon", css: "linear-gradient(to right, #fceabb, #f8b500)" },
    { name: "Blood Funnel", css: "linear-gradient(to right, #f00000, #dc281e)" },
    { name: "Relay", css: "linear-gradient(to right, #3A1C71, #D76D77, #FFAF7B)" },
    { name: "Alive", css: "linear-gradient(to right, #CB356B, #BD3F32)" },
    { name: "Scooter", css: "linear-gradient(to right, #36D1DC, #5B86E5)" },
    { name: "Terminal", css: "linear-gradient(to right, #000000, #0f9b0f)" },
    { name: "Kashmir", css: "linear-gradient(to right, #614385, #516395)" },
    { name: "Steel Gray", css: "linear-gradient(to right, #1F1C2C, #928DAB)" },
    { name: "Mirage", css: "linear-gradient(to right, #16222A, #3A6073)" },
    { name: "Juicy Orange", css: "linear-gradient(to right, #FF8008, #FFC837)" },
    { name: "Cherry", css: "linear-gradient(to right, #EB3349, #F45C43)" },
    { name: "Pinky", css: "linear-gradient(to right, #DD5E89, #F7BB97)" },
    { name: "Lush", css: "linear-gradient(to right, #56ab2f, #a8e063)" },
    { name: "Frost", css: "linear-gradient(to right, #000428, #004e92)" },
    { name: "Mauve", css: "linear-gradient(to right, #42275a, #734b6d)" },
    { name: "Royal", css: "linear-gradient(to right, #141E30, #243B55)" },
    { name: "Deep Space", css: "linear-gradient(to right, #000000, #434343)" },
    { name: "Grapefruit", css: "linear-gradient(to right, #e96443, #904e95)" },
    { name: "Candy", css: "linear-gradient(to right, #D3959B, #BFE6BA)" },
    { name: "Ocean", css: "linear-gradient(to right, #2E3192, #1BFFFF)" },
];

export default function GradientBackgroundsPage() {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const copyToClipboard = async (css: string, index: number) => {
        try {
            await navigator.clipboard.writeText(`background: ${css};`);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <>
            <PageHeader
                title="CSS 그라데이션 배경"
                description="영감을 주는 아름다운 CSS 그라데이션 컬렉션입니다. 클릭 한 번으로 CSS 코드를 복사하세요."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gradients.map((gradient, index) => (
                    <div
                        key={index}
                        className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => copyToClipboard(gradient.css, index)}
                        title="Click to copy CSS"
                    >
                        {/* Gradient Preview Area */}
                        <div
                            className="w-full h-48 transition-transform duration-500 group-hover:scale-105"
                            style={{ background: gradient.css }}
                        />

                        {/* Copy Overlay */}
                        <div className="absolute inset-0 top-0 h-48 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-zinc-900 font-semibold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                {copiedIndex === index ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-500" /> 복사 완료!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" /> CSS 복사
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Title / Description Area */}
                        <div className="p-4 bg-white z-10 flex justify-between items-center border-t border-zinc-100">
                            <span className="font-semibold text-zinc-800 text-sm truncate pr-2">
                                {gradient.name}
                            </span>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-800 transition-colors flex-shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(gradient.css, index);
                                }}
                            >
                                {copiedIndex === index ? (
                                    <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
