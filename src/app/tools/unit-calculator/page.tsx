"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

type UnitCategory = "rem" | "viewport" | "length" | "filesize";

const GROUPS = [
    { key: "rem" as UnitCategory, label: "px ↔ rem", emoji: "📐" },
    { key: "viewport" as UnitCategory, label: "vw / vh", emoji: "📱" },
    { key: "length" as UnitCategory, label: "길이 단위", emoji: "📏" },
    { key: "filesize" as UnitCategory, label: "파일 크기", emoji: "💾" },
];

function CopyBtn({ value, unit, onCopy }: { value: string; unit: string; onCopy: (v: string) => void }) {
    return (
        <button onClick={() => onCopy(`${value}${unit}`)} className="p-3 glass-card rounded-xl text-zinc-500 hover:text-indigo-500 transition-colors">
            <Copy className="w-4 h-4" />
        </button>
    );
}

function RemTab() {
    const { toast } = useToast();
    const [base, setBase] = useState(16);
    const [px, setPx] = useState("16");
    const [rem, setRem] = useState("1");
    const copy = (v: string) => { navigator.clipboard.writeText(v); toast(`${v} 복사됨!`, "success"); };
    const onPx = (v: string) => { setPx(v); setRem(v ? (parseFloat(v) / base).toFixed(4) : ""); };
    const onRem = (v: string) => { setRem(v); setPx(v ? (parseFloat(v) * base).toFixed(2) : ""); };

    return (
        <div className="glass-card p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">기준 폰트</label>
                <input type="range" min={8} max={24} value={base} onChange={(e) => { setBase(+e.target.value); onPx(px); }} className="flex-1 accent-indigo-500" />
                <span className="font-mono font-bold text-indigo-500 w-12 text-right">{base}px</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">px</label>
                    <div className="flex gap-2">
                        <input type="number" value={px} onChange={(e) => onPx(e.target.value)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold text-lg" />
                        <CopyBtn value={px} unit="px" onCopy={copy} />
                    </div>
                </div>
                <div className="flex justify-center"><ArrowRightLeft className="w-6 h-6 text-zinc-400" /></div>
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">rem</label>
                    <div className="flex gap-2">
                        <input type="number" value={rem} onChange={(e) => onRem(e.target.value)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold text-lg" />
                        <CopyBtn value={rem} unit="rem" onCopy={copy} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[12, 14, 16, 18, 20, 24, 32, 48].map((s) => (
                    <button key={s} onClick={() => onPx(String(s))} className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-500/10 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-xs font-mono font-bold transition-all">
                        {s}px → {(s / base).toFixed(3)}rem
                    </button>
                ))}
            </div>
        </div>
    );
}

function ViewportTab() {
    const { toast } = useToast();
    const [vw, setVw] = useState(1440);
    const [vh, setVh] = useState(900);
    const [vwPct, setVwPct] = useState("50");
    const [vhPct, setVhPct] = useState("50");
    const copy = (v: string) => { navigator.clipboard.writeText(v); toast(`${v} 복사됨!`, "success"); };

    const pxW = vwPct ? (parseFloat(vwPct) * vw / 100).toFixed(1) : "";
    const pxH = vhPct ? (parseFloat(vhPct) * vh / 100).toFixed(1) : "";

    return (
        <div className="glass-card p-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
                {[{ label: "뷰포트 너비", val: vw, set: setVw }, { label: "뷰포트 높이", val: vh, set: setVh }].map(({ label, val, set }) => (
                    <div key={label} className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label} (px)</label>
                        <input type="number" value={val} onChange={(e) => set(+e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
                {[{ label: "vw (%)", pct: vwPct, setPct: setVwPct, result: pxW, unit: "vw" }, { label: "vh (%)", pct: vhPct, setPct: setVhPct, result: pxH, unit: "vh" }].map(({ label, pct, setPct, result, unit }) => (
                    <div key={unit} className="flex flex-col gap-3">
                        <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</label>
                        <input type="number" min={0} max={100} value={pct} onChange={(e) => setPct(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold text-lg" />
                        <div className="flex items-center justify-between p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <span className="font-mono font-bold text-xl text-indigo-600 dark:text-indigo-400">{result}px</span>
                            <button onClick={() => copy(`${result}px`)} className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors"><Copy className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LengthTab() {
    const { toast } = useToast();
    const [value, setValue] = useState("100");
    const [from, setFrom] = useState("px");
    const units: Record<string, number> = { px: 1, cm: 37.795, mm: 3.7795, "in": 96, pt: 1.333 };
    const bytes = parseFloat(value) * (units[from] ?? 1);
    const copy = (v: string) => { navigator.clipboard.writeText(v); toast(`${v} 복사됨!`, "success"); };

    return (
        <div className="glass-card p-6 flex flex-col gap-6">
            <div className="flex gap-4">
                <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold text-lg" />
                <select value={from} onChange={(e) => setFrom(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white focus:outline-none">
                    {Object.keys(units).map((u) => <option key={u}>{u}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(units).filter(([u]) => u !== from).map(([unit, ratio]) => {
                    const converted = (bytes / ratio).toFixed(4).replace(/\.?0+$/, "");
                    return (
                        <button key={unit} onClick={() => copy(`${converted}${unit}`)} className="flex flex-col items-start p-4 bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/30 rounded-2xl transition-all group">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{unit}</span>
                            <span className="font-mono font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-500">{converted}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FileSizeTab() {
    const { toast } = useToast();
    const [value, setValue] = useState("1");
    const [from, setFrom] = useState("MB");
    const units: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
    const bytes = parseFloat(value) * (units[from] ?? 1);
    const copy = (v: string) => { navigator.clipboard.writeText(v); toast(`${v} 복사됨!`, "success"); };

    return (
        <div className="glass-card p-6 flex flex-col gap-6">
            <div className="flex gap-4">
                <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold text-lg" />
                <select value={from} onChange={(e) => setFrom(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white focus:outline-none">
                    {Object.keys(units).map((u) => <option key={u}>{u}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(units).filter(([u]) => u !== from).map(([unit, ratio]) => {
                    const converted = (bytes / ratio).toFixed(6).replace(/\.?0+$/, "");
                    return (
                        <button key={unit} onClick={() => copy(`${converted} ${unit}`)} className="flex flex-col items-start p-4 bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/30 rounded-2xl transition-all group">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{unit}</span>
                            <span className="font-mono font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-500 truncate w-full">{converted}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function UnitCalculatorPage() {
    const [tab, setTab] = useState<UnitCategory>("rem");
    return (
        <>
            <PageHeader title="반응형 단위 계산기" description="px, rem, em, vw, vh, cm 등 다양한 단위를 즉시 변환하세요." />
            <div className="flex flex-wrap gap-3 mb-8">
                {GROUPS.map(({ key, label, emoji }) => (
                    <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${tab === key ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>
                        {emoji} {label}
                    </button>
                ))}
            </div>
            {tab === "rem" && <RemTab />}
            {tab === "viewport" && <ViewportTab />}
            {tab === "length" && <LengthTab />}
            {tab === "filesize" && <FileSizeTab />}
        </>
    );
}
