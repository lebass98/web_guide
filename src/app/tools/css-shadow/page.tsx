"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

interface ShadowConfig {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
    opacity: number;
    inset: boolean;
}

const defaultShadow: ShadowConfig = {
    x: 8, y: 8, blur: 24, spread: 0, color: "#6366f1", opacity: 30, inset: false,
};

export default function CssShadowPage() {
    const { toast } = useToast();
    const [bg, setBg] = useState("#ffffff");
    const [shadows, setShadows] = useState<ShadowConfig[]>([{ ...defaultShadow }]);

    const updateShadow = (index: number, key: keyof ShadowConfig, value: string | number | boolean) => {
        setShadows((prev) => prev.map((s, i) => i === index ? { ...s, [key]: value } : s));
    };

    const addShadow = () => setShadows((prev) => [...prev, { ...defaultShadow }]);
    const removeShadow = (i: number) => setShadows((prev) => prev.filter((_, idx) => idx !== i));

    const toRgba = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    const getShadowString = useCallback(() => {
        return shadows
            .map((s) => `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${toRgba(s.color, s.opacity)}`)
            .join(",\n       ");
    }, [shadows]);

    const cssCode = `box-shadow: ${getShadowString()};`;

    const handleCopy = () => {
        navigator.clipboard.writeText(cssCode);
        toast("CSS 코드가 클립보드에 복사되었습니다!", "success");
    };

    return (
        <>
            <PageHeader title="CSS 박스 섀도우 생성기" description="슬라이더로 그림자를 조작하고 CSS 코드를 즉시 복사하세요." />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="flex flex-col gap-6">
                    <div className="glass-card p-2 overflow-hidden">
                        <div
                            className="w-full h-72 rounded-2xl flex items-center justify-center transition-colors duration-300"
                            style={{ backgroundColor: bg }}
                        >
                            <div
                                className="w-40 h-40 rounded-3xl bg-white dark:bg-zinc-100 transition-all duration-300"
                                style={{ boxShadow: getShadowString() }}
                            />
                        </div>
                    </div>
                    <div className="glass-card p-4 flex items-center gap-4">
                        <label className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">배경색</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                            <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">{bg}</span>
                        </div>
                    </div>

                    {/* CSS Code */}
                    <div className="glass-card p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">CSS 코드</span>
                            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/30">
                                <Copy className="w-4 h-4" /> 복사
                            </button>
                        </div>
                        <pre className="p-4 bg-zinc-950 text-indigo-300 rounded-xl text-sm font-mono leading-relaxed overflow-x-auto">
                            {cssCode}
                        </pre>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-4">
                    {shadows.map((shadow, i) => (
                        <div key={i} className="glass-card p-6 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900 dark:text-white">레이어 {i + 1}</span>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 cursor-pointer">
                                        <input type="checkbox" checked={shadow.inset} onChange={(e) => updateShadow(i, "inset", e.target.checked)} className="rounded" />
                                        Inset
                                    </label>
                                    {shadows.length > 1 && (
                                        <button onClick={() => removeShadow(i)} className="text-rose-400 hover:text-rose-300 text-sm font-bold transition-colors">삭제</button>
                                    )}
                                </div>
                            </div>
                            {([
                                { key: "x", label: "X 오프셋", min: -100, max: 100 },
                                { key: "y", label: "Y 오프셋", min: -100, max: 100 },
                                { key: "blur", label: "블러", min: 0, max: 100 },
                                { key: "spread", label: "스프레드", min: -50, max: 50 },
                                { key: "opacity", label: "투명도", min: 0, max: 100 },
                            ] as const).map(({ key, label, min, max }) => (
                                <div key={key} className="flex flex-col gap-2">
                                    <div className="flex justify-between">
                                        <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</label>
                                        <span className="text-sm font-mono text-indigo-500 dark:text-indigo-400 font-bold">{shadow[key]}px</span>
                                    </div>
                                    <input
                                        type="range" min={min} max={max}
                                        value={shadow[key] as number}
                                        onChange={(e) => updateShadow(i, key, Number(e.target.value))}
                                        className="w-full accent-indigo-500"
                                    />
                                </div>
                            ))}
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">색상</label>
                                <input type="color" value={shadow.color} onChange={(e) => updateShadow(i, "color", e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                                <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">{shadow.color}</span>
                            </div>
                        </div>
                    ))}
                    <button onClick={addShadow} className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo-500/30 dark:border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-bold text-sm hover:border-indigo-500/60 hover:bg-indigo-500/5 transition-all">
                        + 레이어 추가
                    </button>
                </div>
            </div>
        </>
    );
}
