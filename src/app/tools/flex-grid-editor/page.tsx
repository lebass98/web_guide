"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, Copy, Plus, Minus, RefreshCw, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Mode = "flex" | "grid";
type FlexDir = "row" | "row-reverse" | "column" | "column-reverse";
type JCValue = "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
type AIValue = "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
type FWValue = "nowrap" | "wrap" | "wrap-reverse";

interface FlexCfg {
    direction: FlexDir;
    justifyContent: JCValue;
    alignItems: AIValue;
    wrap: FWValue;
    colGap: number;
    rowGap: number;
    pt: number; pr: number; pb: number; pl: number;
}

interface GridCfg {
    cols: number;
    colGap: number;
    rowGap: number;
    justifyItems: "stretch" | "start" | "center" | "end";
    alignItems: "stretch" | "start" | "center" | "end";
    justifyContent: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
    alignContent: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
    autoRows: number;
    pt: number; pr: number; pb: number; pl: number;
}

interface ItemProp {
    id: number;
    grow: number; shrink: number; basis: string;
    alignSelf: "auto" | "flex-start" | "center" | "flex-end" | "stretch";
    order: number;
    colSpan: number; rowSpan: number;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_FLEX: FlexCfg = {
    direction: "row", justifyContent: "flex-start", alignItems: "stretch",
    wrap: "wrap", colGap: 12, rowGap: 12, pt: 16, pr: 16, pb: 16, pl: 16,
};
const DEFAULT_GRID: GridCfg = {
    cols: 3, colGap: 12, rowGap: 12, justifyItems: "stretch", alignItems: "stretch",
    justifyContent: "start", alignContent: "start", autoRows: 80,
    pt: 16, pr: 16, pb: 16, pl: 16,
};
const DEFAULT_ITEM: ItemProp = { id: 0, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto", order: 0, colSpan: 1, rowSpan: 1 };

// ─── Item Colors ───────────────────────────────────────────────────────────────

const ITEM_PALETTE = [
    { bg: "bg-indigo-500/20", border: "border-indigo-500/40", text: "text-indigo-700 dark:text-indigo-300", ring: "ring-indigo-500" },
    { bg: "bg-rose-500/20",   border: "border-rose-500/40",   text: "text-rose-700 dark:text-rose-300",     ring: "ring-rose-500" },
    { bg: "bg-emerald-500/20",border: "border-emerald-500/40",text: "text-emerald-700 dark:text-emerald-300",ring: "ring-emerald-500" },
    { bg: "bg-amber-500/20",  border: "border-amber-500/40",  text: "text-amber-700 dark:text-amber-300",   ring: "ring-amber-500" },
    { bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-700 dark:text-violet-300", ring: "ring-violet-500" },
    { bg: "bg-cyan-500/20",   border: "border-cyan-500/40",   text: "text-cyan-700 dark:text-cyan-300",     ring: "ring-cyan-500" },
    { bg: "bg-pink-500/20",   border: "border-pink-500/40",   text: "text-pink-700 dark:text-pink-300",     ring: "ring-pink-500" },
    { bg: "bg-teal-500/20",   border: "border-teal-500/40",   text: "text-teal-700 dark:text-teal-300",     ring: "ring-teal-500" },
];

// ─── Custom SVG Icons (Figma-style) ────────────────────────────────────────────

function Svg({ c, title }: { c: React.ReactNode; title?: string }) {
    return (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-7 h-7" aria-hidden={!title}>
            {title && <title>{title}</title>}
            {c}
        </svg>
    );
}

// Direction
const IcRow     = () => <Svg c={<><rect x="1" y="5.5" width="4" height="5" rx="0.75"/><rect x="6.5" y="5.5" width="4" height="5" rx="0.75"/><rect x="12" y="5.5" width="3" height="5" rx="0.75"/></>} />;
const IcRowRev  = () => <Svg c={<><rect x="12" y="5.5" width="3" height="5" rx="0.75"/><rect x="6.5" y="5.5" width="4" height="5" rx="0.75"/><rect x="1" y="5.5" width="4" height="5" rx="0.75"/><path d="M2.5 3.5L1 5l1.5 1.5" stroke="currentColor" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></>} />;
const IcCol     = () => <Svg c={<><rect x="4" y="1" width="8" height="4" rx="0.75"/><rect x="4" y="6.5" width="8" height="4" rx="0.75"/><rect x="4" y="12" width="8" height="3" rx="0.75"/></>} />;
const IcColRev  = () => <Svg c={<><rect x="4" y="12" width="8" height="3" rx="0.75"/><rect x="4" y="6.5" width="8" height="4" rx="0.75"/><rect x="4" y="1" width="8" height="4" rx="0.75"/><path d="M3.5 13.5L2 12l1.5-1.5" stroke="currentColor" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></>} />;

// Wrap
const IcNowrap     = () => <Svg c={<><rect x="1" y="6" width="3" height="4" rx="0.6"/><rect x="4.5" y="6" width="3" height="4" rx="0.6"/><rect x="8" y="6" width="3" height="4" rx="0.6"/><rect x="11.5" y="6" width="3.5" height="4" rx="0.6"/></>} />;
const IcWrap       = () => <Svg c={<><rect x="1" y="2.5" width="3" height="4" rx="0.6"/><rect x="4.5" y="2.5" width="3" height="4" rx="0.6"/><rect x="8" y="2.5" width="3" height="4" rx="0.6"/><rect x="1" y="9" width="3" height="4" rx="0.6"/><rect x="4.5" y="9" width="3" height="4" rx="0.6"/><path d="M14 2.5v5M14 7.5H9.5M9.5 7.5l1.5-1.5M9.5 7.5l1.5 1.5" stroke="currentColor" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/></>} />;
const IcWrapRev    = () => <Svg c={<><rect x="1" y="9.5" width="3" height="4" rx="0.6"/><rect x="4.5" y="9.5" width="3" height="4" rx="0.6"/><rect x="8" y="9.5" width="3" height="4" rx="0.6"/><rect x="1" y="3" width="3" height="4" rx="0.6"/><rect x="4.5" y="3" width="3" height="4" rx="0.6"/><path d="M14 13.5V8.5M14 8.5H9.5M9.5 8.5l1.5-1.5M9.5 8.5l1.5 1.5" stroke="currentColor" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/></>} />;

// Justify-Content (horizontal in row mode)
const IcJStart   = () => <Svg c={<><rect x="1" y="5.5" width="1" height="5" rx="0.5" opacity="0.45"/><rect x="3" y="6.5" width="3.5" height="3" rx="0.6"/><rect x="7.5" y="6.5" width="4" height="3" rx="0.6"/></>} />;
const IcJCenter  = () => <Svg c={<><rect x="1.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="6.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="11.5" y="6.5" width="3" height="3" rx="0.6"/></>} />;
const IcJEnd     = () => <Svg c={<><rect x="14" y="5.5" width="1" height="5" rx="0.5" opacity="0.45"/><rect x="9.5" y="6.5" width="3.5" height="3" rx="0.6"/><rect x="5" y="6.5" width="3.5" height="3" rx="0.6"/></>} />;
const IcJBetween = () => <Svg c={<><rect x="1" y="6.5" width="3.5" height="3" rx="0.6"/><rect x="6.25" y="6.5" width="3.5" height="3" rx="0.6"/><rect x="11.5" y="6.5" width="3.5" height="3" rx="0.6"/></>} />;
const IcJAround  = () => <Svg c={<><rect x="1.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="6.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="11.5" y="6.5" width="3" height="3" rx="0.6"/><rect x="0.5" y="13.5" width="15" height="0.5" opacity="0.08"/></>} />;
const IcJEvenly  = () => <Svg c={<><rect x="2" y="6.5" width="2.5" height="3" rx="0.6"/><rect x="6.75" y="6.5" width="2.5" height="3" rx="0.6"/><rect x="11.5" y="6.5" width="2.5" height="3" rx="0.6"/></>} />;

// Align-Items (vertical in row mode)
const IcAStretch  = () => <Svg c={<><rect x="1" y="3" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="1" y="12.3" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="2" y="3.7" width="3" height="8.6" rx="0.75"/><rect x="6.5" y="3.7" width="3" height="8.6" rx="0.75"/><rect x="11" y="3.7" width="3" height="8.6" rx="0.75"/></>} />;
const IcAStart    = () => <Svg c={<><rect x="1" y="3" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="2" y="3.7" width="3" height="5" rx="0.75"/><rect x="6.5" y="3.7" width="3" height="7" rx="0.75"/><rect x="11" y="3.7" width="3" height="4" rx="0.75"/></>} />;
const IcACenter   = () => <Svg c={<><rect x="1" y="7.65" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="2" y="5.25" width="3" height="5.5" rx="0.75"/><rect x="6.5" y="4.25" width="3" height="7.5" rx="0.75"/><rect x="11" y="6.25" width="3" height="3.5" rx="0.75"/></>} />;
const IcAEnd      = () => <Svg c={<><rect x="1" y="12.3" width="14" height="0.7" rx="0.35" opacity="0.35"/><rect x="2" y="7.3" width="3" height="5" rx="0.75"/><rect x="6.5" y="5.3" width="3" height="7" rx="0.75"/><rect x="11" y="8.3" width="3" height="4" rx="0.75"/></>} />;
const IcABaseline = () => <Svg c={<><rect x="1" y="9.5" width="14" height="0.5" rx="0.25" opacity="0.45"/><rect x="2" y="4.5" width="3" height="5" rx="0.75"/><rect x="6.5" y="3" width="3" height="6.5" rx="0.75"/><rect x="11" y="6" width="3" height="3.5" rx="0.75"/></>} />;

// Grid-specific: justify-items, align-items within cell
const IcGJStart  = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="2.5" y="4" width="5" height="8" rx="0.6"/></>} />;
const IcGJCenter = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="5.5" y="4" width="5" height="8" rx="0.6"/></>} />;
const IcGJEnd    = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="8.5" y="4" width="5" height="8" rx="0.6"/></>} />;
const IcGAStart  = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="3" y="2.5" width="10" height="5" rx="0.6"/></>} />;
const IcGACenter = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="3" y="5.5" width="10" height="5" rx="0.6"/></>} />;
const IcGAEnd    = () => <Svg c={<><rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"/><rect x="3" y="8.5" width="10" height="5" rx="0.6"/></>} />;

// ─── Tailwind mapping ──────────────────────────────────────────────────────────

const JC_TW: Record<string, string> = {
    "flex-start": "justify-start", center: "justify-center", "flex-end": "justify-end",
    "space-between": "justify-between", "space-around": "justify-around", "space-evenly": "justify-evenly",
    start: "justify-start", end: "justify-end",
};
const AI_TW: Record<string, string> = {
    stretch: "items-stretch", "flex-start": "items-start", center: "items-center",
    "flex-end": "items-end", baseline: "items-baseline", start: "items-start", end: "items-end",
};
const FD_TW: Record<string, string> = {
    row: "flex-row", "row-reverse": "flex-row-reverse", column: "flex-col", "column-reverse": "flex-col-reverse",
};
const FW_TW: Record<string, string> = { nowrap: "flex-nowrap", wrap: "flex-wrap", "wrap-reverse": "flex-wrap-reverse" };
const JI_TW: Record<string, string> = { stretch: "justify-items-stretch", start: "justify-items-start", center: "justify-items-center", end: "justify-items-end" };
const AC_TW: Record<string, string> = { start: "content-start", center: "content-center", end: "content-end", "space-between": "content-between", "space-around": "content-around", "space-evenly": "content-evenly" };

// ─── Main Component ────────────────────────────────────────────────────────────

export default function FlexGridEditorPage() {
    const { toast } = useToast();
    const [mode, setMode] = useState<Mode>("flex");
    const [flex, setFlex] = useState<FlexCfg>({ ...DEFAULT_FLEX });
    const [grid, setGrid] = useState<GridCfg>({ ...DEFAULT_GRID });
    const [itemCount, setItemCount] = useState(5);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [items, setItems] = useState<ItemProp[]>(
        Array.from({ length: 8 }, (_, i) => ({ ...DEFAULT_ITEM, id: i }))
    );
    const [codeTab, setCodeTab] = useState<"css" | "html" | "tailwind">("css");
    const [copied, setCopied] = useState(false);

    const updateFlex = useCallback(<K extends keyof FlexCfg>(k: K, v: FlexCfg[K]) =>
        setFlex(p => ({ ...p, [k]: v })), []);

    const updateGrid = useCallback(<K extends keyof GridCfg>(k: K, v: GridCfg[K]) =>
        setGrid(p => ({ ...p, [k]: v })), []);

    const updateItem = useCallback(<K extends keyof ItemProp>(id: number, k: K, v: ItemProp[K]) =>
        setItems(prev => prev.map(it => it.id === id ? { ...it, [k]: v } : it)), []);

    const selectedItem = useMemo(() => items.find(it => it.id === selectedId) ?? null, [items, selectedId]);

    const containerStyle = useMemo(() => {
        const base = { padding: `${mode === "flex" ? flex.pt : grid.pt}px ${mode === "flex" ? flex.pr : grid.pr}px ${mode === "flex" ? flex.pb : grid.pb}px ${mode === "flex" ? flex.pl : grid.pl}px` };
        if (mode === "flex") return {
            ...base, display: "flex", flexDirection: flex.direction, justifyContent: flex.justifyContent,
            alignItems: flex.alignItems, flexWrap: flex.wrap,
            columnGap: `${flex.colGap}px`, rowGap: `${flex.rowGap}px`,
        };
        return {
            ...base, display: "grid",
            gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
            gridAutoRows: `${grid.autoRows}px`,
            columnGap: `${grid.colGap}px`, rowGap: `${grid.rowGap}px`,
            justifyItems: grid.justifyItems, alignItems: grid.alignItems,
            justifyContent: grid.justifyContent, alignContent: grid.alignContent,
        };
    }, [mode, flex, grid]);

    const cssCode = useMemo(() => {
        if (mode === "flex") {
            const lines = [
                `.container {`,
                `  display: flex;`,
                flex.direction !== "row" ? `  flex-direction: ${flex.direction};` : null,
                `  justify-content: ${flex.justifyContent};`,
                `  align-items: ${flex.alignItems};`,
                flex.wrap !== "nowrap" ? `  flex-wrap: ${flex.wrap};` : null,
                flex.colGap === flex.rowGap
                    ? `  gap: ${flex.colGap}px;`
                    : `  column-gap: ${flex.colGap}px;\n  row-gap: ${flex.rowGap}px;`,
                (flex.pt === flex.pr && flex.pr === flex.pb && flex.pb === flex.pl)
                    ? `  padding: ${flex.pt}px;`
                    : `  padding: ${flex.pt}px ${flex.pr}px ${flex.pb}px ${flex.pl}px;`,
                `}`,
            ];
            return lines.filter(Boolean).join("\n");
        }
        const lines = [
            `.container {`,
            `  display: grid;`,
            `  grid-template-columns: repeat(${grid.cols}, minmax(0, 1fr));`,
            `  grid-auto-rows: ${grid.autoRows}px;`,
            grid.colGap === grid.rowGap
                ? `  gap: ${grid.colGap}px;`
                : `  column-gap: ${grid.colGap}px;\n  row-gap: ${grid.rowGap}px;`,
            grid.justifyItems !== "stretch" ? `  justify-items: ${grid.justifyItems};` : null,
            grid.alignItems !== "stretch" ? `  align-items: ${grid.alignItems};` : null,
            grid.justifyContent !== "start" ? `  justify-content: ${grid.justifyContent};` : null,
            grid.alignContent !== "start" ? `  align-content: ${grid.alignContent};` : null,
            (grid.pt === grid.pr && grid.pr === grid.pb && grid.pb === grid.pl)
                ? `  padding: ${grid.pt}px;`
                : `  padding: ${grid.pt}px ${grid.pr}px ${grid.pb}px ${grid.pl}px;`,
            `}`,
        ];
        return lines.filter(Boolean).join("\n");
    }, [mode, flex, grid]);

    const htmlCode = useMemo(() => {
        const itemsHtml = Array.from({ length: itemCount }, (_, i) => {
            const it = items[i];
            if (!it) return `  <div class="item">Item ${i + 1}</div>`;
            const hasCustom = mode === "flex"
                ? it.grow !== 0 || it.shrink !== 1 || it.basis !== "auto" || it.alignSelf !== "auto" || it.order !== 0
                : it.colSpan !== 1 || it.rowSpan !== 1;
            if (!hasCustom) return `  <div class="item">Item ${i + 1}</div>`;
            const styleFrags: string[] = [];
            if (mode === "flex") {
                if (it.grow !== 0 || it.shrink !== 1 || it.basis !== "auto")
                    styleFrags.push(`flex: ${it.grow} ${it.shrink} ${it.basis}`);
                if (it.alignSelf !== "auto") styleFrags.push(`align-self: ${it.alignSelf}`);
                if (it.order !== 0) styleFrags.push(`order: ${it.order}`);
            } else {
                if (it.colSpan > 1) styleFrags.push(`grid-column: span ${it.colSpan}`);
                if (it.rowSpan > 1) styleFrags.push(`grid-row: span ${it.rowSpan}`);
            }
            return `  <div class="item" style="${styleFrags.join("; ")}">Item ${i + 1}</div>`;
        });
        return `<div class="container">\n${itemsHtml.join("\n")}\n</div>`;
    }, [mode, items, itemCount]);

    const tailwindCode = useMemo(() => {
        if (mode === "flex") {
            const gapClass = flex.colGap === flex.rowGap ? `gap-[${flex.colGap}px]` : `gap-x-[${flex.colGap}px] gap-y-[${flex.rowGap}px]`;
            const padClass = flex.pt === flex.pr && flex.pr === flex.pb && flex.pb === flex.pl
                ? `p-[${flex.pt}px]`
                : `pt-[${flex.pt}px] pr-[${flex.pr}px] pb-[${flex.pb}px] pl-[${flex.pl}px]`;
            const classes = [
                "flex", FD_TW[flex.direction] !== "flex-row" ? FD_TW[flex.direction] : null,
                JC_TW[flex.justifyContent], AI_TW[flex.alignItems],
                flex.wrap !== "nowrap" ? FW_TW[flex.wrap] : null,
                gapClass, padClass,
            ].filter(Boolean);
            return `<div class="${classes.join(" ")}">\n  <div class="item">Item 1</div>\n  <!-- ... -->\n</div>`;
        }
        const gapClass = grid.colGap === grid.rowGap ? `gap-[${grid.colGap}px]` : `gap-x-[${grid.colGap}px] gap-y-[${grid.rowGap}px]`;
        const padClass = grid.pt === grid.pr && grid.pr === grid.pb && grid.pb === grid.pl
            ? `p-[${grid.pt}px]`
            : `pt-[${grid.pt}px] pr-[${grid.pr}px] pb-[${grid.pb}px] pl-[${grid.pl}px]`;
        const classes = [
            "grid", `grid-cols-${grid.cols}`, gapClass, padClass,
            grid.justifyItems !== "stretch" ? JI_TW[grid.justifyItems] : null,
            grid.alignContent !== "start" ? AC_TW[grid.alignContent] : null,
        ].filter(Boolean);
        return `<div class="${classes.join(" ")}">\n  <div>Item 1</div>\n  <!-- ... -->\n</div>`;
    }, [mode, flex, grid]);

    const activeCode = codeTab === "css" ? cssCode : codeTab === "html" ? htmlCode : tailwindCode;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(activeCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        toast("코드가 복사되었습니다!", "success");
    };

    const reset = () => {
        if (mode === "flex") setFlex({ ...DEFAULT_FLEX });
        else setGrid({ ...DEFAULT_GRID });
        setSelectedId(null);
        setItems(Array.from({ length: 8 }, (_, i) => ({ ...DEFAULT_ITEM, id: i })));
        toast("초기화되었습니다", "success");
    };

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Flexbox·Grid 시각 에디터"
                description="Figma 스타일 패널에서 레이아웃 속성을 조정하고 실시간으로 미리보세요. CSS · HTML · Tailwind 코드를 즉시 복사할 수 있습니다."
            />

            {/* ── 3-Column Layout ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_288px] gap-4 items-start">

                {/* ══ Left: Properties Panel ══════════════════════════════════════ */}
                <aside className="xl:sticky xl:top-24 space-y-1.5">

                    {/* Mode Toggle */}
                    <div className="glass-card rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">모드</span>
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg gap-0.5">
                            {(["flex", "grid"] as Mode[]).map(m => (
                                <button key={m} onClick={() => setMode(m)}
                                    className={cn("px-3.5 py-1 rounded-md text-xs font-bold transition-all",
                                        mode === m
                                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                    )}>
                                    {m === "flex" ? "Flexbox" : "Grid"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Alignment Section ─────────────────────────────────────── */}
                    <PanelSection title="정렬">
                        {mode === "flex" ? (
                            <FlexAlignPanel flex={flex} updateFlex={updateFlex} />
                        ) : (
                            <GridAlignPanel grid={grid} updateGrid={updateGrid} />
                        )}
                    </PanelSection>

                    {/* ── Layout Section ────────────────────────────────────────── */}
                    <PanelSection title="레이아웃">
                        {mode === "flex" ? (
                            <FlexLayoutPanel flex={flex} updateFlex={updateFlex} />
                        ) : (
                            <GridLayoutPanel grid={grid} updateGrid={updateGrid} />
                        )}
                    </PanelSection>

                    {/* ── Selected Item Section ─────────────────────────────────── */}
                    {selectedItem && (
                        <PanelSection title={`아이템 ${selectedItem.id + 1} 속성`}>
                            <ItemPanel
                                mode={mode}
                                item={selectedItem}
                                onUpdate={(k, v) => updateItem(selectedItem.id, k, v)}
                            />
                        </PanelSection>
                    )}

                    {/* Reset */}
                    <button onClick={reset}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
                        <RefreshCw className="w-3 h-3" /> 초기화
                    </button>
                </aside>

                {/* ══ Center: Preview Canvas ══════════════════════════════════════ */}
                <div className="space-y-3">
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Canvas Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">미리보기</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">아이템 수</span>
                                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-1 py-0.5">
                                    <button onClick={() => setItemCount(c => Math.max(1, c - 1))}
                                        className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors rounded">
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 min-w-[18px] text-center">{itemCount}</span>
                                    <button onClick={() => setItemCount(c => Math.min(items.length, c + 1))}
                                        className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors rounded">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="p-4 min-h-[380px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRvdHMgLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMDYpIi8+PC9zdmc+')] dark:bg-zinc-950/50">
                            <div
                                className="min-h-[320px] rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 overflow-auto"
                                style={containerStyle as React.CSSProperties}
                            >
                                {Array.from({ length: itemCount }, (_, i) => {
                                    const it = items[i] ?? items[0];
                                    const pal = ITEM_PALETTE[i % ITEM_PALETTE.length];
                                    const isSelected = selectedId === it.id;
                                    const itemStyle: React.CSSProperties = mode === "flex"
                                        ? {
                                            flexGrow: it.grow, flexShrink: it.shrink,
                                            flexBasis: it.basis, order: it.order,
                                            alignSelf: it.alignSelf === "auto" ? undefined : it.alignSelf,
                                        }
                                        : {
                                            gridColumn: it.colSpan > 1 ? `span ${it.colSpan}` : undefined,
                                            gridRow: it.rowSpan > 1 ? `span ${it.rowSpan}` : undefined,
                                        };
                                    return (
                                        <div
                                            key={it.id}
                                            onClick={() => setSelectedId(isSelected ? null : it.id)}
                                            className={cn(
                                                "rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all select-none min-h-[60px] min-w-[60px]",
                                                pal.bg, pal.border, pal.text,
                                                isSelected && `ring-2 ring-offset-2 dark:ring-offset-zinc-900 ${pal.ring}`,
                                                "hover:brightness-110 active:scale-95"
                                            )}
                                            style={itemStyle}
                                        >
                                            <span className="text-[11px] font-bold">{i + 1}</span>
                                            {isSelected && <span className="text-[9px] opacity-60 mt-0.5">선택됨</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Property badge strip */}
                    <div className="flex flex-wrap gap-1.5 px-1">
                        {mode === "flex" ? (
                            <>
                                <PropBadge label="direction" value={flex.direction} />
                                <PropBadge label="justify" value={flex.justifyContent} />
                                <PropBadge label="align" value={flex.alignItems} />
                                <PropBadge label="wrap" value={flex.wrap} />
                                <PropBadge label="gap" value={`${flex.colGap}×${flex.rowGap}px`} />
                            </>
                        ) : (
                            <>
                                <PropBadge label="cols" value={`repeat(${grid.cols}, 1fr)`} />
                                <PropBadge label="gap" value={`${grid.colGap}×${grid.rowGap}px`} />
                                <PropBadge label="justify-items" value={grid.justifyItems} />
                                <PropBadge label="align-items" value={grid.alignItems} />
                            </>
                        )}
                    </div>
                </div>

                {/* ══ Right: Code Output ════════════════════════════════════════ */}
                <div className="xl:sticky xl:top-24 glass-card rounded-2xl overflow-hidden">
                    {/* Code header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex gap-0.5 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                            {(["css", "html", "tailwind"] as const).map(t => (
                                <button key={t} onClick={() => setCodeTab(t)}
                                    className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold transition-all",
                                        codeTab === t
                                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                    )}>
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleCopy}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                                copied
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                            )}>
                            {copied ? <><Check className="w-3 h-3" /> 복사됨</> : <><Copy className="w-3 h-3" /> 복사</>}
                        </button>
                    </div>

                    <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto bg-zinc-950 dark:bg-zinc-900/90 text-emerald-300 max-h-[520px] min-h-[200px]">
                        <code>{activeCode}</code>
                    </pre>

                    {/* Code tip */}
                    <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/60">
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                            {codeTab === "css" && "클래스명 .container를 원하는 이름으로 변경하세요."}
                            {codeTab === "html" && "아이템을 클릭해 개별 스타일을 확인하세요."}
                            {codeTab === "tailwind" && "Tailwind v3+ 기준. 임의값(arbitrary value)은 JIT 모드가 필요합니다."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Panel Sections ────────────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="glass-card rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", open ? "rotate-0" : "-rotate-90")} />
            </button>
            {open && <div className="px-3 pb-3 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">{children}</div>}
        </div>
    );
}

// ─── Flex Alignment Panel ──────────────────────────────────────────────────────

const JC_AXIS_OPTIONS: { v: JCValue; ic: React.ReactNode; label: string }[] = [
    { v: "flex-start", ic: <IcJStart />,   label: "flex-start" },
    { v: "center",     ic: <IcJCenter />,  label: "center" },
    { v: "flex-end",   ic: <IcJEnd />,     label: "flex-end" },
    { v: "space-between", ic: <IcJBetween />, label: "space-between" },
    { v: "space-around",  ic: <IcJAround />,  label: "space-around" },
    { v: "space-evenly",  ic: <IcJEvenly />,  label: "space-evenly" },
];

const AI_OPTIONS: { v: AIValue; ic: React.ReactNode; label: string }[] = [
    { v: "stretch",    ic: <IcAStretch />,  label: "stretch" },
    { v: "flex-start", ic: <IcAStart />,    label: "flex-start" },
    { v: "center",     ic: <IcACenter />,   label: "center" },
    { v: "flex-end",   ic: <IcAEnd />,      label: "flex-end" },
    { v: "baseline",   ic: <IcABaseline />, label: "baseline" },
];

function FlexAlignPanel({ flex, updateFlex }: { flex: FlexCfg; updateFlex: (k: keyof FlexCfg, v: FlexCfg[keyof FlexCfg]) => void }) {
    return (
        <div className="space-y-2.5">
            <PropRow label="justify-content">
                <IconGroup>
                    {JC_AXIS_OPTIONS.map(o => (
                        <IconBtn key={o.v} active={flex.justifyContent === o.v} title={o.label}
                            onClick={() => updateFlex("justifyContent", o.v)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <PropRow label="align-items">
                <IconGroup>
                    {AI_OPTIONS.map(o => (
                        <IconBtn key={o.v} active={flex.alignItems === o.v} title={o.label}
                            onClick={() => updateFlex("alignItems", o.v)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
        </div>
    );
}

// ─── Grid Alignment Panel ──────────────────────────────────────────────────────

const GRID_JI_OPTIONS: { v: GridCfg["justifyItems"]; ic: React.ReactNode; label: string }[] = [
    { v: "stretch", ic: <IcAStretch />, label: "stretch" },
    { v: "start",   ic: <IcGJStart />,  label: "start" },
    { v: "center",  ic: <IcGJCenter />, label: "center" },
    { v: "end",     ic: <IcGJEnd />,    label: "end" },
];
const GRID_AI_OPTIONS: { v: GridCfg["alignItems"]; ic: React.ReactNode; label: string }[] = [
    { v: "stretch", ic: <IcAStretch />, label: "stretch" },
    { v: "start",   ic: <IcGAStart />,  label: "start" },
    { v: "center",  ic: <IcGACenter />, label: "center" },
    { v: "end",     ic: <IcGAEnd />,    label: "end" },
];
const GRID_JC_OPTIONS: { v: GridCfg["justifyContent"]; ic: React.ReactNode; label: string }[] = [
    { v: "start",         ic: <IcJStart />,   label: "start" },
    { v: "center",        ic: <IcJCenter />,  label: "center" },
    { v: "end",           ic: <IcJEnd />,     label: "end" },
    { v: "space-between", ic: <IcJBetween />, label: "space-between" },
    { v: "space-around",  ic: <IcJAround />,  label: "space-around" },
    { v: "space-evenly",  ic: <IcJEvenly />,  label: "space-evenly" },
];
const GRID_AC_OPTIONS: { v: GridCfg["alignContent"]; ic: React.ReactNode; label: string }[] = [
    { v: "start",         ic: <IcAStart />,   label: "start" },
    { v: "center",        ic: <IcACenter />,  label: "center" },
    { v: "end",           ic: <IcAEnd />,     label: "end" },
    { v: "space-between", ic: <IcJBetween />, label: "space-between" },
    { v: "space-around",  ic: <IcJAround />,  label: "space-around" },
    { v: "space-evenly",  ic: <IcJEvenly />,  label: "space-evenly" },
];

function GridAlignPanel({ grid, updateGrid }: { grid: GridCfg; updateGrid: (k: keyof GridCfg, v: GridCfg[keyof GridCfg]) => void }) {
    return (
        <div className="space-y-2.5">
            <PropRow label="justify-items">
                <IconGroup>
                    {GRID_JI_OPTIONS.map(o => (
                        <IconBtn key={o.v} active={grid.justifyItems === o.v} title={o.label}
                            onClick={() => updateGrid("justifyItems", o.v)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <PropRow label="align-items">
                <IconGroup>
                    {GRID_AI_OPTIONS.map(o => (
                        <IconBtn key={o.v} active={grid.alignItems === o.v} title={o.label}
                            onClick={() => updateGrid("alignItems", o.v)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <PropRow label="justify-content">
                <IconGroup>
                    {GRID_JC_OPTIONS.map(o => (
                        <IconBtn key={o.v} active={grid.justifyContent === o.v} title={o.label}
                            onClick={() => updateGrid("justifyContent", o.v)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <PropRow label="align-content">
                <IconGroup>
                    {GRID_AC_OPTIONS.map(o => (
                        <IconBtn key={o.v} active={grid.alignContent === o.v} title={o.label}
                            onClick={() => updateGrid("alignContent", o.v)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
        </div>
    );
}

// ─── Flex Layout Panel ─────────────────────────────────────────────────────────

const DIR_OPTIONS: { v: FlexDir; ic: React.ReactNode; label: string }[] = [
    { v: "row",            ic: <IcRow />,    label: "row" },
    { v: "row-reverse",    ic: <IcRowRev />, label: "row-reverse" },
    { v: "column",         ic: <IcCol />,    label: "column" },
    { v: "column-reverse", ic: <IcColRev />, label: "column-reverse" },
];
const WRAP_OPTIONS: { v: FWValue; ic: React.ReactNode; label: string }[] = [
    { v: "nowrap",       ic: <IcNowrap />,  label: "nowrap" },
    { v: "wrap",         ic: <IcWrap />,    label: "wrap" },
    { v: "wrap-reverse", ic: <IcWrapRev />, label: "wrap-reverse" },
];

function FlexLayoutPanel({ flex, updateFlex }: { flex: FlexCfg; updateFlex: (k: keyof FlexCfg, v: FlexCfg[keyof FlexCfg]) => void }) {
    return (
        <div className="space-y-2.5">
            <PropRow label="flex-direction">
                <IconGroup>
                    {DIR_OPTIONS.map(o => (
                        <IconBtn key={o.v} active={flex.direction === o.v} title={o.label}
                            onClick={() => updateFlex("direction", o.v)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <PropRow label="flex-wrap">
                <IconGroup>
                    {WRAP_OPTIONS.map(o => (
                        <IconBtn key={o.v} active={flex.wrap === o.v} title={o.label}
                            onClick={() => updateFlex("wrap", o.v)}>{o.ic}</IconBtn>
                    ))}
                </IconGroup>
            </PropRow>
            <div className="grid grid-cols-2 gap-2">
                <NumInput label="col-gap" unit="px" value={flex.colGap} min={0} max={80}
                    onChange={v => updateFlex("colGap", v)} />
                <NumInput label="row-gap" unit="px" value={flex.rowGap} min={0} max={80}
                    onChange={v => updateFlex("rowGap", v)} />
            </div>
            <PaddingInputs
                pt={flex.pt} pr={flex.pr} pb={flex.pb} pl={flex.pl}
                onChange={(k, v) => updateFlex(k as keyof FlexCfg, v)}
            />
        </div>
    );
}

// ─── Grid Layout Panel ─────────────────────────────────────────────────────────

function GridLayoutPanel({ grid, updateGrid }: { grid: GridCfg; updateGrid: (k: keyof GridCfg, v: GridCfg[keyof GridCfg]) => void }) {
    return (
        <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
                <NumInput label="columns" unit="col" value={grid.cols} min={1} max={12}
                    onChange={v => updateGrid("cols", v)} />
                <NumInput label="auto-rows" unit="px" value={grid.autoRows} min={32} max={300}
                    onChange={v => updateGrid("autoRows", v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <NumInput label="col-gap" unit="px" value={grid.colGap} min={0} max={80}
                    onChange={v => updateGrid("colGap", v)} />
                <NumInput label="row-gap" unit="px" value={grid.rowGap} min={0} max={80}
                    onChange={v => updateGrid("rowGap", v)} />
            </div>
            <PaddingInputs
                pt={grid.pt} pr={grid.pr} pb={grid.pb} pl={grid.pl}
                onChange={(k, v) => updateGrid(k as keyof GridCfg, v)}
            />
        </div>
    );
}

// ─── Item Panel ────────────────────────────────────────────────────────────────

const ALIGN_SELF_OPTIONS = [
    { v: "auto" as const, label: "auto" }, { v: "flex-start" as const, label: "start" },
    { v: "center" as const, label: "center" }, { v: "flex-end" as const, label: "end" },
    { v: "stretch" as const, label: "stretch" },
];

function ItemPanel({ mode, item, onUpdate }: { mode: Mode; item: ItemProp; onUpdate: (k: keyof ItemProp, v: ItemProp[keyof ItemProp]) => void }) {
    if (mode === "flex") return (
        <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
                <NumInput label="grow" value={item.grow} min={0} max={10} onChange={v => onUpdate("grow", v)} />
                <NumInput label="shrink" value={item.shrink} min={0} max={10} onChange={v => onUpdate("shrink", v)} />
                <NumInput label="order" value={item.order} min={-5} max={10} onChange={v => onUpdate("order", v)} />
            </div>
            <PropRow label="align-self">
                <div className="flex flex-wrap gap-1">
                    {ALIGN_SELF_OPTIONS.map(o => (
                        <button key={o.v} onClick={() => onUpdate("alignSelf", o.v)}
                            className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all",
                                item.alignSelf === o.v
                                    ? "bg-indigo-100 dark:bg-indigo-500/20 border-indigo-400 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300"
                                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600"
                            )}>
                            {o.label}
                        </button>
                    ))}
                </div>
            </PropRow>
            <PropRow label="flex-basis">
                <div className="flex gap-1 flex-wrap">
                    {["auto", "0", "100%", "200px", "50%"].map(b => (
                        <button key={b} onClick={() => onUpdate("basis", b)}
                            className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all",
                                item.basis === b
                                    ? "bg-indigo-100 dark:bg-indigo-500/20 border-indigo-400 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300"
                                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600"
                            )}>
                            {b}
                        </button>
                    ))}
                </div>
            </PropRow>
        </div>
    );

    return (
        <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
                <NumInput label="col-span" value={item.colSpan} min={1} max={6} onChange={v => onUpdate("colSpan", v)} />
                <NumInput label="row-span" value={item.rowSpan} min={1} max={6} onChange={v => onUpdate("rowSpan", v)} />
            </div>
        </div>
    );
}

// ─── Padding Inputs ────────────────────────────────────────────────────────────

function PaddingInputs({ pt, pr, pb, pl, onChange }: {
    pt: number; pr: number; pb: number; pl: number;
    onChange: (key: "pt" | "pr" | "pb" | "pl", value: number) => void;
}) {
    return (
        <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">padding</span>
            <div className="relative flex items-center justify-center">
                {/* Outer box */}
                <div className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 relative">
                    {/* Top */}
                    <div className="flex justify-center mb-1">
                        <NumInput label="" unit="px" value={pt} min={0} max={120} onChange={v => onChange("pt", v)} compact />
                    </div>
                    {/* Middle row */}
                    <div className="flex items-center gap-1">
                        <NumInput label="" unit="px" value={pl} min={0} max={120} onChange={v => onChange("pl", v)} compact />
                        {/* Inner box */}
                        <div className="flex-1 min-h-[28px] rounded border border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center">
                            <span className="text-[9px] text-zinc-300 dark:text-zinc-600 font-mono">내용</span>
                        </div>
                        <NumInput label="" unit="px" value={pr} min={0} max={120} onChange={v => onChange("pr", v)} compact />
                    </div>
                    {/* Bottom */}
                    <div className="flex justify-center mt-1">
                        <NumInput label="" unit="px" value={pb} min={0} max={120} onChange={v => onChange("pb", v)} compact />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Primitive Components ──────────────────────────────────────────────────────

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            {label && <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</span>}
            {children}
        </div>
    );
}

function IconGroup({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function IconBtn({ children, active, onClick, title }: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
    title?: string;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                "relative group w-12 h-12 rounded-lg border flex items-center justify-center transition-all",
                active
                    ? "bg-indigo-100 dark:bg-indigo-500/20 border-indigo-400 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
        >
            {children}
            {title && (
                <span className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900/95 text-white text-[10px] px-2 py-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {title}
                </span>
            )}
        </button>
    );
}

function NumInput({ label, unit, value, min, max, onChange, compact }: {
    label: string; unit?: string; value: number; min: number; max: number;
    onChange: (v: number) => void; compact?: boolean;
}) {
    const clamp = (v: number) => Math.max(min, Math.min(max, v));
    return (
        <div className={cn("flex flex-col gap-0.5", compact && "items-center")}>
            {label && <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</span>}
            <div className={cn(
                "flex items-center border rounded-md overflow-hidden bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
                compact ? "h-6" : "h-7"
            )}>
                <button
                    onClick={() => onChange(clamp(value - 1))}
                    className="px-1.5 h-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                    <Minus className="w-2.5 h-2.5" />
                </button>
                <input
                    type="number" min={min} max={max} value={value}
                    onChange={e => onChange(clamp(Number(e.target.value)))}
                    className={cn(
                        "text-center font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-transparent outline-none border-none",
                        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        compact ? "w-8 text-[10px]" : "w-10 text-[11px]"
                    )}
                />
                <button
                    onClick={() => onChange(clamp(value + 1))}
                    className="px-1.5 h-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                    <Plus className="w-2.5 h-2.5" />
                </button>
                {unit && !compact && (
                    <span className="pr-1.5 text-[9px] font-mono text-zinc-400 dark:text-zinc-500">{unit}</span>
                )}
            </div>
        </div>
    );
}

function PropBadge({ label, value }: { label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-0.5">
            <span className="text-zinc-400 dark:text-zinc-500">{label}:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{value}</span>
        </span>
    );
}
