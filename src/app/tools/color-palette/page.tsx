"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

interface PaletteColor {
    hex: string;
    name: string;
}

function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}

function generatePalette(baseHex: string, type: string): PaletteColor[] {
    const [h, s, l] = hexToHsl(baseHex);
    switch (type) {
        case "analogous":
            return [
                { hex: hslToHex((h - 30 + 360) % 360, s, l), name: "유사색 1" },
                { hex: hslToHex((h - 15 + 360) % 360, s, l), name: "유사색 2" },
                { hex: baseHex, name: "기준색" },
                { hex: hslToHex((h + 15) % 360, s, l), name: "유사색 3" },
                { hex: hslToHex((h + 30) % 360, s, l), name: "유사색 4" },
            ];
        case "complementary":
            return [
                { hex: hslToHex(h, s, Math.min(l + 20, 95)), name: "밝은 색" },
                { hex: baseHex, name: "기준색" },
                { hex: hslToHex(h, s, Math.max(l - 20, 5)), name: "어두운 색" },
                { hex: hslToHex((h + 180) % 360, s, Math.min(l + 10, 90)), name: "보색 (밝음)" },
                { hex: hslToHex((h + 180) % 360, s, l), name: "보색" },
            ];
        case "triadic":
            return [
                { hex: baseHex, name: "기준색" },
                { hex: hslToHex((h + 120) % 360, s, l), name: "삼각 2" },
                { hex: hslToHex((h + 240) % 360, s, l), name: "삼각 3" },
                { hex: hslToHex((h + 60) % 360, s, l), name: "추가색 1" },
                { hex: hslToHex((h + 180) % 360, s, l), name: "추가색 2" },
            ];
        case "monochromatic":
            return [
                { hex: hslToHex(h, s, 90), name: "가장 밝음" },
                { hex: hslToHex(h, s, 70), name: "밝음" },
                { hex: baseHex, name: "기준색" },
                { hex: hslToHex(h, s, Math.max(l - 20, 15)), name: "어두움" },
                { hex: hslToHex(h, s, Math.max(l - 40, 5)), name: "가장 어두움" },
            ];
        default:
            return [{ hex: baseHex, name: "기준색" }];
    }
}

const PALETTE_TYPES = [
    { key: "analogous", label: "유사색" },
    { key: "complementary", label: "보색" },
    { key: "triadic", label: "삼색" },
    { key: "monochromatic", label: "단색" },
];

export default function ColorPalettePage() {
    const { toast } = useToast();
    const [baseColor, setBaseColor] = useState("#6366f1");
    const [paletteType, setPaletteType] = useState("analogous");

    const palette = useCallback(() => generatePalette(baseColor, paletteType), [baseColor, paletteType])();

    const copyColor = (hex: string) => {
        navigator.clipboard.writeText(hex);
        toast(`${hex} 복사됨!`, "success");
    };

    const copyAll = () => {
        const all = palette.map((c) => c.hex).join(", ");
        navigator.clipboard.writeText(all);
        toast("팔레트 전체가 복사되었습니다!", "success");
    };

    const [h, s, l] = hexToHsl(baseColor);

    return (
        <>
            <PageHeader title="색상 팔레트 생성기" description="기준 색상에서 조화로운 팔레트를 자동으로 생성합니다. 색상을 클릭하면 복사됩니다." />

            <div className="flex flex-col gap-8">
                {/* Controls */}
                <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-0 bg-transparent shadow-lg" />
                        <div>
                            <p className="font-mono font-bold text-xl text-gray-900 dark:text-white">{baseColor.toUpperCase()}</p>
                            <p className="text-sm text-zinc-400">HSL({h}, {s}%, {l}%)</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 flex-1">
                        {PALETTE_TYPES.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setPaletteType(key)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    paletteType === key
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <button onClick={copyAll} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-bold transition-all active:scale-95 shrink-0">
                        <Copy className="w-4 h-4" /> 전체 복사
                    </button>
                </div>

                {/* Palette Display */}
                <div className="grid grid-cols-5 gap-4">
                    {palette.map((color, i) => (
                        <button
                            key={i}
                            onClick={() => copyColor(color.hex)}
                            className="group glass-card p-0 overflow-hidden hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="h-40 w-full transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: color.hex }} />
                            <div className="p-4 text-left">
                                <p className="font-mono font-bold text-sm text-gray-900 dark:text-white mb-0.5">{color.hex.toUpperCase()}</p>
                                <p className="text-xs text-zinc-400">{color.name}</p>
                                <p className="text-[10px] text-zinc-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold">클릭하여 복사</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Tints & Shades */}
                <div className="glass-card p-6 flex flex-col gap-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">명도 변형</h3>
                    <div className="flex gap-2">
                        {[95, 85, 75, 65, 55, 45, 35, 25, 15, 5].map((lightness) => {
                            const hex = hslToHex(h, s, lightness);
                            return (
                                <button
                                    key={lightness}
                                    onClick={() => copyColor(hex)}
                                    title={hex}
                                    className="flex-1 h-16 rounded-xl transition-all hover:scale-110 hover:-translate-y-1 active:scale-95 shadow-sm"
                                    style={{ backgroundColor: hex }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
