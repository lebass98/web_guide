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
    Code2, LayoutGrid, RefreshCw, ArrowUpDown, Minimize2, Settings2,
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

interface GenOptions {
    caption?: string;
    tableId?: string;
    tableClass?: string;
    minify?: boolean;
}

function generateHTML(rows: CellData[][], hasHeader: boolean, tableStyle: TableStyle, opts: GenOptions = {}): string {
    const { caption = "", tableId = "", tableClass = "", minify = false } = opts;
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
            if (minify) return `<${tag}${attrStr}>${cell.content}</${tag}>`;
            return `    <${tag}${attrStr}>${cell.content}</${tag}>`;
        }).filter(Boolean).join(minify ? "" : "\n");
        if (minify) return `<tr>${cells}</tr>`;
        return `  <tr>\n${cells}\n  </tr>`;
    });

    let body: string;
    if (hasHeader && tableRows.length > 0) {
        body = minify
            ? `<thead>${tableRows[0]}</thead><tbody>${tableRows.slice(1).join("")}</tbody>`
            : `  <thead>\n${tableRows[0]}\n  </thead>\n  <tbody>\n${tableRows.slice(1).join("\n")}\n  </tbody>`;
    } else {
        body = minify
            ? `<tbody>${tableRows.join("")}</tbody>`
            : `  <tbody>\n${tableRows.join("\n")}\n  </tbody>`;
    }

    const tableAttrs: string[] = [];
    if (tableId) tableAttrs.push(`id="${tableId}"`);
    if (tableClass) tableAttrs.push(`class="${tableClass}"`);
    const tableAttrStr = tableAttrs.length ? " " + tableAttrs.join(" ") : "";
    const captionStr = caption
        ? (minify ? `<caption>${caption}</caption>` : `  <caption>${caption}</caption>\n`)
        : "";

    if (minify) {
        const cssMin = css
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\s+/g, " ")
            .replace(/\s*{\s*/g, "{").replace(/\s*}\s*/g, "}")
            .replace(/\s*:\s*/g, ":").replace(/\s*;\s*/g, ";")
            .trim();
        return `<style>${cssMin}</style><table${tableAttrStr}>${captionStr}${body}</table>`;
    }

    return `<style>\n${css}\n</style>\n\n<table${tableAttrStr}>\n${captionStr}${body}\n</table>`;
}

function buildSrcdoc(html: string): string {
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

    // ── Column width state ────────────────────────────────────────────────────
    const [colWidths, setColWidths] = useState<number[]>(() => Array(4).fill(120));
    const resizingRef = useRef<{ col: number; startX: number; startWidth: number } | null>(null);

    // ── Output options state ──────────────────────────────────────────────────
    const [caption, setCaption] = useState("");
    const [tableId, setTableId] = useState("");
    const [tableClass, setTableClass] = useState("");
    const [minifyOutput, setMinifyOutput] = useState(false);

    // ── Source editor state ───────────────────────────────────────────────────
    const [mode, setMode] = useState<Mode>("visual");
    const [sourceHTML, setSourceHTML] = useState("");
    const [sourceCopied, setSourceCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // ── Dimension input state ─────────────────────────────────────────────────
    const rowCount = rows.length;
    const colCount = rows[0]?.length ?? 0;
    const [dimRows, setDimRows] = useState(rowCount);
    const [dimCols, setDimCols] = useState(colCount);
    const [dimPickerOpen, setDimPickerOpen] = useState(false);
    const [hoverDim, setHoverDim] = useState<{ r: number; c: number } | null>(null);
    const dimPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setDimRows(rowCount); }, [rowCount]);
    useEffect(() => { setDimCols(colCount); }, [colCount]);

    useEffect(() => {
        if (!dimPickerOpen) return;
        const handler = (e: MouseEvent) => {
            if (dimPickerRef.current && !dimPickerRef.current.contains(e.target as Node))
                setDimPickerOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [dimPickerOpen]);

    // ── Column resize drag ────────────────────────────────────────────────────
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!resizingRef.current) return;
            const { col, startX, startWidth } = resizingRef.current;
            setColWidths(prev => {
                const next = [...prev];
                next[col] = Math.max(60, startWidth + e.clientX - startX);
                return next;
            });
        };
        const onUp = () => { resizingRef.current = null; };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
    }, []);

    const generatedHTML = generateHTML(rows, hasHeader, tableStyle, {
        caption, tableId, tableClass, minify: minifyOutput,
    });

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
        setColWidths(Array(result.rows[0].length).fill(120));
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
        setColWidths(prev => {
            const next = [...prev];
            next.splice(after + 1, 0, 120);
            return next;
        });
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
        setColWidths(prev => prev.filter((_, i) => i !== ci));
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

    // ── Table Operations ────────────────────────────────────────────────────────

    const transpose = () => {
        const hasMerge = rows.some(row => row.some(c => c.colspan > 1 || c.rowspan > 1));
        if (hasMerge) {
            showToast("병합된 셀이 있으면 전치할 수 없습니다.", "error");
            return;
        }
        const numCols = rows[0]?.length ?? 0;
        if (numCols === 0) return;
        setRows(
            Array.from({ length: numCols }, (_, ci) =>
                Array.from({ length: rows.length }, (_, ri) => ({ ...rows[ri][ci] }))
            )
        );
        // After transpose, new col count = old row count → reset widths
        setColWidths(Array(rows.length).fill(120));
        setSelectedCells(new Set());
        setEditingCell(null);
        showToast("행과 열을 전치했습니다.", "success");
    };

    const deleteBlankRows = () => {
        const filtered = rows.filter(row => row.some(c => !c.hidden && c.content.trim() !== ""));
        if (filtered.length === rows.length) { showToast("빈 행이 없습니다.", "info"); return; }
        if (filtered.length === 0) { showToast("모든 행을 삭제할 수 없습니다.", "error"); return; }
        setRows(filtered);
        setSelectedCells(new Set());
        showToast(`빈 행 ${rows.length - filtered.length}개를 삭제했습니다.`, "success");
    };

    const deleteBlankCols = () => {
        const numCols = rows[0]?.length ?? 0;
        const keepCols = Array.from({ length: numCols }, (_, ci) =>
            rows.some(row => row[ci] && !row[ci].hidden && row[ci].content.trim() !== "")
        );
        const removed = keepCols.filter(k => !k).length;
        if (removed === 0) { showToast("빈 열이 없습니다.", "info"); return; }
        if (keepCols.filter(Boolean).length === 0) { showToast("모든 열을 삭제할 수 없습니다.", "error"); return; }
        setRows(prev => prev.map(row => row.filter((_, ci) => keepCols[ci])));
        setColWidths(prev => prev.filter((_, ci) => keepCols[ci]));
        setSelectedCells(new Set());
        showToast(`빈 열 ${removed}개를 삭제했습니다.`, "success");
    };

    const removeDuplicateRows = () => {
        const seen = new Set<string>();
        const filtered = rows.filter(row => {
            const key = row.map(c => c.content).join("\x00");
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        const removed = rows.length - filtered.length;
        if (removed === 0) { showToast("중복 행이 없습니다.", "info"); return; }
        setRows(filtered);
        setSelectedCells(new Set());
        showToast(`중복 행 ${removed}개를 삭제했습니다.`, "success");
    };

    const applyDimensions = () => {
        const targetR = Math.max(1, Math.min(50, dimRows));
        const targetC = Math.max(1, Math.min(50, dimCols));
        setColWidths(prev => {
            if (targetC > prev.length) return [...prev, ...Array(targetC - prev.length).fill(120)];
            return prev.slice(0, targetC);
        });
        setRows(prev => {
            let result = prev.map(row => [...row]);
            const curCols = result[0]?.length ?? 0;
            if (targetC > curCols) {
                result = result.map((row, ri) => [
                    ...row,
                    ...Array.from({ length: targetC - curCols }, () => defaultCell(hasHeader && ri === 0)),
                ]);
            } else if (targetC < curCols) {
                result = result.map(row => row.slice(0, targetC));
            }
            const curRows = result.length;
            const newCols = result[0]?.length ?? targetC;
            if (targetR > curRows) {
                result = [
                    ...result,
                    ...Array.from({ length: targetR - curRows }, () =>
                        Array.from({ length: newCols }, () => defaultCell())
                    ),
                ];
            } else if (targetR < curRows) {
                result = result.slice(0, targetR);
            }
            return result;
        });
        setSelectedCells(new Set());
        setEditingCell(null);
        showToast(`테이블 크기를 ${targetR}×${targetC}로 변경했습니다.`, "success");
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
        setColWidths(Array(maxCols).fill(120));
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
        setColWidths(Array(4).fill(120));
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

    const applyTextTransform = (t: "upper" | "lower" | "capitalize") => {
        const transform = (s: string) => {
            if (t === "upper") return s.toUpperCase();
            if (t === "lower") return s.toLowerCase();
            return s.replace(/\b\w/g, ch => ch.toUpperCase());
        };
        setRows(prev => {
            const next = prev.map(row => row.map(cell => ({ ...cell })));
            selectedList.forEach(({ r, c }) => {
                next[r][c].content = transform(next[r][c].content);
            });
            return next;
        });
    };

    // ─────────────────────────────────────────────────────────────────────────────

    const inputCls = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all";
    const opBtnCls = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all";

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
                        {/* Toolbar Row 1: Style & Merge */}
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
                                className={cn(opBtnCls, "disabled:opacity-40 disabled:cursor-not-allowed")}
                            >
                                <Merge className="w-3.5 h-3.5" /> 병합
                            </button>
                            <button
                                onClick={unmergeSelected}
                                disabled={selectedList.length === 0}
                                className={cn(opBtnCls, "disabled:opacity-40 disabled:cursor-not-allowed")}
                            >
                                <Scissors className="w-3.5 h-3.5" /> 병합 해제
                            </button>

                            <div className="ml-auto flex items-center gap-2">
                                <button onClick={importCSV} className={opBtnCls}>
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

                        {/* Toolbar Row 2: Table Operations */}
                        <div className="glass-card p-3 flex flex-wrap items-center gap-2">
                            {/* Dimension controls */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">크기</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={dimRows}
                                    onChange={e => setDimRows(parseInt(e.target.value) || 1)}
                                    className="w-12 px-1.5 py-1 text-xs text-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/40"
                                />
                                <span className="text-xs text-gray-400 dark:text-zinc-500">×</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={dimCols}
                                    onChange={e => setDimCols(parseInt(e.target.value) || 1)}
                                    className="w-12 px-1.5 py-1 text-xs text-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/40"
                                />
                                <button
                                    onClick={applyDimensions}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all"
                                >
                                    적용
                                </button>
                            </div>

                            <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                            <button onClick={transpose} className={opBtnCls} title="행과 열 교환">
                                <ArrowUpDown className="w-3.5 h-3.5" /> 전치
                            </button>
                            <button onClick={deleteBlankRows} className={opBtnCls} title="빈 행 삭제">
                                <Trash2 className="w-3 h-3" /> 빈 행 삭제
                            </button>
                            <button onClick={deleteBlankCols} className={opBtnCls} title="빈 열 삭제">
                                <Trash2 className="w-3 h-3" /> 빈 열 삭제
                            </button>
                            <button onClick={removeDuplicateRows} className={opBtnCls} title="중복 행 제거">
                                중복 제거
                            </button>
                        </div>

                        {/* Cell Properties */}
                        {selectedList.length > 0 && (
                            <div className="glass-card p-3 flex flex-wrap items-center gap-3">
                                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                                    {selectedList.length}개 셀 선택
                                </span>
                                <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                                {/* Alignment */}
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

                                {/* Bold */}
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

                                {/* Text transforms */}
                                <div className="flex items-center gap-0.5">
                                    {([
                                        { label: "AA", action: "upper" as const, title: "대문자 변환" },
                                        { label: "aa", action: "lower" as const, title: "소문자 변환" },
                                        { label: "Aa", action: "capitalize" as const, title: "첫글자 대문자" },
                                    ]).map(({ label, action, title }) => (
                                        <button
                                            key={action}
                                            onClick={() => applyTextTransform(action)}
                                            title={title}
                                            className="px-2 h-7 rounded text-xs font-mono font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400 transition-all"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                                {/* Color pickers */}
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
                        <div className="glass-card p-4 overflow-x-auto">
                            <div className="relative">
                                <table
                                    className="border-collapse"
                                    style={{ tableLayout: "fixed", width: colWidths.reduce((a, b) => a + b, 0) + 58 }}
                                    onMouseLeave={() => { if (isSelecting) setIsSelecting(false); }}
                                >
                                    <colgroup>
                                        <col style={{ width: 28 }} />
                                        {Array.from({ length: colCount }, (_, ci) => (
                                            <col key={ci} style={{ width: colWidths[ci] ?? 120 }} />
                                        ))}
                                        <col style={{ width: 28 }} />
                                    </colgroup>
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
                                                                "relative border cursor-cell select-none transition-colors overflow-hidden",
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

                                {/* Column controls + resize handles */}
                                <div className="flex mt-1" style={{ marginLeft: 28 }}>
                                    {rows[0]?.map((cell, ci) => {
                                        if (cell.hidden) return null;
                                        const w = colWidths[ci] ?? 120;
                                        return (
                                            <div
                                                key={ci}
                                                className="relative flex items-center justify-center gap-1 flex-shrink-0"
                                                style={{ width: w }}
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

                                                {/* Drag resize handle */}
                                                <div
                                                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group/rh z-10"
                                                    title={`열 너비: ${Math.round(w)}px`}
                                                    onMouseDown={e => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        resizingRef.current = { col: ci, startX: e.clientX, startWidth: w };
                                                    }}
                                                >
                                                    <div className="w-0.5 h-4 rounded-full bg-gray-300 dark:bg-zinc-600 group-hover/rh:bg-indigo-400 dark:group-hover/rh:bg-indigo-400 transition-colors" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-4 text-xs text-gray-500 dark:text-zinc-400 space-y-1">
                            <div className="font-semibold text-gray-700 dark:text-zinc-200 mb-2">사용 방법</div>
                            <div>• <strong>더블클릭</strong> — 셀 내용 편집 / Tab으로 다음 셀 이동</div>
                            <div>• <strong>드래그</strong> — 여러 셀 선택 (병합·텍스트변환·색상 일괄 적용)</div>
                            <div>• <strong>전치</strong> — 행과 열을 교환 (병합 없는 테이블에서만 가능)</div>
                            <div>• <strong>CSV</strong> — CSV 텍스트를 붙여넣어 테이블 데이터 한 번에 입력</div>
                        </div>
                    </div>

                    {/* ── Right: Preview + Output Options + HTML ── */}
                    <div className="space-y-4">
                        {/* Preview */}
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
                                    {caption && <caption className="text-xs text-gray-500 mb-2 caption-top">{caption}</caption>}
                                    {hasHeader && rows.length > 0 && (
                                        <thead>
                                            <tr>
                                                {rows[0].map((cell, ci) =>
                                                    cell.hidden ? null : (
                                                        <th key={ci} colSpan={cell.colspan} rowSpan={cell.rowspan}
                                                            style={{ textAlign: cell.align, fontWeight: cell.bold ? "bold" : undefined, backgroundColor: cell.bgColor || undefined, color: cell.textColor || undefined }}>
                                                            {cell.content || " "}
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
                                                            {cell.content || " "}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Output Options */}
                        <div className="glass-card p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-200 flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-gray-400 dark:text-zinc-500" /> 출력 설정
                            </h3>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-zinc-400 w-16 shrink-0">캡션</span>
                                    <input
                                        value={caption}
                                        onChange={e => setCaption(e.target.value)}
                                        placeholder="테이블 제목..."
                                        className={inputCls}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-zinc-400 w-16 shrink-0">ID</span>
                                    <input
                                        value={tableId}
                                        onChange={e => setTableId(e.target.value)}
                                        placeholder="id 속성..."
                                        className={inputCls}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-zinc-400 w-16 shrink-0">Class</span>
                                    <input
                                        value={tableClass}
                                        onChange={e => setTableClass(e.target.value)}
                                        placeholder="class 속성..."
                                        className={inputCls}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-zinc-400 w-16 shrink-0 flex items-center gap-1">
                                        <Minimize2 className="w-3 h-3" /> 압축
                                    </span>
                                    <button
                                        onClick={() => setMinifyOutput(v => !v)}
                                        className={cn(
                                            "relative w-9 h-5 rounded-full transition-colors",
                                            minifyOutput ? "bg-indigo-500" : "bg-gray-200 dark:bg-zinc-700"
                                        )}
                                    >
                                        <span className={cn(
                                            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                                            minifyOutput ? "translate-x-4" : "translate-x-0.5"
                                        )} />
                                    </button>
                                    <span className="text-xs text-gray-400 dark:text-zinc-500">
                                        {minifyOutput ? "압축 출력" : "들여쓰기 출력"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Generated HTML */}
                        <div className="glass-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-200">생성된 HTML</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => downloadHTML(generatedHTML)}
                                        className={opBtnCls}
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
                                className={opBtnCls}
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> 비주얼 내용 불러오기
                            </button>
                            <button
                                onClick={() => downloadHTML(sourceHTML)}
                                className={opBtnCls}
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
