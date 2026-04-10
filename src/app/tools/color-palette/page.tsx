"use client";

import { useState, useCallback, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, RefreshCw, Image as ImageIcon, Upload } from "lucide-react";
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

function extractColorsFromData(dataUrl: string): Promise<PaletteColor[]> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve([]);

            const MAX_SIZE = 150;
            let width = img.width;
            let height = img.height;
            if (width > MAX_SIZE || height > MAX_SIZE) {
                const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height).data;
            const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2], a = imageData[i + 3];
                if (a < 128) continue;
                const step = 24;
                const rG = Math.round(r / step) * step;
                const gG = Math.round(g / step) * step;
                const bG = Math.round(b / step) * step;
                const key = `${rG},${gG},${bG}`;
                const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
                bucket.r += r; bucket.g += g; bucket.b += b; bucket.count += 1;
                buckets.set(key, bucket);
            }

            const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
            const results: PaletteColor[] = [];
            const names = ["메인 색상 1", "메인 색상 2", "보조 색상 1", "보조 색상 2", "포인트 색상"];
            
            for (let i = 0; i < sorted.length; i++) {
                if (results.length >= 5) break;
                const bucket = sorted[i];
                const r = Math.round(bucket.r / bucket.count);
                const g = Math.round(bucket.g / bucket.count);
                const b = Math.round(bucket.b / bucket.count);
                const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
                results.push({ hex, name: names[results.length] });
            }
            resolve(results);
        };
        img.onerror = () => resolve([]);
        img.src = dataUrl;
    });
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
    const [inputMode, setInputMode] = useState<"generate" | "image">("generate");
    const [imagePalette, setImagePalette] = useState<PaletteColor[] | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generatedPalette = useCallback(() => generatePalette(baseColor, paletteType), [baseColor, paletteType])();
    const currentPalette = inputMode === "generate" ? generatedPalette : (imagePalette || []);

    const copyColor = (hex: string) => {
        navigator.clipboard.writeText(hex);
        toast(`${hex.toUpperCase()} 복사됨!`, "success");
    };

    const copyAll = () => {
        if (currentPalette.length === 0) return;
        const all = currentPalette.map((c) => c.hex).join(", ");
        navigator.clipboard.writeText(all);
        toast("팔레트 전체가 복사되었습니다!", "success");
    };

    const processImageFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast("이미지 파일만 업로드 가능합니다.", "error");
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
                setUploadedImage(dataUrl);
                const extracted = await extractColorsFromData(dataUrl);
                setImagePalette(extracted.length > 0 ? extracted : null);
                if (extracted.length > 0) {
                    toast("이미지 색상 추출 완료!", "success");
                }
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processImageFile(file);
        e.target.value = '';
    };

    const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) processImageFile(file);
    };

    const mainColorForShades = inputMode === "generate" ? baseColor : (currentPalette[0]?.hex || "#6366f1");
    const [h, s, l] = hexToHsl(mainColorForShades);

    return (
        <>
            <PageHeader title="색상 팔레트 생성기" description="기준 색상에서 조화로운 팔레트를 자동으로 생성하거나 이미지에서 색상을 추출합니다." />

            {/* Tabs */}
            <div className="flex justify-center mb-8 -mt-2">
                <div className="inline-flex glass-card p-1 rounded-2xl">
                    <button
                        onClick={() => setInputMode("generate")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            inputMode === "generate" 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/5"
                        }`}
                    >
                        <RefreshCw className="w-4 h-4" /> 조합 생성기
                    </button>
                    <button
                        onClick={() => setInputMode("image")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            inputMode === "image" 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/5"
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" /> 이미지에서 추출
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Controls */}
                {inputMode === "generate" ? (
                    <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4 shrink-0">
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
                ) : (
                    <div className="glass-card p-6 flex flex-col md:flex-row items-stretch gap-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex-1 flex flex-col gap-2 relative group min-h-[160px]">
                            {uploadedImage && (
                                <button
                                    onClick={() => { setUploadedImage(null); setImagePalette(null); }}
                                    className="absolute top-2 right-2 px-3 py-1.5 bg-rose-500 text-white shadow-lg rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
                                >
                                    지우기
                                </button>
                            )}
                            {!uploadedImage ? (
                                <div 
                                    className="flex-1 w-full border-2 border-dashed border-zinc-300/50 dark:border-zinc-700/50 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer flex flex-col items-center justify-center rounded-xl transition-all h-[160px]"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onDrop={handleImageDrop}
                                >
                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">이미지 파일 클릭 또는 드래그</p>
                                    <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WebP 지원</p>
                                </div>
                            ) : (
                                <div className="flex-1 w-full rounded-xl overflow-hidden bg-black/5 flex items-center justify-center relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={uploadedImage} alt="Uploaded" className="max-w-full max-h-[160px] object-contain rounded-xl" />
                                </div>
                            )}
                        </div>

                        {/* Extracted Colors Overview */}
                        <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-6 md:pt-0 md:pl-6">
                            {currentPalette.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 tracking-tight">주요 색상 추출 완료</h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">이미지에서 가장 많이 쓰인 대표 색상 {currentPalette.length}가지입니다.</p>
                                    </div>
                                    <button onClick={copyAll} className="w-fit flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-bold transition-all active:scale-95">
                                        <Copy className="w-4 h-4" /> 팔레트 전체 복사
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center gap-3 h-full px-4 text-zinc-500 dark:text-zinc-400">
                                    <ImageIcon className="w-10 h-10 opacity-50" />
                                    <p className="text-sm font-medium">이미지를 업로드하면 자동으로<br/>주요 색상을 찾아 팔레트를 생성합니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Palette Display */}
                {currentPalette.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {currentPalette.map((color, i) => (
                            <button
                                key={i}
                                onClick={() => copyColor(color.hex)}
                                className="group glass-card p-0 overflow-hidden hover:-translate-y-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
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
                )}

                {/* Tints & Shades */}
                <div className="glass-card p-6 flex flex-col gap-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">명도 변형</h3>
                    <div className="grid grid-cols-5 md:flex gap-2">
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
