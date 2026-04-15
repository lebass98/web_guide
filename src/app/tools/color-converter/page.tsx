"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Check, Pipette } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Conversion Utilities ─────────────────────────────────────────────────────

function clamp(n: number, min = 0, max = 255) {
    return Math.max(min, Math.min(max, Math.round(n)));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const clean = hex.replace("#", "");
    const full =
        clean.length === 3
            ? clean
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : clean;
    if (!/^[0-9a-f]{6}$/i.test(full)) return null;
    return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16),
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    return (
        "#" +
        [r, g, b]
            .map((v) => clamp(v).toString(16).padStart(2, "0"))
            .join("")
    );
}

function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number) {
    h /= 360;
    s /= 100;
    l /= 100;
    if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return {
        r: clamp(hue2rgb(h + 1 / 3) * 255),
        g: clamp(hue2rgb(h) * 255),
        b: clamp(hue2rgb(h - 1 / 3) * 255),
    };
}

function rgbToOklch(r: number, g: number, b: number) {
    const toLinear = (c: number) => {
        c /= 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const rl = toLinear(r),
        gl = toLinear(g),
        bl = toLinear(b);
    const lm = Math.cbrt(0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl);
    const mm = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl);
    const sm = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl);
    const L = 0.2104542553 * lm + 0.793617785 * mm - 0.0040720468 * sm;
    const a = 1.9779984951 * lm - 2.428592205 * mm + 0.4505937099 * sm;
    const b2 = 0.0259040371 * lm + 0.7827717662 * mm - 0.808675766 * sm;
    const C = Math.sqrt(a * a + b2 * b2);
    const H = ((Math.atan2(b2, a) * 180) / Math.PI + 360) % 360;
    return {
        l: Math.round(L * 1000) / 10,
        c: Math.round(C * 1000) / 1000,
        h: Math.round(H),
    };
}

function rgbToCmyk(r: number, g: number, b: number) {
    const rp = r / 255,
        gp = g / 255,
        bp = b / 255;
    const k = 1 - Math.max(rp, gp, bp);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
        c: Math.round(((1 - rp - k) / (1 - k)) * 100),
        m: Math.round(((1 - gp - k) / (1 - k)) * 100),
        y: Math.round(((1 - bp - k) / (1 - k)) * 100),
        k: Math.round(k * 100),
    };
}

function getLuminance(r: number, g: number, b: number) {
    const toLinear = (c: number) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(l1: number, l2: number) {
    const hi = Math.max(l1, l2),
        lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
}

function getHarmonies(h: number, s: number, l: number) {
    const sw = (hue: number) => {
        const { r, g, b } = hslToRgb(((hue % 360) + 360) % 360, s, l);
        return rgbToHex(r, g, b);
    };
    return {
        complementary: [sw(h + 180)],
        analogous: [sw(h - 30), sw(h + 30)],
        triadic: [sw(h + 120), sw(h + 240)],
        splitComplementary: [sw(h + 150), sw(h + 210)],
        tetradic: [sw(h + 90), sw(h + 180), sw(h + 270)],
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyBtn({ value, className }: { value: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className={cn(
                "p-1.5 rounded-lg transition-all",
                copied
                    ? "text-emerald-500 bg-emerald-500/10"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50",
                className
            )}
            title="복사"
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            className="flex flex-col items-center gap-1.5 group"
            onClick={() => {
                navigator.clipboard.writeText(hex);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            }}
            title={`${label}: ${hex}`}
        >
            <div
                className="w-9 h-9 rounded-xl shadow-md border border-black/10 dark:border-white/10 group-hover:scale-110 transition-transform ring-2 ring-transparent group-hover:ring-white/40 dark:group-hover:ring-white/20"
                style={{ backgroundColor: hex }}
            />
            <span className="text-[9px] font-mono text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {copied ? "✓" : hex.toUpperCase()}
            </span>
        </button>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            {children}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const INITIAL_HEX = "#6366f1";

export default function ColorConverterPage() {
    const [hex, setHex] = useState(INITIAL_HEX);
    const [hexInput, setHexInput] = useState(INITIAL_HEX);
    const [rgbInput, setRgbInput] = useState({ r: "99", g: "102", b: "241" });
    const [hslInput, setHslInput] = useState({ h: "239", s: "84", l: "67" });
    const [hexError, setHexError] = useState(false);

    // Derived values (always from canonical hex)
    const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const lum = getLuminance(rgb.r, rgb.g, rgb.b);
    const ratioWhite = getContrastRatio(lum, 1);
    const ratioBlack = getContrastRatio(lum, 0);
    const harmonies = getHarmonies(hsl.h, hsl.s, hsl.l);

    const applyRgb = (r: number, g: number, b: number) => {
        const newHex = rgbToHex(r, g, b);
        setHex(newHex);
        setHexInput(newHex);
        setHexError(false);
        const h = rgbToHsl(r, g, b);
        setHslInput({ h: String(h.h), s: String(h.s), l: String(h.l) });
    };

    const setFromPicker = (value: string) => {
        const r = hexToRgb(value);
        if (!r) return;
        setHex(value);
        setHexInput(value);
        setHexError(false);
        setRgbInput({ r: String(r.r), g: String(r.g), b: String(r.b) });
        const h = rgbToHsl(r.r, r.g, r.b);
        setHslInput({ h: String(h.h), s: String(h.s), l: String(h.l) });
    };

    const handleHexChange = (value: string) => {
        setHexInput(value);
        const clean = value.startsWith("#") ? value : "#" + value;
        const r = hexToRgb(clean);
        if (r) {
            setHexError(false);
            setHex(clean.toLowerCase());
            setRgbInput({ r: String(r.r), g: String(r.g), b: String(r.b) });
            const h = rgbToHsl(r.r, r.g, r.b);
            setHslInput({ h: String(h.h), s: String(h.s), l: String(h.l) });
        } else {
            setHexError(true);
        }
    };

    const handleRgbChange = (field: "r" | "g" | "b", value: string) => {
        const next = { ...rgbInput, [field]: value };
        setRgbInput(next);
        const r = parseInt(next.r),
            g = parseInt(next.g),
            b = parseInt(next.b);
        if ([r, g, b].every((v) => !isNaN(v) && v >= 0 && v <= 255)) applyRgb(r, g, b);
    };

    const handleHslChange = (field: "h" | "s" | "l", value: string) => {
        const next = { ...hslInput, [field]: value };
        setHslInput(next);
        const h = parseInt(next.h),
            s = parseInt(next.s),
            l = parseInt(next.l);
        if (!isNaN(h) && !isNaN(s) && !isNaN(l) &&
            h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
            const { r, g, b } = hslToRgb(h, s, l);
            applyRgb(r, g, b);
        }
    };

    const wcagLabel = (ratio: number) => {
        if (ratio >= 7) return { label: "AAA", cls: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
        if (ratio >= 4.5) return { label: "AA", cls: "text-green-500 bg-green-500/10 border-green-500/20" };
        if (ratio >= 3) return { label: "AA Large", cls: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
        return { label: "Fail", cls: "text-red-500 bg-red-500/10 border-red-500/20" };
    };

    const inputCls =
        "w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl px-3 py-2.5 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-all";
    const numInputCls =
        "w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl px-1 py-2.5 font-mono text-sm text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

    return (
        <>
            <PageHeader
                title="색상 코드 변환기"
                description="HEX · RGB · HSL · OKLCH · CMYK 변환, 접근성 검사, 조화 팔레트 생성"
            />

            <div className="flex flex-col gap-5">
                {/* ── Row 1: Preview + Inputs ── */}
                <div className="flex flex-col lg:flex-row gap-5">
                    {/* Color preview */}
                    <div className="lg:w-52 flex flex-col gap-3 flex-shrink-0">
                        <div
                            className="w-full h-44 lg:flex-1 lg:min-h-[180px] rounded-2xl border border-black/10 dark:border-white/10 shadow-xl transition-all duration-300"
                            style={{ backgroundColor: hexError ? "#aaaaaa" : hex }}
                        />
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors shadow-sm select-none">
                            <Pipette className="w-4 h-4" />
                            색상 선택
                            <input
                                type="color"
                                value={hexError ? "#aaaaaa" : hex}
                                onChange={(e) => setFromPicker(e.target.value)}
                                className="sr-only"
                            />
                        </label>
                    </div>

                    {/* HEX / RGB / HSL inputs */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* HEX */}
                        <div className="glass-card p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <SectionLabel>HEX</SectionLabel>
                                <CopyBtn value={hexError ? "" : hexInput} />
                            </div>
                            <input
                                type="text"
                                value={hexInput}
                                onChange={(e) => handleHexChange(e.target.value)}
                                placeholder="#000000"
                                className={cn(inputCls, hexError && "border-red-400 dark:border-red-500")}
                            />
                            {hexError && (
                                <p className="text-xs text-red-500 font-medium">유효하지 않은 HEX 코드</p>
                            )}
                        </div>

                        {/* RGB */}
                        <div className="glass-card p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <SectionLabel>RGB</SectionLabel>
                                <CopyBtn value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(["r", "g", "b"] as const).map((ch) => (
                                    <div key={ch} className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-zinc-400 text-center uppercase">
                                            {ch}
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            max={255}
                                            value={rgbInput[ch]}
                                            onChange={(e) => handleRgbChange(ch, e.target.value)}
                                            className={numInputCls}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* HSL */}
                        <div className="glass-card p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <SectionLabel>HSL</SectionLabel>
                                <CopyBtn value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {(
                                    [
                                        { key: "h", label: "H°", max: 360 },
                                        { key: "s", label: "S%", max: 100 },
                                        { key: "l", label: "L%", max: 100 },
                                    ] as const
                                ).map(({ key, label, max }) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-zinc-400 text-center">
                                            {label}
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            max={max}
                                            value={hslInput[key]}
                                            onChange={(e) => handleHslChange(key, e.target.value)}
                                            className={numInputCls}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Row 2: OKLCH + CMYK ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* OKLCH */}
                    <div className="glass-card p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SectionLabel>OKLCH</SectionLabel>
                                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">
                                    Modern CSS
                                </span>
                            </div>
                            <CopyBtn value={`oklch(${oklch.l}% ${oklch.c} ${oklch.h})`} />
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl px-3 py-2.5 font-mono text-sm text-zinc-600 dark:text-zinc-300">
                            oklch({oklch.l}%&nbsp;{oklch.c}&nbsp;{oklch.h})
                        </div>
                    </div>

                    {/* CMYK */}
                    <div className="glass-card p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <SectionLabel>CMYK</SectionLabel>
                            <CopyBtn
                                value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {(["c", "m", "y", "k"] as const).map((ch) => (
                                <div key={ch} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                                        {ch}
                                    </span>
                                    <div className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl py-2 font-mono text-xs text-center text-zinc-600 dark:text-zinc-300">
                                        {cmyk[ch]}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Row 3: WCAG Contrast ── */}
                <div className="glass-card p-4">
                    <SectionLabel>접근성 명도 대비 (WCAG 2.1)</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                        {[
                            { bg: "#ffffff", label: "흰 배경", ratio: ratioWhite },
                            { bg: "#000000", label: "검정 배경", ratio: ratioBlack },
                        ].map(({ bg, label, ratio }) => {
                            const { label: wl, cls } = wcagLabel(ratio);
                            return (
                                <div key={label} className="flex items-center gap-4">
                                    <div
                                        className="flex-shrink-0 w-14 h-14 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-xl font-black select-none"
                                        style={{ backgroundColor: bg, color: hex }}
                                    >
                                        Aa
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-zinc-400">{label}</p>
                                        <p className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">
                                            {ratio.toFixed(2)}:1
                                        </p>
                                        <span
                                            className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit",
                                                cls
                                            )}
                                        >
                                            {wl}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Row 4: Color Harmonies ── */}
                <div className="glass-card p-4">
                    <SectionLabel>색상 조화 팔레트</SectionLabel>
                    <div className="flex flex-col gap-5 mt-3">
                        {(
                            [
                                { key: "complementary", label: "보색" },
                                { key: "analogous", label: "유사색" },
                                { key: "triadic", label: "삼색" },
                                { key: "splitComplementary", label: "분할 보색" },
                                { key: "tetradic", label: "사색" },
                            ] as const
                        ).map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-4">
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 w-24 flex-shrink-0">
                                    {label}
                                </span>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <ColorSwatch hex={hex} label="기본" />
                                    {harmonies[key].map((h) => (
                                        <ColorSwatch key={h} hex={h} label={label} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Row 5: Tints & Shades ── */}
                <div className="glass-card p-4">
                    <SectionLabel>밝기 변형 (Tints &amp; Shades)</SectionLabel>
                    <div className="flex gap-2 flex-wrap mt-3">
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((lv) => {
                            const { r, g, b } = hslToRgb(hsl.h, hsl.s, lv);
                            return (
                                <ColorSwatch key={lv} hex={rgbToHex(r, g, b)} label={`L${lv}`} />
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
