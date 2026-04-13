"use client";

import { useState, useCallback, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, RefreshCw, Image as ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

interface PaletteColor {
    hex: string;
    name: string;
    enName: string;
}

const NAME_TRANSLATIONS: Record<string, string> = {
    "기준색": "Base",
    "유사색 1": "Analogous 1",
    "유사색 2": "Analogous 2",
    "유사색 3": "Analogous 3",
    "유사색 4": "Analogous 4",
    "밝은 색": "Light",
    "어두운 색": "Dark",
    "보색 (밝음)": "Comp (Light)",
    "보색": "Complementary",
    "삼각 2": "Triadic 2",
    "삼각 3": "Triadic 3",
    "추가색 1": "Add 1",
    "추가색 2": "Add 2",
    "가장 밝음": "Lightest",
    "밝음": "Light",
    "어두움": "Dark",
    "가장 어두움": "Darkest",
    "메인 색상 1": "Main 1",
    "메인 색상 2": "Main 2",
    "보조 색상 1": "Sec 1",
    "보조 색상 2": "Sec 2",
    "포인트 색상": "Accent",
};

const CSS_COLOR_NAMES: Record<string, string> = {
    aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4", azure: "#f0ffff",
    beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000", blanchedalmond: "#ffebcd", blue: "#0000ff",
    blueviolet: "#8a2be2", brown: "#a52a2a", burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00",
    chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c",
    cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b", darkgray: "#a9a9a9",
    darkgreen: "#006400", darkgrey: "#a9a9a9", darkkhaki: "#bdb76b", darkmagenta: "#8b008b", darkolivegreen: "#556b2f",
    darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a", darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b", darkslategray: "#2f4f4f", darkslategrey: "#2f4f4f", darkturquoise: "#00ced1", darkviolet: "#9400d3",
    deeppink: "#ff1493", deepskyblue: "#00bfff", dimgray: "#696969", dimgrey: "#696969", dodgerblue: "#1e90ff",
    firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff", gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", green: "#008000",
    greenyellow: "#adff2f", grey: "#808080", honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c",
    indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2", lightgray: "#d3d3d3", lightgreen: "#90ee90", lightgrey: "#d3d3d3", lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87ceeb", lightslategray: "#778899", lightslategrey: "#778899",
    lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#00ff00", limegreen: "#32cd32", linen: "#faf0e6",
    magenta: "#ff00ff", maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3",
    mediumpurple: "#9370db", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1", moccasin: "#ffe4b5",
    navajowhite: "#ffdead", navy: "#000080", oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23",
    orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98",
    paleturquoise: "#afeeee", palevioletred: "#db7093", papayawhip: "#ffefd5", peachpuff: "#ffdab9", peru: "#cd853f",
    pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080", rebeccapurple: "#663399",
    red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1", saddlebrown: "#8b4513", salmon: "#fa8072",
    sandybrown: "#f4a460", seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0",
    skyblue: "#87ceeb", slateblue: "#6a5acd", slategray: "#708090", slategrey: "#708090", snow: "#fffafa",
    springgreen: "#00ff7f", steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8",
    tomato: "#ff6347", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#ffffff",
    whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32"
};

function getClosestColorName(hex: string): string {
    const r1 = parseInt(hex.slice(1, 3), 16);
    const g1 = parseInt(hex.slice(3, 5), 16);
    const b1 = parseInt(hex.slice(5, 7), 16);

    let minDistance = Infinity;
    let closestName = "Unknown";

    for (const [name, colorHex] of Object.entries(CSS_COLOR_NAMES)) {
        const r2 = parseInt(colorHex.slice(1, 3), 16);
        const g2 = parseInt(colorHex.slice(3, 5), 16);
        const b2 = parseInt(colorHex.slice(5, 7), 16);

        const distance = Math.sqrt(
            Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestName = name.charAt(0).toUpperCase() + name.slice(1);
        }
    }
    return closestName;
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
    const createColor = (hex: string, name: string): PaletteColor => ({
        hex,
        name,
        enName: NAME_TRANSLATIONS[name] || getClosestColorName(hex)
    });

    switch (type) {
        case "analogous":
            return [
                createColor(hslToHex((h - 30 + 360) % 360, s, l), "유사색 1"),
                createColor(hslToHex((h - 15 + 360) % 360, s, l), "유사색 2"),
                createColor(baseHex, "기준색"),
                createColor(hslToHex((h + 15) % 360, s, l), "유사색 3"),
                createColor(hslToHex((h + 30) % 360, s, l), "유사색 4"),
            ];
        case "complementary":
            return [
                createColor(hslToHex(h, s, Math.min(l + 20, 95)), "밝은 색"),
                createColor(baseHex, "기준색"),
                createColor(hslToHex(h, s, Math.max(l - 20, 5)), "어두운 색"),
                createColor(hslToHex((h + 180) % 360, s, Math.min(l + 10, 90)), "보색 (밝음)"),
                createColor(hslToHex((h + 180) % 360, s, l), "보색"),
            ];
        case "triadic":
            return [
                createColor(baseHex, "기준색"),
                createColor(hslToHex((h + 120) % 360, s, l), "삼각 2"),
                createColor(hslToHex((h + 240) % 360, s, l), "삼각 3"),
                createColor(hslToHex((h + 60) % 360, s, l), "추가색 1"),
                createColor(hslToHex((h + 180) % 360, s, l), "추가색 2"),
            ];
        case "monochromatic":
            return [
                createColor(hslToHex(h, s, 90), "가장 밝음"),
                createColor(hslToHex(h, s, 70), "밝음"),
                createColor(baseHex, "기준색"),
                createColor(hslToHex(h, s, Math.max(l - 20, 15)), "어두움"),
                createColor(hslToHex(h, s, Math.max(l - 40, 5)), "가장 어두움"),
            ];
        default:
            return [createColor(baseHex, "기준색")];
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
                const name = names[results.length];
                results.push({ 
                    hex, 
                    name,
                    enName: NAME_TRANSLATIONS[name] || getClosestColorName(hex)
                });
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
                        <RefreshCw className="w-4 h-4" /> Generator
                    </button>
                    <button
                        onClick={() => setInputMode("image")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            inputMode === "image" 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/5"
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" /> Image Extract
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
                                <p className="font-mono font-bold text-xl text-gray-900 dark:text-white leading-tight">{baseColor.toUpperCase()}</p>
                                <div className="flex flex-col text-xs font-semibold mt-0.5">
                                    <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{getClosestColorName(baseColor)}</span>
                                    <span className="text-zinc-400">HSL({h}, {s}%, {l}%)</span>
                                </div>
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
                                    <p className="font-mono font-bold text-sm text-gray-900 dark:text-white mb-1">{color.hex.toUpperCase()}</p>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight leading-none">{color.enName}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{color.name}</p>
                                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                            <p className="text-[10px] font-medium text-zinc-400">{getClosestColorName(color.hex)}</p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-zinc-400 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-tighter">Click to Copy</p>
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
