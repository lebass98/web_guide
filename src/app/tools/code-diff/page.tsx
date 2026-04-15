"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTheme } from "next-themes";
import { DiffEditor } from "@monaco-editor/react";
import { Trash2, Settings2, ArrowLeftRight, Copy, Check, PlusCircle, MinusCircle } from "lucide-react";
import type * as Monaco from "monaco-editor";

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

const INITIAL_ORIGINAL = "// 여기에 원본 코드를 입력하세요\nfunction test() {\n  console.log('original');\n}";
const INITIAL_MODIFIED = "// 여기에 수정된 코드를 입력하세요\nfunction test() {\n  console.log('modified');\n}";

interface DiffStats {
    added: number;
    removed: number;
}

type CopiedSide = "original" | "modified" | null;

export default function CodeDiffPage() {
    const { resolvedTheme } = useTheme();
    const [language, setLanguage] = useState("javascript");
    const [original, setOriginal] = useState(INITIAL_ORIGINAL);
    const [modified, setModified] = useState(INITIAL_MODIFIED);
    const [renderSideBySide, setRenderSideBySide] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [diffStats, setDiffStats] = useState<DiffStats | null>(null);
    const [copiedSide, setCopiedSide] = useState<CopiedSide>(null);

    const editorRef = useRef<Monaco.editor.IStandaloneDiffEditor | null>(null);
    const originalRef = useRef(original);
    const modifiedRef = useRef(modified);

    useEffect(() => { setIsMounted(true); }, []);

    // 복사 후 일정 시간 뒤 아이콘 되돌리기
    const handleCopy = useCallback((side: "original" | "modified") => {
        const text = side === "original" ? originalRef.current : modifiedRef.current;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedSide(side);
            setTimeout(() => setCopiedSide(null), 2000);
        });
    }, []);

    // 원본 ↔ 수정본 교체
    const handleSwap = useCallback(() => {
        const prevOriginal = originalRef.current;
        const prevModified = modifiedRef.current;
        setOriginal(prevModified);
        setModified(prevOriginal);
    }, []);

    // 양쪽 지우기
    const handleClear = useCallback(() => {
        setOriginal("");
        setModified("");
        setDiffStats(null);
    }, []);

    // diff 통계 계산
    const computeDiffStats = useCallback((editor: Monaco.editor.IStandaloneDiffEditor) => {
        const lineChanges = editor.getLineChanges();
        if (!lineChanges) { setDiffStats(null); return; }

        let added = 0;
        let removed = 0;
        for (const change of lineChanges) {
            if (change.modifiedEndLineNumber >= change.modifiedStartLineNumber) {
                added += change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
            }
            if (change.originalEndLineNumber >= change.originalStartLineNumber) {
                removed += change.originalEndLineNumber - change.originalStartLineNumber + 1;
            }
        }
        setDiffStats({ added, removed });
    }, []);

    const handleEditorMount = useCallback((editor: Monaco.editor.IStandaloneDiffEditor) => {
        editorRef.current = editor;

        const originalEditor = editor.getOriginalEditor();
        const modifiedEditor = editor.getModifiedEditor();

        // 에디터 내용 변경 시 state 동기화 (clear 등 제어 동작을 위해)
        originalEditor.onDidChangeModelContent(() => {
            originalRef.current = originalEditor.getValue();
        });
        modifiedEditor.onDidChangeModelContent(() => {
            modifiedRef.current = modifiedEditor.getValue();
        });

        // diff 통계 갱신
        editor.onDidUpdateDiff(() => computeDiffStats(editor));
        computeDiffStats(editor);
    }, [computeDiffStats]);

    // original/modified prop 변경 시 ref도 최신화
    useEffect(() => { originalRef.current = original; }, [original]);
    useEffect(() => { modifiedRef.current = modified; }, [modified]);

    return (
        <div className="flex flex-col h-full min-h-[calc(100vh-80px)]">
            <PageHeader
                title="코드 비교 (Code Diff)"
                description="두 개의 텍스트나 코드를 비교하여 차이점을 시각적으로 확인하고 편집하세요."
            />

            <div className="flex-1 flex flex-col gap-4 mt-2">
                {/* 툴바 */}
                <div className="glass-card p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
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

                        <button
                            onClick={handleSwap}
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
                            title="원본 ↔ 수정본 교체"
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                            좌우 교체
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {/* diff 통계 */}
                        {diffStats && (diffStats.added > 0 || diffStats.removed > 0) && (
                            <div className="flex items-center gap-2 text-sm font-medium">
                                {diffStats.added > 0 && (
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                                        <PlusCircle className="w-3.5 h-3.5" /> {diffStats.added}줄
                                    </span>
                                )}
                                {diffStats.removed > 0 && (
                                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md">
                                        <MinusCircle className="w-3.5 h-3.5" /> {diffStats.removed}줄
                                    </span>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors font-medium text-sm justify-center"
                        >
                            <Trash2 className="w-4 h-4" /> 양쪽 지우기
                        </button>
                    </div>
                </div>

                {/* 에디터 영역 */}
                <div className="flex-1 glass-card overflow-hidden rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 h-[75vh] min-h-[600px] flex flex-col">
                    {/* 패널 헤더 */}
                    {isMounted && (
                        renderSideBySide ? (
                            <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                                <div className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                        원본 코드 (Original)
                                    </span>
                                    <button
                                        onClick={() => handleCopy("original")}
                                        className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                                        title="원본 복사"
                                    >
                                        {copiedSide === "original" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase flex items-center justify-between gap-2 border-l border-zinc-200 dark:border-zinc-800">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        수정본 코드 (Modified)
                                    </span>
                                    <button
                                        onClick={() => handleCopy("modified")}
                                        className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                                        title="수정본 복사"
                                    >
                                        {copiedSide === "modified" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 px-4 py-2 flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                                    인라인 비교 뷰 (Inline Diff)
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy("original")}
                                        className="flex items-center gap-1.5 p-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                                        title="원본 복사"
                                    >
                                        {copiedSide === "original" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        원본
                                    </button>
                                    <button
                                        onClick={() => handleCopy("modified")}
                                        className="flex items-center gap-1.5 p-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                                        title="수정본 복사"
                                    >
                                        {copiedSide === "modified" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        수정본
                                    </button>
                                </div>
                            </div>
                        )
                    )}

                    <div className="flex-1 w-full bg-white dark:bg-[#1e1e1e] relative">
                        {isMounted && (
                            <div className="absolute inset-0">
                                <DiffEditor
                                    height="100%"
                                    language={language}
                                    original={original}
                                    modified={modified}
                                    theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                                    options={{
                                        originalEditable: true,
                                        readOnly: false,
                                        renderSideBySide: renderSideBySide,
                                        minimap: { enabled: false },
                                        wordWrap: "on",
                                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                    }}
                                    onMount={handleEditorMount}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 차이점 없음 안내 */}
                {isMounted && diffStats && diffStats.added === 0 && diffStats.removed === 0 && (
                    <div className="shrink-0 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2.5 rounded-xl text-sm font-medium border border-emerald-200/50 dark:border-emerald-500/20">
                        <Check className="w-4 h-4" />
                        두 코드가 동일합니다. 차이점이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
