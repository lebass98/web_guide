"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Minimize2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

function optimizeSvg(svg: string): { result: string; savings: number } {
    let result = svg.trim();
    const originalLen = result.length;

    // Remove XML declaration
    result = result.replace(/<\?xml[^>]*\?>/gi, "");
    // Remove comments
    result = result.replace(/<!--[\s\S]*?-->/g, "");
    // Remove doctype
    result = result.replace(/<!DOCTYPE[^>]*>/gi, "");
    // Remove metadata
    result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
    // Remove title (optional, can be accessibility concern)
    // result = result.replace(/<title>[\s\S]*?<\/title>/gi, "");
    // Remove empty groups
    result = result.replace(/<g\s*><\/g>/gi, "");
    result = result.replace(/<g\s*\/>/gi, "");
    // Collapse multiple spaces
    result = result.replace(/[ \t]{2,}/g, " ");
    // Remove whitespace between tags
    result = result.replace(/>\s+</g, "><");
    // Remove newlines
    result = result.replace(/\n+/g, " ");
    // Collapse spaces
    result = result.replace(/\s{2,}/g, " ");
    // Remove unnecessary precision in numbers (4 decimals -> 2)
    result = result.replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2));
    // Remove trailing zeros
    result = result.replace(/\.0+\b/g, "");
    result = result.trim();

    const savings = originalLen > 0 ? Math.round((1 - result.length / originalLen) * 100) : 0;
    return { result, savings };
}

export default function SvgOptimizerPage() {
    const { toast } = useToast();
    const [input, setInput] = useState("");
    const [optimized, setOptimized] = useState("");
    const [savings, setSavings] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleOptimize = (value: string) => {
        setInput(value);
        if (!value.trim()) { setOptimized(""); setSavings(0); setError(null); return; }
        if (!value.trim().startsWith("<svg") && !value.trim().includes("<svg")) {
            setError("유효한 SVG 코드가 아닙니다. <svg>로 시작하는 코드를 입력하세요.");
            setOptimized(""); setSavings(0); return;
        }
        setError(null);
        const { result, savings: s } = optimizeSvg(value);
        setOptimized(result);
        setSavings(s);
    };

    const handleCopy = () => {
        if (!optimized) return;
        navigator.clipboard.writeText(optimized);
        toast("최적화된 SVG가 복사되었습니다!", "success");
    };

    const inputKb = (input.length / 1024).toFixed(2);
    const outputKb = (optimized.length / 1024).toFixed(2);

    return (
        <>
            <PageHeader title="SVG 최적화기" description="SVG 코드에서 불필요한 요소를 제거하고 파일 크기를 줄이세요." />

            {/* Stats Bar */}
            {optimized && (
                <div className="glass-card p-4 mb-6 flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm">최적화 완료</span>
                    </div>
                    <div className="flex gap-6 text-sm">
                        <div><span className="text-zinc-400">원본:</span> <span className="font-mono font-bold text-gray-900 dark:text-white ml-1">{inputKb} KB</span></div>
                        <div><span className="text-zinc-400">결과:</span> <span className="font-mono font-bold text-emerald-500 ml-1">{outputKb} KB</span></div>
                        <div className="flex items-center gap-1">
                            <span className="text-zinc-400">절약:</span>
                            <span className="font-mono font-bold text-indigo-500 ml-1">{savings}%</span>
                            <Minimize2 className="w-4 h-4 text-indigo-400" />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 h-[560px]">
                {/* Input */}
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between h-[38px]">
                        <label className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                            원본 SVG
                        </label>
                        <button
                            onClick={() => handleOptimize("")}
                            className="text-xs font-bold text-zinc-400 hover:text-rose-500 transition-colors"
                        >
                            지우기
                        </button>
                    </div>
                    <textarea
                        className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white text-gray-900 placeholder:text-zinc-400"
                        placeholder={`<svg xmlns="http://www.w3.org/2000/svg" ...>\n  <!-- SVG 코드를 여기에 붙여넣으세요 -->\n</svg>`}
                        value={input}
                        onChange={(e) => handleOptimize(e.target.value)}
                        spellCheck={false}
                    />
                </div>

                {/* Output */}
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between h-[38px]">
                        <label className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                            최적화된 SVG
                        </label>
                        <button
                            onClick={handleCopy}
                            disabled={!optimized}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all active:scale-95"
                        >
                            <Copy className="w-4 h-4" /> 복사
                        </button>
                    </div>
                    {error ? (
                        <div className="flex-1 flex items-center justify-center glass-card">
                            <div className="flex flex-col items-center gap-3 p-8 text-center">
                                <AlertCircle className="w-10 h-10 text-rose-400" />
                                <p className="text-rose-400 font-semibold text-sm">{error}</p>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            readOnly
                            className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm text-emerald-600 dark:text-emerald-400 focus:outline-none"
                            placeholder="최적화된 SVG 코드가 여기에 표시됩니다..."
                            value={optimized}
                            spellCheck={false}
                        />
                    )}
                </div>
            </div>

            {/* SVG Preview */}
            {optimized && !error && (
                <div className="glass-card p-6 mt-6">
                    <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">미리보기</h3>
                    <div
                        className="flex items-center justify-center p-8 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl min-h-32"
                        dangerouslySetInnerHTML={{ __html: optimized }}
                    />
                </div>
            )}
        </>
    );
}
