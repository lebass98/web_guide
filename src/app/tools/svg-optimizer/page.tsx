"use client";

import { useState, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Minimize2, AlertCircle, CheckCircle2, Upload, FileCode2, Sun, Moon } from "lucide-react";
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
    // Remove <g />
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [inputMode, setInputMode] = useState<"upload" | "code">("upload");
    const [previewBg, setPreviewBg] = useState<"light" | "dark" | "default">("default");
    const [zoom, setZoom] = useState(1);

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
        setZoom(1);
    };

    const handleCopy = () => {
        if (!optimized) return;
        navigator.clipboard.writeText(optimized);
        toast("최적화된 SVG가 복사되었습니다!", "success");
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (text) {
                handleOptimize(text);
                toast("SVG 파일이 업로드되었습니다.", "success");
            }
        };
        reader.onerror = () => {
            setError("파일을 읽는 중 오류가 발생했습니다.");
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.svg')) {
            setError("유효한 SVG 파일을 업로드해주세요.");
            setOptimized(""); 
            setSavings(0);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (text) {
                handleOptimize(text);
                toast("SVG 파일이 업로드되었습니다.", "success");
            }
        };
        reader.onerror = () => {
            setError("파일을 읽는 중 오류가 발생했습니다.");
        };
        reader.readAsText(file);
    };

    const inputKb = (input.length / 1024).toFixed(2);
    const outputKb = (optimized.length / 1024).toFixed(2);

    return (
        <>
            <PageHeader title="SVG 최적화기" description="SVG 코드에서 불필요한 요소를 제거하고 파일 크기를 줄이세요." />

            {/* Tabs */}
            <div className="flex justify-center mb-8 -mt-2">
                <div className="inline-flex glass-card p-1 rounded-2xl">
                    <button
                        onClick={() => setInputMode("upload")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            inputMode === "upload" 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/5"
                        }`}
                    >
                        <Upload className="w-4 h-4" /> 파일 업로드 하기
                    </button>
                    <button
                        onClick={() => setInputMode("code")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            inputMode === "code" 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/5"
                        }`}
                    >
                        <FileCode2 className="w-4 h-4" /> 코드 직접 삽입
                    </button>
                </div>
            </div>

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

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Input */}
                {inputMode === "code" ? (
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
                            className="h-[450px] w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white text-gray-900 placeholder:text-zinc-400"
                            placeholder={`<svg xmlns="http://www.w3.org/2000/svg" ...>\n  <!-- SVG 코드를 여기에 붙여넣으세요 -->\n</svg>`}
                            value={input}
                            onChange={(e) => handleOptimize(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between h-[38px]">
                            <label className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                미리보기
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept=".svg"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={handleFileUploadClick}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-indigo-500/10"
                                >
                                    <Upload className="w-3.5 h-3.5" /> 파일 선택
                                </button>
                                {input && (
                                    <button
                                        onClick={() => handleOptimize("")}
                                        className="text-xs font-bold text-zinc-400 hover:text-rose-500 transition-colors ml-1"
                                    >
                                        지우기
                                    </button>
                                )}
                            </div>
                        </div>

                        {optimized && !error ? (
                            <div className="w-full glass-card flex flex-col overflow-hidden h-auto">
                                {/* Controls Area at top */}
                                <div className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-900/50 gap-4 border-b border-zinc-200 dark:border-zinc-800">
                                    {/* Zoom Slider */}
                                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg">
                                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 min-w-[32px] text-right">{zoom.toFixed(1)}x</span>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="5"
                                            step="0.1"
                                            value={zoom}
                                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                                            className="w-20 accent-indigo-600 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                                        />
                                        <button
                                            onClick={() => setZoom(1)}
                                            className="text-[10px] font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            초기화
                                        </button>
                                    </div>
                                    
                                    {/* Background Selector */}
                                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                                        <button
                                            onClick={() => setPreviewBg("light")}
                                            className={`p-1 rounded-md transition-all ${
                                                previewBg === "light"
                                                    ? "bg-white text-zinc-900 shadow-sm"
                                                    : "text-zinc-500 dark:text-zinc-400"
                                            }`}
                                            title="밝게"
                                        >
                                            <Sun className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setPreviewBg("dark")}
                                            className={`p-1 rounded-md transition-all ${
                                                previewBg === "dark"
                                                    ? "bg-zinc-900 text-white shadow-sm"
                                                    : "text-zinc-500 dark:text-zinc-400"
                                            }`}
                                            title="어둡게"
                                        >
                                            <Moon className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setPreviewBg("default")}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                                previewBg === "default"
                                                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                                    : "text-zinc-500 dark:text-zinc-400"
                                            }`}
                                        >
                                            기본
                                        </button>
                                    </div>
                                </div>

                                {/* Preview Area */}
                                <div
                                    className={`flex-1 flex items-center justify-center p-8 transition-colors ${
                                        previewBg === "light"
                                            ? "bg-white"
                                            : previewBg === "dark"
                                            ? "bg-zinc-950"
                                            : "bg-zinc-100/50 dark:bg-zinc-800/50"
                                    }`}
                                >
                                    <div
                                        style={{ zoom: zoom, transition: "zoom 0.1s ease-out" }}
                                        className="flex items-center justify-center"
                                        dangerouslySetInnerHTML={{ __html: optimized }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div 
                                className="h-[450px] w-full glass-card flex flex-col items-center justify-center border-2 border-dashed border-zinc-300/50 dark:border-zinc-700/50 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group"
                                onClick={handleFileUploadClick}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-indigo-500" />
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">SVG 파일을 드래그하여 놓거나</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">우측 상단 '파일 선택' 버튼을 누르세요</p>
                            </div>
                        )}
                    </div>
                )}

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
                        <div className="h-[450px] w-full flex items-center justify-center glass-card">
                            <div className="flex flex-col items-center gap-3 p-8 text-center">
                                <AlertCircle className="w-10 h-10 text-rose-400" />
                                <p className="text-rose-400 font-semibold text-sm">{error}</p>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            readOnly
                            className="h-[450px] w-full p-4 glass-card resize-none font-mono text-sm text-emerald-600 dark:text-emerald-400 focus:outline-none"
                            placeholder="최적화된 SVG 코드가 여기에 표시됩니다..."
                            value={optimized}
                            spellCheck={false}
                        />
                    )}
                </div>
            </div>

            {/* SVG Preview (Code Mode Only) */}
            {inputMode === "code" && optimized && !error && (
                <div className="glass-card p-6 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">미리보기</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Zoom Slider */}
                            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-xl">
                                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 min-w-[36px] text-right">{zoom.toFixed(1)}x</span>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="5"
                                    step="0.1"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-24 accent-indigo-600 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
                                />
                                <button
                                    onClick={() => setZoom(1)}
                                    className="text-xs font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    초기화
                                </button>
                            </div>

                            {/* Background Selector */}
                            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl">
                                <button
                                    onClick={() => setPreviewBg("light")}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        previewBg === "light"
                                            ? "bg-white text-zinc-900 shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                                    }`}
                                    title="밝게"
                                >
                                    <Sun className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewBg("dark")}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        previewBg === "dark"
                                            ? "bg-zinc-900 text-white shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                                    }`}
                                    title="어둡게"
                                >
                                    <Moon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewBg("default")}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        previewBg === "default"
                                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                                    }`}
                                >
                                    기본
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`flex items-center justify-center p-8 rounded-2xl min-h-32 overflow-hidden transition-all duration-300 ${
                            previewBg === "light"
                                ? "bg-white border border-zinc-200"
                                : previewBg === "dark"
                                ? "bg-zinc-950 border border-zinc-800"
                                : "bg-zinc-100/50 dark:bg-zinc-800/50"
                        }`}
                    >
                        <div
                            style={{ zoom: zoom, transition: "zoom 0.1s ease-out" }}
                            className="flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: optimized }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
