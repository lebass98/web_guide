"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";
import {
    Plus, Trash2, Copy, Check, ChevronDown, ChevronUp,
    ArrowLeft, ArrowRight,
    Merge, Scissors, Download, Upload, RotateCcw,
    Bold, AlignLeft, AlignCenter, AlignRight, Palette,
    Code2, LayoutGrid, RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CellData {
    content: string;
    colspan: number;
    rowspan: number;
    isHeader: boolean;
    align: "left" | "center" | "right";
    bold: boolean;
    bgColor: string;
    textColor: string;
    hidden: boolean;
}

type TableStyle = "minimal" | "striped" | "bordered" | "modern" | "dark";
type Mode = "visual" | "source";

function defaultCell(isHeader = false): CellData {
    return { content: "", colspan: 1, rowspan: 1, isHeader, align: "left", bold: isHeader, bgColor: "", textColor: "", hidden: false };
}

// ─── Style Presets ────────────────────────────────────────────────────────────

const STYLE_PRESETS: Record<TableStyle, { label: string; css: string }> = {
    minimal: {
        label: "Minimal",
        css: `table { border-collapse: collapse; width: 100%; font-family: inherit; }
th, td { padding: 10px 16px; text-align: left; border-bottom: 1px solid #e5e7eb; }
th { font-weight: 600; color: #374151; }
tr:hover td { background: #f9fafb; }`,
    },
    striped: {
        label: "Striped",
        css: `table { border-collapse: collapse; width: 100%; font-family: inherit; }
th, td { padding: 10px 16px; text-align: left; }
th { background: #4f46e5; color: white; font-weight: 600; }
tbody tr:nth-child(even) td { background: #f5f3ff; }
tbody tr:hover td { background: #ede9fe; }`,
    },
    bordered: {
        label: "Bordered",
        css: `table { border-collapse: collapse; width: 100%; font-family: inherit; }
th, td { padding: 10px 16px; text-align: left; border: 1px solid #d1d5db; }
th { background: #f3f4f6; font-weight: 600; }
tr:hover td { background: #f9fafb; }`,
    },
    modern: {
        label: "Modern",
        css: `table { border-collapse: separate; border-spacing: 0; width: 100%; font-family: inherit; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
th, td { padding: 12px 18px; text-align: left; }
th { background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-weight: 600; }
tbody tr:nth-child(even) td { background: #fafaff; }
tbody tr:hover td { background: #f0eeff; }
td { border-bottom: 1px solid #f0f0f5; }`,
    },
    dark: {
        label: "Dark",
        css: `table { border-collapse: collapse; width: 100%; font-family: inherit; background: #1e1e2e; border-radius: 8px; overflow: hidden; }
th, td { padding: 10px 16px; text-align: left; color: #cdd6f4; }
th { background: #313244; font-weight: 600; color: #cba6f7; border-bottom: 1px solid #45475a; }
td { border-bottom: 1px solid #313244; }
tbody tr:hover td { background: #2a2a3e; }`,
    },
};

// ─── HTML Generator ───────────────────────────────────────────────────────────

function generateHTML(rows: CellData[][], hasHeader: boolean, tableStyle: TableStyle): string {
    const css = STYLE_PRESETS[tableStyle].css;
    const tableRows = rows.map((row) => {
        const cells = row.map((cell) => {
            if (cell.hidden) return "";
            const tag = cell.isHeader ? "th" : "td";
            const attrs: string[] = [];
            if (cell.colspan > 1) attrs.push(`colspan="${cell.colspan}"`);
            if (cell.rowspan > 1) attrs.push(`rowspan="${cell.rowspan}"`);
            const styles: string[] = [];
            if (cell.align !== "left") styles.push(`text-align:${cell.align}`);
            if (cell.bold) styles.push("font-weight:bold");
            if (cell.bgColor) styles.push(`background:${cell.bgColor}`);
            if (cell.textColor) styles.push(`color:${cell.textColor}`);
            if (styles.length) attrs.push(`style="${styles.join(";")}"`);
            const attrStr = attrs.length ? " " + attrs.join(" ") : "";
            return `    <${tag}${attrStr}>${cell.content}</${tag}>`;
        }).filter(Boolean).join("\n");
        return `  <tr>\n${cells}\n  </tr>`;
    });

    let body: string;
    if (hasHeader && tableRows.length > 0) {
        body = `  <thead>\n${tableRows[0]}\n  </thead>\n  <tbody>\n${tableRows.slice(1).join("\n")}\n  </tbody>`;
    } else {
        body = `  <tbody>\n${tableRows.join("\n")}\n  </tbody>`;
    }

    return `<style>\n${css}\n</style>\n\n<table>\n${body}\n</table>`;
}

function buildSrcdoc(html: string): string {
    // Base styles are declared first — user's <style> blocks inside the body come later
    // in the cascade and will override these automatically.
    const baseStyle = `
*{box-sizing:border-box}
body{margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.5;color:#1e293b}
table{border-collapse:collapse;width:100%}
th,td{padding:8px 12px;border:1px solid #d1d5db;font-size:13px;text-align:left}
th{background:#f3f4f6;font-weight:600;color:#374151}
tbody tr:nth-child(even) td{background:#f9fafb}
tbody tr:hover td{background:#f0f4ff}
`.trim();
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyle}</style></head><body>${html}</body></html>`;
}

// ─── HTML Parser (source → visual) ───────────────────────────────────────────

function parseHTMLToRows(html: string): { rows: CellData[][], hasHeader: boolean } | null {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const table = doc.querySelector("table");
        if (!table) return null;

        const hasHeader = !!table.querySelector("thead tr");
        const trs = Array.from(table.querySelectorAll("tr"));
        if (trs.length === 0) return null;

        const numRows = trs.length;
        const occupied: boolean[][] = Array.from({ length: numRows + 20 }, () => new Array(200).fill(false));
        const grid: (CellData | undefined)[][] = Array.from({ length: numRows }, () => []);

        trs.forEach((tr, ri) => {
            const cells = Array.from(tr.querySelectorAll("th, td")) as HTMLElement[];
            let ci = 0;
            cells.forEach(cell => {
                while (occupied[ri]?.[ci]) ci++;

                const colspan = Math.max(1, parseInt(cell.getAttribute("colspan") || "1", 10));
                const rowspan = Math.max(1, parseInt(cell.getAttribute("rowspan") || "1", 10));
                const isHeader = cell.tagName.toLowerCase() === "th";

                const styleMap: Record<string, string> = {};
                (cell.getAttribute("style") || "").split(";").forEach(decl => {
                    const idx = decl.indexOf(":");
                    if (idx === -1) return;
                    const prop = decl.slice(0, idx).trim().toLowerCase();
                    const val = decl.slice(idx + 1).trim();
                    if (prop && val) styleMap[prop] = val;
                });

                const rawAlign = styleMap["text-align"] || "";
                const align = (["left", "center", "right"].includes(rawAlign)
                    ? rawAlign : "left") as "left" | "center" | "right";
                const bold = styleMap["font-weight"] === "bold" || styleMap["font-weight"] === "700";
                const bgColor = styleMap["background"] || styleMap["background-color"] || "";
                const textColor = styleMap["color"] || "";

                grid[ri][ci] = {
                    content: cell.textContent?.trim() || "",
                    colspan, rowspan, isHeader, align, bold, bgColor, textColor, hidden: false,
                };

                for (let dr = 0; dr < rowspan; dr++) {
                    for (let dc = 0; dc < colspan; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        if (ri + dr < numRows) {
                            occupied[ri + dr][ci + dc] = true;
                            grid[ri + dr][ci + dc] = { ...defaultCell(), hidden: true };
                        }
                    }
                }

                ci += colspan;
            });
        });

        const maxCols = grid.reduce((max, row) => Math.max(max, row.length), 1);
        const rows: CellData[][] = grid.map(row =>
            Array.from({ length: maxCols }, (_, c) => row[c] ?? defaultCell())
        );

        return { rows, hasHeader };
    } catch {
        return null;
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HtmlTableEditorPage() {
    const { toast: showToast } = useToast();

    // ── Visual editor state ───────────────────────────────────────────────────
    const [rows, setRows] = useState<CellData[][]>(() => ([
        [defaultCell(true), defaultCell(true), defaultCell(true), defaultCell(true)],
        [defaultCell(), defaultCell(), defaultCell(), defaultCell()],
        [defaultCell(), defaultCell(), defaultCell(), defaultCell()],
        [defaultCell(), defaultCell(), defaultCell(), defaultCell()],
    ]));
    const [hasHeader, setHasHeader] = useState(true);
    const [tableStyle, setTableStyle] = useState<TableStyle>("modern");
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);
    const [selStart, setSelStart] = useState<{ r: number; c: number } | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const editRef = useRef<HTMLInputElement>(null);

    // ── Source editor state ───────────────────────────────────────────────────
    const [mode, setMode] = useState<Mode>("visual");
    const [sourceHTML, setSourceHTML] = useState("");
    const [sourceCopied, setSourceCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const rowCount = rows.length;
    const colCount = rows[0]?.length ?? 0;
    const generatedHTML = generateHTML(rows, hasHeader, tableStyle);

    // ── Mode switch ────────────────────────────────────────────────────────────

    const switchToSource = () => {
        setSourceHTML(generatedHTML);
        setMode("source");
    };

    const switchToVisual = () => setMode("visual");

    const importSourceToVisual = () => {
        const result = parseHTMLToRows(sourceHTML);
        if (!result) {
            showToast("<table> 요소를 찾을 수 없습니다.", "error");
            return;
        }
        setRows(result.rows);
        setHasHeader(result.hasHeader);
        setSelectedCells(new Set());
        setEditingCell(null);
        setMode("visual");
        showToast(`비주얼 편집기로 가져왔습니다. (${result.rows.length}행 × ${result.rows[0].length}열)`, "success");
    };

    // ── iframe sync ───────────────────────────────────────────────────────────

    useEffect(() => {
        if (mode === "source" && iframeRef.current) {
            iframeRef.current.srcdoc = buildSrcdoc(sourceHTML);
        }
    }, [sourceHTML, mode]);

    // ── Selection helpers ──────────────────────────────────────────────────────

    const cellKey = (r: number, c: number) => `${r},${c}`;

    const selectRange = useCallback((a: { r: number; c: number }, b: { r: number; c: number }) => {
        const minR = Math.min(a.r, b.r), maxR = Math.max(a.r, b.r);
        const minC = Math.min(a.c, b.c), maxC = Math.max(a.c, b.c);
        const next = new Set<string>();
        for (let r = minR; r <= maxR; r++)
            for (let c = minC; c <= maxC; c++)
                next.add(cellKey(r, c));
        setSelectedCells(next);
    }, []);

    // ── Cell editing ────────────────────────────────────────────────────────────

    const updateCell = useCallback((r: number, c: number, patch: Partial<CellData>) => {
        setRows(prev => {
            const next = prev.map(row => row.map(cell => ({ ...cell })));
            next[r][c] = { ...next[r][c], ...patch };
            return next;
        });
    }, []);

    const handleCellDoubleClick = (r: number, c: number) => {
        if (rows[r][c].hidden) return;
        setEditingCell({ r, c });
        setTimeout(() => editRef.current?.focus(), 0);
    };

    const commitEdit = () => setEditingCell(null);

    // ── Add / Remove ────────────────────────────────────────────────────────────

    const addRow = (after: number) => {
        setRows(prev => {
            const newRow = Array.from({ length: prev[0].length }, () => defaultCell());
            const next = [...prev];
            next.splice(after + 1, 0, newRow);
            return next;
        });
    };

    const addCol = (after: number) => {
        setRows(prev => prev.map((row, ri) => {
            const next = [...row];
            next.splice(after + 1, 0, defaultCell(hasHeader && ri === 0));
            return next;
        }));
    };

    const removeRow = (ri: number) => {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter((_, i) => i !== ri));
        setSelectedCells(new Set());
        setEditingCell(null);
    };

    const removeCol = (ci: number) => {
        if (rows[0].length <= 1) return;
        setRows(prev => prev.map(row => row.filter((_, i) => i !== ci)));
        setSelectedCells(new Set());
        setEditingCell(null);
    };

    // ── Merge / Unmerge ─────────────────────────────────────────────────────────

    const mergeSelected = () => {
        if (selectedCells.size < 2) return;
        const coords = Array.from(selectedCells).map(k => {
            const [r, c] = k.split(",").map(Number);
            return { r, c };
        });
        const minR = Math.min(...coords.map(c => c.r));
        const maxR = Math.max(...coords.map(c => c.r));
        const minC = Math.min(...coords.map(c => c.c));
        const maxC = Math.max(...coords.map(c => c.c));

        for (let r = minR; r <= maxR; r++)
            for (let c = minC; c <= maxC; c++)
                if (!selectedCells.has(cellKey(r, c))) {
                    showToast("직사각형 영역만 병합할 수 있습니다.", "error");
                    return;
                }

        setRows(prev => {
            const next = prev.map(row => row.map(cell => ({ ...cell })));
            next[minR][minC].colspan = maxC - minC + 1;
            next[minR][minC].rowspan = maxR - minR + 1;
            for (let r = minR; r <= maxR; r++)
                for (let c = minC; c <= maxC; c++)
                    if (r !== minR || c !== minC)
                        next[r][c].hidden = true;
            return next;
        });
        setSelectedCells(new Set([cellKey(minR, minC)]));
    };

    const unmergeSelected = () => {
        setRows(prev => {
            const next = prev.map(row => row.map(cell => ({ ...cell })));
            selectedCells.forEach(key => {
                const [r, c] = key.split(",").map(Number);
                if (!next[r]?.[c]) return;
                const cell = next[r][c];
                if (cell.colspan > 1 || cell.rowspan > 1) {
                    const rs = cell.rowspan, cs = cell.colspan;
                    cell.colspan = 1; cell.rowspan = 1;
                    for (let dr = 0; dr < rs; dr++)
                        for (let dc = 0; dc < cs; dc++)
                            if (dr !== 0 || dc !== 0)
                                if (next[r + dr]?.[c + dc])
                                    next[r + dr][c + dc].hidden = false;
                }
            });
            return next;
        });
    };

    // ── CSV Import ───────────────────────────────────────────────────────────────

    const importCSV = () => {
        const input = prompt("CSV 텍스트를 붙여넣으세요 (쉼표 구분, 줄바꿈으로 행 분리):");
        if (!input) return;
        const parsed = input.trim().split("\n").map(line =>
            line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ""))
        );
        const maxCols = Math.max(...parsed.map(r => r.length));
        const newRows: CellData[][] = parsed.map((row, ri) =>
            Array.from({ length: maxCols }, (_, ci) => ({
                ...defaultCell(hasHeader && ri === 0),
                content: row[ci] ?? "",
            }))
        );
        setRows(newRows);
        showToast("CSV를 가져왔습니다.", "success");
    };

    // ── Reset ────────────────────────────────────────────────────────────────────

    const resetTable = () => {
        setRows([
            [defaultCell(true), defaultCell(true), defaultCell(true), defaultCell(true)],
            [defaultCell(), defaultCell(), defaultCell(), defaultCell()],
            [defaultCell(), defaultCell(), defaultCell(), defaultCell()],
            [defaultCell(), defaultCell(), defaultCell(), defaultCell()],
        ]);
        setSelectedCells(new Set());
        setEditingCell(null);
        setHasHeader(true);
    };

    // ── Copy / Download ───────────────────────────────────────────────────────

    const [visualCopied, setVisualCopied] = useState(false);

    const copyHTML = (html: string, visual = false) => {
        navigator.clipboard.writeText(html).then(() => {
            if (visual) { setVisualCopied(true); setTimeout(() => setVisualCopied(false), 2000); }
            else { setSourceCopied(true); setTimeout(() => setSourceCopied(false), 2000); }
            showToast("HTML이 복사되었습니다!", "success");
        });
    };

    const downloadHTML = (html: string) => {
        const full = `<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8">\n<title>Table</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
        const blob = new Blob([full], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "table.html";
        a.click();
        URL.revokeObjectURL(a.href);
    };

    // ── Selected cell properties ──────────────────────────────────────────────

    const selectedList = Array.from(selectedCells).map(k => {
        const [r, c] = k.split(",").map(Number);
        return { r, c, cell: rows[r]?.[c] };
    }).filter(x => x.cell && !x.cell.hidden);

    const singleSel = selectedList.length === 1 ? selectedList[0] : null;

    const applyToSelected = (patch: Partial<CellData>) => {
        setRows(prev => {
            const next = prev.map(row => row.map(cell => ({ ...cell })));
            selectedList.forEach(({ r, c }) => {
                next[r][c] = { ...next[r][c], ...patch };
            });
            return next;
        });
    };

    // ─────────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <PageHeader
                title="HTML 테이블 에디터"
                description="테이블을 시각적으로 편집하거나 HTML 소스를 직접 입력해 실시간으로 미리보세요."
            />

            {/* ── Mode Tab ── */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-800/60 rounded-xl w-fit">
                <button
                    onClick={switchToVisual}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                        mode === "visual"
                            ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                    )}
                >
                    <LayoutGrid className="w-4 h-4" /> 비주얼 편집
                </button>
                <button
                    onClick={switchToSource}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                        mode === "source"
                            ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                    )}
                >
                    <Code2 className="w-4 h-4" /> 소스 편집
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                VISUAL MODE
            ══════════════════════════════════════════════════════════════════ */}
            {mode === "visual" && (
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
                    {/* ── Left: Editor ── */}
                    <div className="space-y-4">
                        {/* Toolbar */}
                        <div className="glass-card p-3 flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setHasHeader(v => !v)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                    hasHeader
                                        ? "bg-emerald-500 text-white"
                                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                                )}
                            >
                                헤더 행
                            </button>

                            <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                            <div className="flex items-center gap-1.5 flex-wrap">
                                {(Object.keys(STYLE_PRESETS) as TableStyle[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setTableStyle(s)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                            tableStyle === s
                                                ? "bg-indigo-500 text-white shadow"
                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                        )}
                                    >
                                        {STYLE_PRESETS[s].label}
                                    </button>
                                ))}
                            </div>

                            <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                            <button
                                onClick={mergeSelected}
                                disabled={selectedCells.size < 2}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <Merge className="w-3.5 h-3.5" /> 병합
                            </button>
                            <button
                                onClick={unmergeSelected}
                                disabled={selectedList.length === 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <Scissors className="w-3.5 h-3.5" /> 병합 해제
                            </button>

                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={importCSV}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                                >
                                    <Upload className="w-3.5 h-3.5" /> CSV
                                </button>
                                <button
                                    onClick={resetTable}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> 초기화
                                </button>
                            </div>
                        </div>

                        {/* Cell Properties */}
                        {selectedList.length > 0 && (
                            <div className="glass-card p-3 flex flex-wrap items-center gap-3">
                                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                                    {selectedList.length}개 셀 선택
                                </span>
                                <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                                <div className="flex items-center gap-1">
                                    {(["left", "center", "right"] as const).map(align => {
                                        const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                                        const isActive = singleSel?.cell.align === align;
                                        return (
                                            <button
                                                key={align}
                                                onClick={() => applyToSelected({ align })}
                                                className={cn(
                                                    "w-7 h-7 rounded flex items-center justify-center transition-all",
                                                    isActive ? "bg-indigo-500 text-white" : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400"
                                                )}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => applyToSelected({ bold: !(singleSel?.cell.bold ?? false) })}
                                    className={cn(
                                        "w-7 h-7 rounded flex items-center justify-center transition-all",
                                        singleSel?.cell.bold ? "bg-indigo-500 text-white" : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400"
                                    )}
                                >
                                    <Bold className="w-3.5 h-3.5" />
                                </button>

                                <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                                <div className="flex items-center gap-1.5">
                                    <Palette className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                                    <span className="text-xs text-gray-500 dark:text-zinc-400">배경</span>
                                    <input
                                        type="color"
                                        value={singleSel?.cell.bgColor || "#ffffff"}
                                        onChange={e => applyToSelected({ bgColor: e.target.value })}
                                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-zinc-700"
                                    />
                                    {singleSel?.cell.bgColor && (
                                        <button onClick={() => applyToSelected({ bgColor: "" })} className="text-xs text-gray-400 hover:text-red-500">×</button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-gray-500 dark:text-zinc-400">글자</span>
                                    <input
                                        type="color"
                                        value={singleSel?.cell.textColor || "#000000"}
                                        onChange={e => applyToSelected({ textColor: e.target.value })}
                                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-zinc-700"
                                    />
                                    {singleSel?.cell.textColor && (
                                        <button onClick={() => applyToSelected({ textColor: "" })} className="text-xs text-gray-400 hover:text-red-500">×</button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Table Editor */}
                        <div className="glass-card p-4 overflow-auto">
                            <div className="relative">
                                <table
                                    className="border-collapse w-full"
                                    onMouseLeave={() => { if (isSelecting) setIsSelecting(false); }}
                                >
                                    <tbody>
                                        {rows.map((row, ri) => (
                                            <tr key={ri}>
                                                <td className="pr-1 w-6">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <button
                                                            onClick={() => addRow(ri - 1)}
                                                            title="위에 행 추가"
                                                            className="w-5 h-5 rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 flex items-center justify-center transition-all"
                                                        >
                                                            <ChevronUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeRow(ri)}
                                                            title="행 삭제"
                                                            disabled={rows.length <= 1}
                                                            className="w-5 h-5 rounded text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-30"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => addRow(ri)}
                                                            title="아래에 행 추가"
                                                            className="w-5 h-5 rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 flex items-center justify-center transition-all"
                                                        >
                                                            <ChevronDown className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>

                                                {row.map((cell, ci) => {
                                                    if (cell.hidden) return null;
                                                    const isSelected = selectedCells.has(cellKey(ri, ci));
                                                    const isEditing = editingCell?.r === ri && editingCell?.c === ci;
                                                    const isHeaderRow = hasHeader && ri === 0;
                                                    const Tag = (cell.isHeader || isHeaderRow) ? "th" : "td";

                                                    return (
                                                        <Tag
                                                            key={ci}
                                                            colSpan={cell.colspan}
                                                            rowSpan={cell.rowspan}
                                                            onMouseDown={() => {
                                                                setIsSelecting(true);
                                                                setSelStart({ r: ri, c: ci });
                                                                setSelectedCells(new Set([cellKey(ri, ci)]));
                                                                setEditingCell(null);
                                                            }}
                                                            onMouseEnter={() => {
                                                                if (isSelecting && selStart)
                                                                    selectRange(selStart, { r: ri, c: ci });
                                                            }}
                                                            onMouseUp={() => setIsSelecting(false)}
                                                            onDoubleClick={() => handleCellDoubleClick(ri, ci)}
                                                            className={cn(
                                                                "relative border min-w-[80px] max-w-[240px] cursor-cell select-none transition-colors",
                                                                isHeaderRow
                                                                    ? "border-gray-300 dark:border-zinc-600 font-semibold bg-gray-50 dark:bg-zinc-800/80"
                                                                    : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
                                                                isSelected && "ring-2 ring-inset ring-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/20",
                                                                isEditing && "ring-2 ring-inset ring-indigo-500"
                                                            )}
                                                            style={{
                                                                backgroundColor: cell.bgColor || undefined,
                                                                color: cell.textColor || undefined,
                                                                textAlign: cell.align,
                                                                fontWeight: cell.bold ? "bold" : undefined,
                                                            }}
                                                        >
                                                            {isEditing ? (
                                                                <input
                                                                    ref={editRef}
                                                                    value={cell.content}
                                                                    onChange={e => updateCell(ri, ci, { content: e.target.value })}
                                                                    onBlur={commitEdit}
                                                                    onKeyDown={e => {
                                                                        if (e.key === "Enter" || e.key === "Escape") commitEdit();
                                                                        if (e.key === "Tab") {
                                                                            e.preventDefault();
                                                                            commitEdit();
                                                                            const nextC = ci + 1 < colCount ? ci + 1 : 0;
                                                                            const nextR = ci + 1 < colCount ? ri : ri + 1 < rowCount ? ri + 1 : 0;
                                                                            setEditingCell({ r: nextR, c: nextC });
                                                                            setTimeout(() => editRef.current?.focus(), 0);
                                                                        }
                                                                    }}
                                                                    className="w-full px-2 py-1.5 text-sm outline-none bg-transparent"
                                                                    style={{ textAlign: cell.align }}
                                                                />
                                                            ) : (
                                                                <span className="block px-2 py-1.5 text-sm min-h-[32px]">
                                                                    {cell.content || (
                                                                        <span className="text-gray-300 dark:text-zinc-600 font-normal italic text-xs">더블클릭 편집</span>
                                                                    )}
                                                                </span>
                                                            )}
                                                        </Tag>
                                                    );
                                                })}

                                                {ri === 0 && (
                                                    <td className="pl-1 w-6" rowSpan={rowCount}>
                                                        <button
                                                            onClick={() => addCol(colCount - 1)}
                                                            title="열 추가"
                                                            className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 flex items-center justify-center transition-all"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}

                                        <tr>
                                            <td />
                                            <td colSpan={colCount} className="pt-1">
                                                <button
                                                    onClick={() => addRow(rowCount - 1)}
                                                    className="w-full h-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 flex items-center justify-center gap-1 text-xs transition-all"
                                                >
                                                    <Plus className="w-3 h-3" /> 행 추가
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Column controls */}
                                <div className="flex mt-1 ml-7 gap-0">
                                    {rows[0]?.map((cell, ci) => {
                                        if (cell.hidden) return null;
                                        return (
                                            <div
                                                key={ci}
                                                className="flex items-center justify-center gap-1 min-w-[80px] max-w-[240px] flex-1"
                                                style={{ width: `${100 / colCount}%` }}
                                            >
                                                <button onClick={() => addCol(ci - 1)} title="왼쪽에 열 추가"
                                                    className="w-5 h-5 rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 flex items-center justify-center transition-all">
                                                    <ArrowLeft className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => removeCol(ci)} disabled={rows[0].filter(c => !c.hidden).length <= 1} title="열 삭제"
                                                    className="w-5 h-5 rounded text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-30">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => addCol(ci)} title="오른쪽에 열 추가"
                                                    className="w-5 h-5 rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 flex items-center justify-center transition-all">
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-4 text-xs text-gray-500 dark:text-zinc-400 space-y-1">
                            <div className="font-semibold text-gray-700 dark:text-zinc-200 mb-2">사용 방법</div>
                            <div>• <strong>더블클릭</strong> — 셀 내용 편집 / Tab으로 다음 셀 이동</div>
                            <div>• <strong>드래그</strong> — 여러 셀 선택 (병합 등 일괄 적용)</div>
                            <div>• <strong>병합</strong> — 직사각형 영역을 선택 후 병합 버튼 클릭</div>
                            <div>• <strong>CSV</strong> — CSV 텍스트를 붙여넣어 테이블 데이터 한 번에 입력</div>
                        </div>
                    </div>

                    {/* ── Right: Preview + HTML ── */}
                    <div className="space-y-4">
                        <div className="glass-card p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-200">미리보기</h3>
                            <div className="overflow-auto rounded-lg bg-white dark:bg-zinc-900 p-4 border border-gray-100 dark:border-zinc-800">
                                <style dangerouslySetInnerHTML={{
                                    __html: STYLE_PRESETS[tableStyle].css
                                        .replace(/table\s*\{/g, ".preview-table {")
                                        .replace(/th,\s*td/g, ".preview-table th, .preview-table td")
                                        .replace(/th\s*\{/g, ".preview-table th {")
                                        .replace(/td\s*\{/g, ".preview-table td {")
                                        .replace(/tbody\s+tr/g, ".preview-table tbody tr")
                                        .replace(/tr:hover\s+td/g, ".preview-table tr:hover td"),
                                }} />
                                <table className="preview-table border-collapse w-full text-sm">
                                    {hasHeader && rows.length > 0 && (
                                        <thead>
                                            <tr>
                                                {rows[0].map((cell, ci) =>
                                                    cell.hidden ? null : (
                                                        <th key={ci} colSpan={cell.colspan} rowSpan={cell.rowspan}
                                                            style={{ textAlign: cell.align, fontWeight: cell.bold ? "bold" : undefined, backgroundColor: cell.bgColor || undefined, color: cell.textColor || undefined }}>
                                                            {cell.content || " "}
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                    )}
                                    <tbody>
                                        {(hasHeader ? rows.slice(1) : rows).map((row, ri) => (
                                            <tr key={ri}>
                                                {row.map((cell, ci) =>
                                                    cell.hidden ? null : (
                                                        <td key={ci} colSpan={cell.colspan} rowSpan={cell.rowspan}
                                                            style={{ textAlign: cell.align, fontWeight: cell.bold ? "bold" : undefined, backgroundColor: cell.bgColor || undefined, color: cell.textColor || undefined }}>
                                                            {cell.content || " "}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="glass-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-200">생성된 HTML</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => downloadHTML(generatedHTML)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" /> 다운로드
                                    </button>
                                    <button
                                        onClick={() => copyHTML(generatedHTML, true)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                            visualCopied ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white hover:bg-indigo-600"
                                        )}
                                    >
                                        {visualCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {visualCopied ? "복사됨" : "복사"}
                                    </button>
                                </div>
                            </div>
                            <pre className="text-xs font-mono bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 overflow-auto max-h-[420px] text-gray-700 dark:text-zinc-300 border border-gray-100 dark:border-zinc-800 leading-relaxed whitespace-pre-wrap break-all">
                                {generatedHTML}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                SOURCE MODE
            ══════════════════════════════════════════════════════════════════ */}
            {mode === "source" && (
                <div className="space-y-3">
                    {/* Source toolbar */}
                    <div className="glass-card p-3 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                            HTML을 직접 입력하면 오른쪽 미리보기에 즉시 반영됩니다.
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                            <button
                                onClick={importSourceToVisual}
                                title="소스를 파싱해서 비주얼 편집기로 가져오기"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" /> 비주얼로 가져오기
                            </button>
                            <button
                                onClick={() => setSourceHTML(generatedHTML)}
                                title="비주얼 편집 내용으로 초기화"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> 비주얼 내용 불러오기
                            </button>
                            <button
                                onClick={() => downloadHTML(sourceHTML)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                            >
                                <Download className="w-3.5 h-3.5" /> 다운로드
                            </button>
                            <button
                                onClick={() => copyHTML(sourceHTML)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                    sourceCopied ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white hover:bg-indigo-600"
                                )}
                            >
                                {sourceCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {sourceCopied ? "복사됨" : "복사"}
                            </button>
                        </div>
                    </div>

                    {/* Split: editor | preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: 540 }}>
                        {/* Left: textarea */}
                        <div className="glass-card flex flex-col overflow-hidden" style={{ minHeight: 540 }}>
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-zinc-700/60">
                                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                                    <Code2 className="w-3.5 h-3.5" /> HTML 소스
                                </span>
                                <span className="text-xs text-gray-400 dark:text-zinc-500">{sourceHTML.length} chars</span>
                            </div>
                            <textarea
                                value={sourceHTML}
                                onChange={e => setSourceHTML(e.target.value)}
                                spellCheck={false}
                                className="flex-1 w-full resize-none bg-gray-950 dark:bg-zinc-950 text-emerald-300 dark:text-emerald-300 font-mono text-xs leading-relaxed p-4 outline-none border-0 focus:ring-0"
                                style={{ minHeight: 500, tabSize: 2 }}
                                onKeyDown={e => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        const el = e.currentTarget;
                                        const start = el.selectionStart;
                                        const end = el.selectionEnd;
                                        const newVal = sourceHTML.substring(0, start) + "  " + sourceHTML.substring(end);
                                        setSourceHTML(newVal);
                                        setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2; }, 0);
                                    }
                                }}
                                placeholder="<table>&#10;  <thead>&#10;    <tr><th>제목1</th><th>제목2</th></tr>&#10;  </thead>&#10;  <tbody>&#10;    <tr><td>내용1</td><td>내용2</td></tr>&#10;  </tbody>&#10;</table>"
                            />
                        </div>

                        {/* Right: iframe preview */}
                        <div className="glass-card flex flex-col overflow-hidden" style={{ minHeight: 540 }}>
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-zinc-700/60">
                                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">미리보기</span>
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-400" />
                                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <span className="w-2 h-2 rounded-full bg-green-400" />
                                </div>
                            </div>
                            <iframe
                                ref={iframeRef}
                                sandbox="allow-scripts"
                                className="flex-1 w-full bg-white"
                                style={{ minHeight: 500, border: "none" }}
                                title="HTML 미리보기"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
