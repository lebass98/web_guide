"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search, X, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharItem {
    char: string;
    code: string;
    html: string;
}

interface Category {
    id: string;
    label: string;
    color: string;
    ranges: [number, number][];
}

const CATEGORIES: Category[] = [
    { id: "currency",     label: "통화 기호",    color: "emerald", ranges: [[0x20A0, 0x20CF]] },
    { id: "letterlike",   label: "문자형 기호",  color: "blue",    ranges: [[0x2100, 0x214F]] },
    { id: "number-forms", label: "숫자형 문자",  color: "orange",  ranges: [[0x2150, 0x218F]] },
    { id: "arrows",       label: "화살표",       color: "indigo",  ranges: [[0x2190, 0x21FF]] },
    { id: "math",         label: "수학 연산자",  color: "violet",  ranges: [[0x2200, 0x22FF]] },
    { id: "technical",    label: "기술 기호",    color: "sky",     ranges: [[0x2300, 0x23FF]] },
    { id: "enclosed",     label: "원형·괄호",    color: "amber",   ranges: [[0x2460, 0x24FF]] },
    { id: "box",          label: "박스 그리기",  color: "teal",    ranges: [[0x2500, 0x257F]] },
    { id: "block",        label: "블록 요소",    color: "slate",   ranges: [[0x2580, 0x259F]] },
    { id: "shapes",       label: "도형",         color: "rose",    ranges: [[0x25A0, 0x25FF]] },
    { id: "misc",         label: "기타 기호",    color: "yellow",  ranges: [[0x2600, 0x26FF]] },
    { id: "dingbats",     label: "딩뱃",         color: "pink",    ranges: [[0x2700, 0x27BF]] },
    { id: "supp-math",    label: "보충 수학",    color: "fuchsia", ranges: [[0x2A00, 0x2AFF]] },
    { id: "cjk-symbols",  label: "한중일 기호",  color: "lime",    ranges: [[0x3000, 0x303F]] },
    { id: "fullwidth",    label: "전각 문자",    color: "cyan",    ranges: [[0xFF01, 0xFF60]] },
];

function generateChars(ranges: [number, number][]): CharItem[] {
    const items: CharItem[] = [];
    for (const [start, end] of ranges) {
        for (let cp = start; cp <= end; cp++) {
            const char = String.fromCodePoint(cp);
            const hex = cp.toString(16).toUpperCase().padStart(4, "0");
            items.push({ char, code: `U+${hex}`, html: `&#x${hex};` });
        }
    }
    return items;
}

const ALL_CHARS = new Map<string, CharItem[]>(
    CATEGORIES.map((cat) => [cat.id, generateChars(cat.ranges)])
);

type ColorKey = "emerald" | "blue" | "orange" | "indigo" | "violet" | "sky" | "amber" | "teal" | "slate" | "rose" | "yellow" | "pink" | "fuchsia" | "lime" | "cyan";

const COLOR_ACTIVE: Record<ColorKey, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
    blue:    "bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-400",
    orange:  "bg-orange-500/10 border-orange-500/40 text-orange-700 dark:text-orange-400",
    indigo:  "bg-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-400",
    violet:  "bg-violet-500/10 border-violet-500/40 text-violet-700 dark:text-violet-400",
    sky:     "bg-sky-500/10 border-sky-500/40 text-sky-700 dark:text-sky-400",
    amber:   "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400",
    teal:    "bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-400",
    slate:   "bg-slate-500/10 border-slate-500/40 text-slate-700 dark:text-slate-400",
    rose:    "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400",
    yellow:  "bg-yellow-500/10 border-yellow-500/40 text-yellow-700 dark:text-yellow-400",
    pink:    "bg-pink-500/10 border-pink-500/40 text-pink-700 dark:text-pink-400",
    fuchsia: "bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-700 dark:text-fuchsia-400",
    lime:    "bg-lime-500/10 border-lime-500/40 text-lime-700 dark:text-lime-400",
    cyan:    "bg-cyan-500/10 border-cyan-500/40 text-cyan-700 dark:text-cyan-400",
};

export default function SpecialCharsPage() {
    const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<CharItem | null>(null);
    const [copied, setCopied] = useState<"char" | "html" | "code" | null>(null);
    const [fontSize, setFontSize] = useState(18);

    const currentCategory = CATEGORIES.find((c) => c.id === selectedCat)!;

    const chars = useMemo(() => {
        const q = search.trim();
        if (!q) return ALL_CHARS.get(selectedCat) ?? [];
        const allItems: CharItem[] = [];
        for (const items of ALL_CHARS.values()) allItems.push(...items);
        const lower = q.toLowerCase();
        return allItems.filter(
            (c) =>
                c.char === q ||
                c.code.toLowerCase().includes(lower) ||
                c.html.toLowerCase().includes(lower)
        );
    }, [selectedCat, search]);

    const handleCopy = (item: CharItem, mode: "char" | "html" | "code") => {
        const text = mode === "char" ? item.char : mode === "html" ? item.html : item.code;
        navigator.clipboard.writeText(text);
        setCopied(mode);
        setTimeout(() => setCopied(null), 1500);
    };

    const handleCharClick = (item: CharItem) => {
        setSelected(item);
        handleCopy(item, "char");
    };

    return (
        <>
            <PageHeader
                title="특수문자 모음"
                description="Unicode 특수문자를 카테고리별로 탐색하고 클릭하여 복사하세요. HTML 엔티티와 코드포인트도 함께 확인할 수 있습니다."
            />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Grid Area */}
                <div className="flex-1 min-w-0">
                    {/* Search + Font Size */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="문자 또는 U+코드 검색..."
                                className="w-full pl-9 pr-9 py-2.5 glass-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white placeholder:text-zinc-400"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 glass-card px-3 py-2">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">크기</span>
                            <input
                                type="range"
                                min={10}
                                max={30}
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-24 accent-indigo-500"
                            />
                            <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 w-8 text-right">{fontSize}px</span>
                        </div>
                    </div>

                    {/* Category tabs */}
                    {!search && (
                        <div className="flex gap-1.5 flex-wrap mb-5">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCat(cat.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                        selectedCat === cat.id
                                            ? COLOR_ACTIVE[cat.color as ColorKey]
                                            : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600"
                                    )}
                                >
                                    {cat.label}
                                    <span className="ml-1.5 opacity-50 font-normal text-[10px]">
                                        {ALL_CHARS.get(cat.id)?.length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Category info */}
                    {!search ? (
                        <div className="flex items-center gap-2 mb-4">
                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-md border", COLOR_ACTIVE[currentCategory.color as ColorKey])}>
                                {currentCategory.label}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">
                                {currentCategory.ranges
                                    .map(([s, e]) =>
                                        `U+${s.toString(16).toUpperCase().padStart(4, "0")}–U+${e.toString(16).toUpperCase().padStart(4, "0")}`
                                    )
                                    .join(", ")}
                            </span>
                        </div>
                    ) : (
                        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                            검색 결과:{" "}
                            <span className="font-semibold text-zinc-900 dark:text-white">{chars.length}</span>개
                        </p>
                    )}

                    {/* Character Grid */}
                    <div className="glass-card p-4 md:p-5 overflow-visible">
                        {chars.length > 0 ? (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-1">
                                {chars.map((item) => (
                                    <CharButton
                                        key={item.code}
                                        item={item}
                                        isSelected={selected?.code === item.code}
                                        onClick={handleCharClick}
                                        fontSize={fontSize}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-12 text-zinc-400 text-sm">검색 결과가 없습니다.</p>
                        )}
                    </div>
                </div>

                {/* Right: Detail Panel */}
                <div className="lg:w-64 shrink-0">
                    <div className="sticky top-24">
                        <div className="glass-card p-5">
                            {selected ? (
                                <div className="space-y-4">
                                    {/* Big char display */}
                                    <div className="flex items-center justify-center h-24 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                                        <span className="text-6xl select-all">{selected.char}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-zinc-500 dark:text-zinc-400 shrink-0">코드포인트</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-mono text-zinc-900 dark:text-white">{selected.code}</span>
                                                <button
                                                    onClick={() => handleCopy(selected, "code")}
                                                    className="p-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                    title="코드포인트 복사"
                                                >
                                                    {copied === "code" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-zinc-500 dark:text-zinc-400 shrink-0">HTML 엔티티</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-mono text-zinc-900 dark:text-white">{selected.html}</span>
                                                <button
                                                    onClick={() => handleCopy(selected, "html")}
                                                    className="p-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                    title="HTML 엔티티 복사"
                                                >
                                                    {copied === "html" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Copy char button */}
                                    <button
                                        onClick={() => handleCopy(selected, "char")}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95",
                                            copied === "char"
                                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                                                : "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20"
                                        )}
                                    >
                                        {copied === "char" ? (
                                            <><Check className="w-4 h-4" /> 복사됨</>
                                        ) : (
                                            <><Copy className="w-4 h-4" /> 문자 복사</>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center text-2xl">
                                        ✦
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                        문자를 클릭하면 자동으로 복사되고 여기서 상세 정보를 확인할 수 있습니다.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                            <div className="glass-card px-3 py-2.5">
                                <div className="text-lg font-bold text-zinc-900 dark:text-white">{CATEGORIES.length}</div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">카테고리</div>
                            </div>
                            <div className="glass-card px-3 py-2.5">
                                <div className="text-lg font-bold text-zinc-900 dark:text-white">
                                    {[...ALL_CHARS.values()].reduce((s, v) => s + v.length, 0).toLocaleString()}
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">총 문자 수</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copy toast */}
            {copied === "char" && selected && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold px-4 py-2.5 rounded-full shadow-2xl pointer-events-none">
                    <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    클립보드에 복사됨:{" "}
                    <span className="font-mono text-base">{selected.char}</span>
                    <span className="font-mono text-xs opacity-60 ml-1">{selected.code}</span>
                </div>
            )}
        </>
    );
}

interface CharButtonProps {
    item: CharItem;
    isSelected: boolean;
    onClick: (item: CharItem) => void;
    fontSize: number;
}

function CharButton({ item, isSelected, onClick, fontSize }: CharButtonProps) {
    return (
        <div className="relative group">
            <button
                onClick={() => onClick(item)}
                style={{ fontSize }}
                className={cn(
                    "h-[48px] w-full flex items-center justify-center rounded-lg border font-mono transition-all duration-150 active:scale-90 select-none",
                    isSelected
                        ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-500/10"
                        : "bg-white/40 dark:bg-zinc-800/40 border-white/50 dark:border-zinc-700/50 text-gray-800 dark:text-zinc-200 hover:bg-indigo-500/10 hover:border-indigo-400/30 hover:text-indigo-700 dark:hover:text-indigo-400"
                )}
            >
                {item.char}
            </button>

            {/* Hover tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="bg-zinc-900/95 dark:bg-zinc-800/95 backdrop-blur-md border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/30 px-4 py-3 flex flex-col items-center gap-1.5 min-w-[88px]">
                    <span className="text-[72px] leading-none text-white select-none">{item.char}</span>
                    <span className="text-[11px] font-mono text-indigo-400 font-medium">{item.code}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{item.html}</span>
                </div>
                {/* Arrow */}
                <div className="w-3 h-3 bg-zinc-900/95 dark:bg-zinc-800/95 border-r border-b border-zinc-700/60 rotate-45 mx-auto -mt-1.5" />
            </div>
        </div>
    );
}
