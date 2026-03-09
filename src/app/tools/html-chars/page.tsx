"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2 } from "lucide-react";
import { useToolState } from "@/components/providers/TabProvider";
import { cn } from "@/lib/utils";

export default function HtmlCharsPage() {
    const pathname = usePathname();
    const [state, setState] = useToolState(pathname, { input: "", output: "" });
    const { input, output } = state;

    const handleConvert = (text: string) => {
        let converted = text;
        try {
            const doc = new DOMParser().parseFromString(text, "text/html");
            converted = doc.documentElement.textContent || "";
        } catch (e) {
            // keep original if fail
        }
        setState({ input: text, output: converted });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <>
            <PageHeader
                title="HTML 특수문자 변환"
                description="HTML 엔티티를 디코딩하고 특수문자를 즉시 제거하세요."
            />

            <div className="flex flex-col lg:flex-row gap-8 h-[600px]">
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">HTML 입력</label>
                    <textarea
                        className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                        placeholder="여기에 HTML 문자열을 붙여넣으세요... 예: &lt;div&gt;Hello&lt;/div&gt;"
                        value={input}
                        onChange={(e) => handleConvert(e.target.value)}
                    />
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">변환 결과</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleConvert("")}
                                className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
                                title="지우기"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCopy}
                                className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
                                title="클립보드에 복사"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <textarea
                        readOnly
                        className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm text-gray-900 dark:text-white"
                        placeholder="변환된 텍스트가 여기에 표시됩니다..."
                        value={output}
                    />
                </div>
            </div>
        </>
    );
}
