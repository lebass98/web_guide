"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Languages, ArrowRightLeft, Copy, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
    { code: "auto", name: "언어 감지" },
    { code: "ko", name: "한국어" },
    { code: "en", name: "영어" },
    { code: "ja", name: "일본어" },
    { code: "zh-CN", name: "중국어(간체)" },
    { code: "zh-TW", name: "중국어(번체)" },
    { code: "es", name: "스페인어" },
    { code: "fr", name: "프랑스어" },
    { code: "de", name: "독일어" },
    { code: "ru", name: "러시아어" },
];

export default function TranslatorPage() {
    const [sourceLang, setSourceLang] = useState("auto");
    const [targetLang, setTargetLang] = useState("ko");
    const [text, setText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const translate = async (sourceText: string, sl: string, tl: string) => {
        if (!sourceText.trim()) {
            setTranslatedText("");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${sl}&tl=${tl}&q=${encodeURIComponent(sourceText)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error("번역 요청에 실패했습니다.");
            }
            
            const data = await response.json();
            
            // data[0] contains an array of sentences
            let result = "";
            if (data && data[0]) {
                data[0].forEach((item: any) => {
                    if (item[0]) result += item[0];
                });
            }
            
            setTranslatedText(result);
        } catch (err) {
            console.error(err);
            setError("번역 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            setTranslatedText("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTranslate = () => {
        translate(text, sourceLang, targetLang);
    };

    const handleSwapLanguages = () => {
        let newSource = sourceLang;
        let newTarget = targetLang;

        if (sourceLang === "auto") {
            newSource = targetLang;
            newTarget = "en"; // Default to english if swapped from auto
        } else {
            newSource = targetLang;
            newTarget = sourceLang;
        }

        setSourceLang(newSource);
        setTargetLang(newTarget);
        
        // Swap text and translated text if an existing translation is present
        if (translatedText) {
            setText(translatedText);
            setTranslatedText(text); // Previous source becomes new translation roughly
            // Auto translate the swapped texts
            translate(translatedText, newSource, newTarget);
        }
    };

    const handleCopy = async () => {
        if (!translatedText) return;
        try {
            await navigator.clipboard.writeText(translatedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("복사 실패:", err);
        }
    };

    return (
        <>
            <PageHeader
                title="번역기"
                description="페이지 이동 없이 바로 텍스트 번역 결과를 확인하세요."
            />

            <div className="flex flex-col gap-8">
                
                {/* 언어 설정 바 */}
                <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full relative">
                        <select
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                            className="w-full appearance-none bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-bold transition-colors shadow-sm cursor-pointer"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={`source-${lang.code}`} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>

                    <button
                        onClick={handleSwapLanguages}
                        className="p-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700 transition-all shadow-sm active:scale-95 group shrink-0 z-10"
                        title="언어 교환"
                    >
                        <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                    </button>

                    <div className="flex-1 w-full relative">
                        <select
                            value={targetLang}
                            onChange={(e) => {
                                setTargetLang(e.target.value);
                                if (text.trim()) translate(text, sourceLang, e.target.value);
                            }}
                            className="w-full appearance-none bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-bold transition-colors shadow-sm cursor-pointer"
                        >
                            {LANGUAGES.filter(l => l.code !== "auto").map((lang) => (
                                <option key={`target-${lang.code}`} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {/* 번역 영역 (좌/우 분할) */}
                <div className="flex flex-col lg:flex-row gap-6 h-[400px]">
                    {/* 소스 텍스트 입력 */}
                    <div className="flex-1 lg:w-1/2 glass-card overflow-hidden flex flex-col relative focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.metaKey) {
                                    handleTranslate();
                                }
                            }}
                            placeholder="번역할 텍스트를 입력하세요...&#10;(Cmd/Ctrl + Enter를 누르면 즉시 번역됩니다)"
                            className="w-full h-full bg-transparent border-none p-6 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 resize-none text-lg leading-relaxed placeholder:text-zinc-400"
                        ></textarea>
                        
                        {text && (
                            <button 
                                onClick={() => {
                                    setText("");
                                    setTranslatedText("");
                                }}
                                className="absolute top-4 right-4 p-2 bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full transition-colors backdrop-blur-sm"
                                title="내용 지우기"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        )}

                        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                            <button
                                onClick={handleTranslate}
                                disabled={!text.trim() || isLoading}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-bold text-sm active:scale-95"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> 번역 중...
                                    </>
                                ) : (
                                    <>
                                        <Languages className="w-4 h-4" /> 번역하기
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 번역된 텍스트 출력 */}
                    <div className="flex-1 lg:w-1/2 glass-card overflow-hidden flex flex-col relative bg-zinc-50/30 dark:bg-zinc-900/30">
                        {error && (
                            <div className="absolute top-0 left-0 w-full p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium border-b border-red-500/20 flex items-center justify-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="w-full h-full p-6 overflow-auto">
                            {isLoading ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <p className="text-sm font-medium">번역해 오는 중...</p>
                                </div>
                            ) : translatedText ? (
                                <div className="text-zinc-900 dark:text-zinc-100 text-lg leading-relaxed whitespace-pre-wrap">
                                    {translatedText}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-medium">
                                    번역 결과가 이곳에 표시됩니다.
                                </div>
                            )}
                        </div>

                        {translatedText && !isLoading && (
                            <div className="p-4 flex justify-end absolute bottom-0 right-0 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-900 dark:via-zinc-900 dark:to-transparent">
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-bold text-sm active:scale-95 border",
                                        copied 
                                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                                            : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                                    )}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" /> 복사 완료!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" /> 결과 복사
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}
