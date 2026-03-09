"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToolState } from "@/components/providers/TabProvider";

export default function Base64Page() {
    const pathname = usePathname();
    const [state, setState] = useToolState(pathname, { input: "", output: "", mode: "encode" as "encode" | "decode", error: null as string | null });
    const { input, output, mode, error } = state;

    const processText = (text: string, currentMode: "encode" | "decode") => {
        if (!text.trim()) {
            setState({ input: text, output: "", mode: currentMode, error: null });
            return;
        }

        try {
            let processed = "";
            if (currentMode === "encode") {
                processed = btoa(unescape(encodeURIComponent(text)));
            } else {
                processed = decodeURIComponent(escape(atob(text)));
            }
            setState({ input: text, output: processed, mode: currentMode, error: null });
        } catch (err) {
            setState({
                input: text,
                output: "",
                mode: currentMode,
                error: currentMode === "decode" ? "잘못된 Base64 형식입니다." : "인코딩에 실패했습니다."
            });
        }
    };

    const handleModeSwitch = (newMode: "encode" | "decode") => {
        processText(input, newMode);
    };

    return (
        <>
            <PageHeader
                title="Base64 변환기"
                description="텍스트를 Base64 형식으로 안전하게 인코딩하거나 텍스트로 디코딩하세요."
            />

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleModeSwitch("encode")}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-medium transition-all shadow-sm",
                        mode === "encode"
                            ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                            : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    )}
                >
                    인코딩
                </button>
                <button
                    onClick={() => handleModeSwitch("decode")}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-medium transition-all shadow-sm",
                        mode === "decode"
                            ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                            : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    )}
                >
                    디코딩
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[400px]">
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">입력</label>
                    <textarea
                        className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                        placeholder={
                            mode === "encode"
                                ? "인코딩할 텍스트를 입력하세요..."
                                : "디코딩할 Base64를 붙여넣으세요..."
                        }
                        value={input}
                        onChange={(e) => processText(e.target.value, mode)}
                    />
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">변환 결과</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => processText("", mode)}
                                className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
                                title="지우기"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => navigator.clipboard.writeText(output)}
                                className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    output
                                        ? "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                                        : "text-zinc-500 cursor-not-allowed"
                                )}
                                title="클립보드에 복사"
                                disabled={!output}
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="relative flex-1 w-full">
                        <textarea
                            readOnly
                            className={cn(
                                "w-full h-full p-4 glass-card resize-none font-mono text-sm text-gray-900 dark:text-white",
                                error && "opacity-50"
                            )}
                            placeholder="결과가 여기에 표시됩니다..."
                            value={output}
                        />
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
                                <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20 font-medium whitespace-nowrap">
                                    <ShieldAlert className="w-5 h-5" />
                                    {error}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
