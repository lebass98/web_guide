"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToolState } from "@/components/providers/TabProvider";

export default function JsonFormatterPage() {
    const pathname = usePathname();
    const [state, setState] = useToolState(pathname, { input: "", output: "", error: null as string | null });
    const { input, output, error } = state;

    const formatJson = (text: string) => {
        if (!text.trim()) {
            setState({ input: text, output: "", error: null });
            return;
        }

        try {
            const parsed = JSON.parse(text);
            setState({
                input: text,
                output: JSON.stringify(parsed, null, 2),
                error: null
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "잘못된 JSON 형식";
            setState({
                input: text,
                output: "",
                error: errorMessage
            });
        }
    };

    const handleCopy = () => {
        if (output) navigator.clipboard.writeText(output);
    };

    return (
        <>
            <PageHeader
                title="JSON 포매터 및 검사기"
                description="JSON 데이터를 즉시 포맷하고 검증하며 정렬해 보세요."
            />

            <div className="flex flex-col lg:flex-row gap-8 h-[500px] mb-6">
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">JSON 입력</label>
                    <textarea
                        className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 dark:text-white"
                        placeholder="구조화되지 않은 JSON을 여기에 붙여넣으세요..."
                        value={input}
                        onChange={(e) => formatJson(e.target.value)}
                        spellCheck={false}
                    />
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">포맷된 결과</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => formatJson("")}
                                className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-all active:scale-95"
                                title="지우기"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    output
                                        ? "text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10"
                                        : "text-zinc-500 cursor-not-allowed"
                                )}
                                title="클립보드에 복사"
                                disabled={!output}
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <textarea
                        readOnly
                        className={cn(
                            "flex-1 w-full p-4 glass-card resize-none font-mono text-sm",
                            error ? "text-zinc-400 dark:text-zinc-500 opacity-60" : "text-fuchsia-600 dark:text-fuchsia-300"
                        )}
                        placeholder="포맷된 JSON이 여기에 표시됩니다..."
                        value={output}
                        spellCheck={false}
                    />
                </div>
            </div>

            <div>
                {error ? (
                    <div className="flex items-center gap-2 text-destructive-foreground bg-destructive/20 px-3 py-1.5 rounded-md text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        {error}
                    </div>
                ) : input.trim() ? (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        유효한 JSON
                    </div>
                ) : null}
            </div>
        </>
    );
}
