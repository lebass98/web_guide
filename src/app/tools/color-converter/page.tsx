"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy } from "lucide-react";

export default function ColorConverterPage() {
    const [hex, setHex] = useState("#f87171");
    const [rgb, setRgb] = useState("rgb(248, 113, 113)");
    const [hsl, setHsl] = useState("hsl(0, 91%, 71%)");
    const [error, setError] = useState<string | null>(null);

    // Extremely basic conversions for MVP
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : null;
    };

    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let h = 0,
            s = 0;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    const updateFromHex = (value: string) => {
        setHex(value);
        const rgbVal = hexToRgb(value);
        if (rgbVal) {
            setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
            const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
            setHsl(`hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`);
            setError(null);
        } else {
            setError("잘못된 HEX 코드");
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            <PageHeader
                title="색상 코드 변환기"
                description="HEX, RGB, HSL 색상 형식을 즉시 변환하세요."
            />

            <div className="flex flex-col lg:flex-row gap-8">
                <div
                    className="lg:w-1/3 h-64 lg:h-auto rounded-3xl shadow-2xl transition-all duration-300 border border-white/40 dark:border-white/10 ring-8 ring-white/20 dark:ring-white/5"
                    style={{ backgroundColor: error ? "transparent" : hex }}
                />

                <div className="flex-1 flex flex-col gap-6">
                    <div className="glass-card p-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">HEX</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={hex}
                                    onChange={(e) => updateFromHex(e.target.value)}
                                    className="flex-1 bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl px-4 py-3 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-fuchsia-500 transition-all shadow-inner"
                                />
                                <button
                                    onClick={() => handleCopy(hex)}
                                    className="px-5 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-white rounded-xl transition-all shadow-lg flex items-center gap-2 font-bold text-sm active:scale-95"
                                >
                                    <Copy className="w-4 h-4" /> 복사
                                </button>
                            </div>
                            {error && (
                                <span className="text-xs text-destructive-foreground">{error}</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">RGB</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={rgb}
                                    readOnly
                                    className="flex-1 bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl px-4 py-3 font-mono text-zinc-500 dark:text-zinc-400 shadow-inner"
                                />
                                <button
                                    onClick={() => handleCopy(rgb)}
                                    className="px-5 py-3 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all shadow-sm flex items-center gap-2 font-bold text-sm active:scale-95"
                                >
                                    <Copy className="w-4 h-4" /> 복사
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">HSL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={hsl}
                                    readOnly
                                    className="flex-1 bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl px-4 py-3 font-mono text-zinc-500 dark:text-zinc-400 shadow-inner"
                                />
                                <button
                                    onClick={() => handleCopy(hsl)}
                                    className="px-5 py-3 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all shadow-sm flex items-center gap-2 font-bold text-sm active:scale-95"
                                >
                                    <Copy className="w-4 h-4" /> 복사
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
