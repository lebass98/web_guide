"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2, ArrowRight } from "lucide-react";
import { useToolState } from "@/components/providers/TabProvider";
import { cn } from "@/lib/utils";

export default function TextTransformerPage() {
    const pathname = usePathname();
    const [state, setState] = useToolState(pathname, { input: "", output: "", activeTransform: "uppercase" });
    const { input, output, activeTransform } = state;

    const transforms = [
        { id: "uppercase", label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
        { id: "lowercase", label: "lowercase", fn: (s: string) => s.toLowerCase() },
        {
            id: "titlecase",
            label: "Title Case",
            fn: (s: string) =>
                s.replace(
                    /\w\S*/g,
                    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                ),
        },
        { id: "nospaces", label: "Remove Spaces", fn: (s: string) => s.replace(/\s/g, "") },
        { id: "reverse", label: "Reverse Text", fn: (s: string) => s.split("").reverse().join("") },
    ];

    const handleTransform = (text: string, transformId: string) => {
        const transform = transforms.find((t) => t.id === transformId);
        setState({
            input: text,
            activeTransform: transformId,
            output: transform ? transform.fn(text) : ""
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <>
            <PageHeader
                title="텍스트 변환기"
                description="문자열 대소문자를 변환하고, 공백을 제거하며, 다양한 텍스트 조작을 적용하세요."
            />

            <div className="flex flex-wrap gap-2 mb-6">
                {transforms.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleTransform(input, t.id)}
                        className={cn(
                            "px-10 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm",
                            activeTransform === t.id
                                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                : "bg-white text-zinc-400 border-zinc-100 hover:bg-zinc-50 hover:text-zinc-600"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[400px]">
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">텍스트 입력</label>
                    <textarea
                        className="flex-1 w-full p-4 glass-card resize-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                        placeholder="여기에 텍스트를 입력하거나 붙여넣으세요..."
                        value={input}
                        onChange={(e) => handleTransform(e.target.value, activeTransform)}
                    />
                </div>

                <div className="hidden lg:flex items-center justify-center opacity-50">
                    <ArrowRight className="w-8 h-8 text-indigo-500" />
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">변환 결과</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleTransform("", activeTransform)}
                                className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
                                title="지우기"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    output
                                        ? "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                                        : "text-zinc-400 cursor-not-allowed"
                                )}
                                title="클립보드에 복사"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <textarea
                        readOnly
                        className="flex-1 w-full p-4 glass-card resize-none text-sm text-gray-900 dark:text-white"
                        placeholder="결과가 여기에 표시됩니다..."
                        value={output}
                    />
                </div>
            </div>
        </>
    );
}
