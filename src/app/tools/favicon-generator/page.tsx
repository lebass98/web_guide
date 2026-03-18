"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Download, RefreshCw, Type, Smile } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

type FaviconMode = "text" | "emoji";

const BG_PRESETS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#06b6d4",
    "#1c1c1c", "#ffffff",
];

const SIZES = [16, 32, 48, 64, 128, 256];

export default function FaviconGeneratorPage() {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<FaviconMode>("text");
    const [text, setText] = useState("W");
    const [emoji, setEmoji] = useState("🚀");
    const [bgColor, setBgColor] = useState("#6366f1");
    const [textColor, setTextColor] = useState("#ffffff");
    const [borderRadius, setBorderRadius] = useState(30);
    const [fontSize, setFontSize] = useState(55);
    const [bold, setBold] = useState(true);
    const [selectedSize, setSelectedSize] = useState(64);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = selectedSize;
        canvas.height = selectedSize;
        ctx.clearRect(0, 0, selectedSize, selectedSize);

        // Background with rounded corners
        const radius = (borderRadius / 100) * (selectedSize / 2);
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(selectedSize - radius, 0);
        ctx.quadraticCurveTo(selectedSize, 0, selectedSize, radius);
        ctx.lineTo(selectedSize, selectedSize - radius);
        ctx.quadraticCurveTo(selectedSize, selectedSize, selectedSize - radius, selectedSize);
        ctx.lineTo(radius, selectedSize);
        ctx.quadraticCurveTo(0, selectedSize, 0, selectedSize - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fillStyle = bgColor;
        ctx.fill();

        // Text / Emoji
        const content = mode === "emoji" ? emoji : text;
        const size = Math.round(selectedSize * (fontSize / 100));
        ctx.font = `${bold && mode === "text" ? "900" : "400"} ${size}px ${mode === "emoji" ? "Segoe UI Emoji, Apple Color Emoji, sans-serif" : "system-ui, -apple-system, sans-serif"}`;
        ctx.fillStyle = mode === "emoji" ? "transparent" : textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (mode === "emoji") {
            ctx.font = `${size}px Segoe UI Emoji, Apple Color Emoji, sans-serif`;
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = textColor;
        }
        ctx.fillText(content.slice(0, 2), selectedSize / 2, selectedSize / 2 + (mode === "emoji" ? 1 : 2));
    }, [bgColor, borderRadius, bold, emoji, fontSize, mode, selectedSize, text, textColor]);

    useEffect(() => { draw(); }, [draw]);

    const downloadPng = (size: number) => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const radius = (borderRadius / 100) * (size / 2);
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fillStyle = bgColor;
        ctx.fill();

        const content = mode === "emoji" ? emoji : text;
        const fSize = Math.round(size * (fontSize / 100));
        ctx.font = `${bold && mode === "text" ? "900" : "400"} ${fSize}px ${mode === "emoji" ? "Segoe UI Emoji, Apple Color Emoji, sans-serif" : "system-ui, -apple-system, sans-serif"}`;
        ctx.fillStyle = mode === "emoji" ? "black" : textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(content.slice(0, 2), size / 2, size / 2 + 2);

        const link = document.createElement("a");
        link.download = `favicon-${size}x${size}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast(`favicon-${size}x${size}.png 다운로드 완료!`, "success");
    };

    const downloadAll = () => {
        SIZES.forEach((s, i) => setTimeout(() => downloadPng(s), i * 150));
        toast("모든 사이즈 다운로드 중...", "info");
    };

    return (
        <>
            <PageHeader title="Favicon 생성기" description="텍스트 또는 이모지로 favicon을 즉시 생성하고 PNG로 다운로드하세요." />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="flex flex-col gap-6">
                    <div className="glass-card p-8 flex flex-col items-center gap-6">
                        <div className="flex gap-6 items-end">
                            {[16, 32, 64, 128].map((s) => (
                                <div key={s} className="flex flex-col items-center gap-2">
                                    <canvas ref={s === selectedSize ? canvasRef : undefined}
                                        width={s} height={s}
                                        className="rounded shadow-lg"
                                        style={{ imageRendering: s <= 32 ? "pixelated" : "auto", width: s, height: s }}
                                    />
                                    <span className="text-[10px] text-zinc-400 font-mono">{s}px</span>
                                </div>
                            ))}
                        </div>
                        <canvas ref={selectedSize === 64 ? undefined : canvasRef} width={selectedSize} height={selectedSize} className="hidden" />
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 rounded-xl">
                            <div className="w-4 h-4 rounded-[3px] overflow-hidden">
                                <canvas ref={canvasRef} width={16} height={16} style={{ width: 16, height: 16 }} />
                            </div>
                            <span className="text-white dark:text-zinc-900 text-sm font-semibold">Tab Preview</span>
                        </div>
                    </div>

                    {/* Download */}
                    <div className="glass-card p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">다운로드</span>
                            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/30">
                                <Download className="w-4 h-4" /> 모두 다운로드
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {SIZES.map((s) => (
                                <button key={s} onClick={() => downloadPng(s)} className="flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-transparent hover:border-indigo-500/30 rounded-xl text-sm font-mono font-bold transition-all">
                                    <Download className="w-3.5 h-3.5" /> {s}×{s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-5">
                    {/* Mode */}
                    <div className="flex gap-3">
                        <button onClick={() => setMode("text")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${mode === "text" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                            <Type className="w-4 h-4" /> 텍스트
                        </button>
                        <button onClick={() => setMode("emoji")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${mode === "emoji" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                            <Smile className="w-4 h-4" /> 이모지
                        </button>
                    </div>

                    <div className="glass-card p-6 flex flex-col gap-5">
                        {mode === "text" ? (
                            <>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">텍스트 (최대 2자)</label>
                                    <input maxLength={2} value={text} onChange={(e) => setText(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold text-2xl text-center" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">글자 색상</label>
                                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                                    <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 cursor-pointer ml-auto">
                                        <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} />
                                        굵게
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">이모지</label>
                                <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 text-3xl text-center" />
                                <div className="grid grid-cols-8 gap-2 mt-2">
                                    {["🚀", "⚡", "🔥", "💎", "🌈", "🎯", "🛠️", "🔑"].map((e) => (
                                        <button key={e} onClick={() => setEmoji(e)} className="text-2xl py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{e}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                                <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">폰트 크기</label>
                                <span className="text-sm font-mono text-indigo-500 font-bold">{fontSize}%</span>
                            </div>
                            <input type="range" min={20} max={90} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-indigo-500" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                                <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">모서리 둥글기</label>
                                <span className="text-sm font-mono text-indigo-500 font-bold">{borderRadius}%</span>
                            </div>
                            <input type="range" min={0} max={50} value={borderRadius} onChange={(e) => setBorderRadius(+e.target.value)} className="w-full accent-indigo-500" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">배경색</label>
                            <div className="flex flex-wrap gap-2">
                                {BG_PRESETS.map((c) => (
                                    <button key={c} onClick={() => setBgColor(c)} className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${bgColor === c ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900 scale-110" : ""}`} style={{ backgroundColor: c }} />
                                ))}
                                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" title="커스텀 색상" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
