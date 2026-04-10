"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTheme } from "next-themes";
import { DiffEditor, useMonaco } from "@monaco-editor/react";
import { Trash2, FileDiff, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
    { value: "plaintext", label: "일반 텍스트" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "sql", label: "SQL" },
];

export default function CodeDiffPage() {
    const { resolvedTheme } = useTheme();
    const [language, setLanguage] = useState("javascript");
    const [original, setOriginal] = useState("// 여기에 원본 코드를 입력하세요\nfunction test() {\n  console.log('original');\n}");
    const [modified, setModified] = useState("// 여기에 수정된 코드를 입력하세요\nfunction test() {\n  console.log('modified');\n}");
    const [renderSideBySide, setRenderSideBySide] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleClear = () => {
        setOriginal("");
        setModified("");
    };

    return (
        <div className="flex flex-col h-full min-h-[calc(100vh-80px)]">
            <PageHeader
                title="코드 비교 (Code Diff)"
                description="두 개의 텍스트나 코드를 비교하여 차이점을 시각적으로 확인하고 편집하세요."
            />

            <div className="flex-1 flex flex-col gap-4 mt-2">
                {/* 툴바 */}
                <div className="glass-card p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 font-medium transition-colors"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => setRenderSideBySide(!renderSideBySide)}
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
                        >
                            <Settings2 className="w-4 h-4" />
                            {renderSideBySide ? "인라인 뷰어" : "좌우 분할 뷰어"}
                        </button>
                    </div>

                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors font-medium text-sm w-full sm:w-auto justify-center"
                    >
                        <Trash2 className="w-4 h-4" /> 양쪽 지우기
                    </button>
                </div>

                {/* 에디터 영역 */}
                <div className="flex-1 glass-card overflow-hidden rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 h-[75vh] min-h-[600px] flex flex-col">
                    {isMounted ? (
                        <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                            <div className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> 원본 코드 (Original)
                            </div>
                            <div className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 수정본 코드 (Modified)
                            </div>
                        </div>
                    ) : null}
                    
                    <div className="flex-1 w-full bg-white dark:bg-[#1e1e1e] relative">
                        {isMounted && (
                            <div className="absolute inset-0">
                                <DiffEditor
                                    height="100%"
                                    language={language}
                                    original={original}
                                    modified={modified}
                                    theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                                    options={{
                                        originalEditable: true,
                                        readOnly: false,
                                        renderSideBySide: renderSideBySide,
                                        minimap: { enabled: false },
                                        wordWrap: "on",
                                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                                        fontSize: 16,
                                        lineHeight: 1.6,
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                    }}
                                    onMount={(editor) => {
                                        // Change updates can be tracked if needed, but DiffEditor manages original/modified naturally through props
                                        // We'll let Monaco handle the internal state initially
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
