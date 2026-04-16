"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Plus, X, ImageUp, ChevronDown, Sparkles, Code2, Layers, Monitor } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SizesCondition {
    id: string;
    breakpoint: string; // "" = default fallback
    value: string;      // e.g. "100vw", "50vw", "320px"
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WIDTH_PRESETS = [
    { label: "기본",        widths: [320, 640, 960, 1280, 1920] },
    { label: "Tailwind",   widths: [640, 768, 1024, 1280, 1536] },
    { label: "모바일 우선", widths: [480, 768, 1024, 1280] },
    { label: "썸네일",      widths: [120, 240, 480] },
    { label: "HiDPI",      widths: [320, 640, 768, 1024, 1280, 1920, 2560] },
];

const SIZES_PRESETS = [
    { label: "전체 너비",     value: "100vw" },
    { label: "1/2 너비",      value: "(max-width: 768px) 100vw, 50vw" },
    { label: "1/3 너비",      value: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" },
    { label: "사이드바",      value: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, calc(100vw - 320px)" },
    { label: "카드 그리드",   value: "(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw" },
    { label: "히어로",        value: "(max-width: 1280px) 100vw, 1280px" },
];

const FILE_PATTERNS = [
    { label: "이름-너비.확장자",              value: "{name}-{w}.{ext}" },
    { label: "이름_너비.확장자",              value: "{name}_{w}.{ext}" },
    { label: "이름-너비w.확장자",             value: "{name}-{w}w.{ext}" },
    { label: "이름.확장자?w=너비 (쿼리)",     value: "{name}.{ext}?w={w}" },
    { label: "이름?width=너비&format=확장자", value: "{name}?width={w}&format={ext}" },
];

const BREAKPOINTS = ["480px", "640px", "768px", "1024px", "1200px", "1280px", "1536px"];

const INPUT_CLS =
    "w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all";

const SELECT_CLS =
    "w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeAttr(v: string) {
    return v.replace(/"/g, "&quot;");
}

function applyPattern(baseUrl: string, width: number, ext: string, pattern: string) {
    return pattern
        .replace("{name}", baseUrl)
        .replace("{w}", String(width))
        .replace("{ext}", ext);
}

function buildSrcset(baseUrl: string, widths: number[], ext: string, pattern: string, indent = "  ") {
    return widths.map((w) => `${applyPattern(baseUrl, w, ext, pattern)} ${w}w`).join(`,\n${indent}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ResponsiveImageHelperPage() {
    // 기본 설정
    const [baseUrl, setBaseUrl]         = useState("https://cdn.example.com/images/hero");
    const [widthsInput, setWidthsInput] = useState("320, 640, 960, 1280, 1920");
    const [alt, setAlt]                 = useState("샘플 이미지");
    const [fallbackExt, setFallbackExt] = useState("jpg");
    const [filePattern, setFilePattern] = useState("{name}-{w}.{ext}");
    const [useWebp, setUseWebp]         = useState(true);
    const [useAvif, setUseAvif]         = useState(true);

    // Sizes 빌더
    const [conditions, setConditions] = useState<SizesCondition[]>([
        { id: "a", breakpoint: "768px", value: "100vw" },
        { id: "b", breakpoint: "",      value: "50vw" },
    ]);

    // 고급 설정
    const [loading,       setLoading]       = useState<"lazy" | "eager">("lazy");
    const [fetchPriority, setFetchPriority] = useState<"auto" | "high" | "low">("auto");
    const [decoding,      setDecoding]      = useState<"async" | "sync" | "auto">("async");
    const [imgWidth,      setImgWidth]      = useState("");
    const [imgHeight,     setImgHeight]     = useState("");

    // UI
    const [outputTab, setOutputTab] = useState<"img" | "picture" | "nextjs" | "css">("img");
    const [copied, setCopied]       = useState(false);

    // ── Derived ──────────────────────────────────────────────────────────────

    const widths = useMemo(
        () =>
            widthsInput
                .split(",")
                .map((p) => Number(p.trim()))
                .filter((n) => Number.isFinite(n) && n > 0)
                .sort((a, b) => a - b),
        [widthsInput]
    );

    const largestWidth = widths[widths.length - 1] ?? 1280;

    const sizesStr = useMemo(
        () =>
            conditions
                .filter((c) => c.value.trim())
                .map((c) =>
                    c.breakpoint ? `(max-width: ${c.breakpoint}) ${c.value}` : c.value
                )
                .join(", "),
        [conditions]
    );

    // ── Code generators ──────────────────────────────────────────────────────

    const imgCode = useMemo(() => {
        const src = applyPattern(baseUrl, largestWidth, fallbackExt, filePattern);
        const ss  = buildSrcset(baseUrl, widths, fallbackExt, filePattern, "         ");
        const lines = [
            `<img`,
            `  src="${src}"`,
            `  srcset="${ss}"`,
            `  sizes="${sizesStr}"`,
            `  alt="${escapeAttr(alt)}"`,
        ];
        if (imgWidth)  lines.push(`  width="${imgWidth}"`);
        if (imgHeight) lines.push(`  height="${imgHeight}"`);
        lines.push(`  loading="${loading}"`);
        lines.push(`  decoding="${decoding}"`);
        if (fetchPriority !== "auto") lines.push(`  fetchpriority="${fetchPriority}"`);
        lines.push(`/>`);
        return lines.join("\n");
    }, [baseUrl, widths, fallbackExt, filePattern, sizesStr, alt, loading, decoding, fetchPriority, imgWidth, imgHeight, largestWidth]);

    const pictureCode = useMemo(() => {
        const src = applyPattern(baseUrl, largestWidth, fallbackExt, filePattern);
        const lines = ["<picture>"];
        if (useAvif) {
            lines.push(
                `  <source\n    type="image/avif"\n    srcset="${buildSrcset(baseUrl, widths, "avif", filePattern, "            ")}"\n    sizes="${sizesStr}"\n  />`
            );
        }
        if (useWebp) {
            lines.push(
                `  <source\n    type="image/webp"\n    srcset="${buildSrcset(baseUrl, widths, "webp", filePattern, "            ")}"\n    sizes="${sizesStr}"\n  />`
            );
        }
        lines.push(`  <img`);
        lines.push(`    src="${src}"`);
        lines.push(`    srcset="${buildSrcset(baseUrl, widths, fallbackExt, filePattern, "            ")}"`);
        lines.push(`    sizes="${sizesStr}"`);
        lines.push(`    alt="${escapeAttr(alt)}"`);
        if (imgWidth)  lines.push(`    width="${imgWidth}"`);
        if (imgHeight) lines.push(`    height="${imgHeight}"`);
        lines.push(`    loading="${loading}"`);
        lines.push(`    decoding="${decoding}"`);
        if (fetchPriority !== "auto") lines.push(`    fetchpriority="${fetchPriority}"`);
        lines.push(`  />`);
        lines.push(`</picture>`);
        return lines.join("\n");
    }, [useAvif, useWebp, baseUrl, widths, fallbackExt, filePattern, sizesStr, alt, loading, decoding, fetchPriority, imgWidth, imgHeight, largestWidth]);

    const nextjsCode = useMemo(() => {
        const src = applyPattern(baseUrl, largestWidth, fallbackExt, filePattern);
        const hasDims = imgWidth && imgHeight;
        const isPriority = loading === "eager" || fetchPriority === "high";
        const lines = [
            `import Image from "next/image";`,
            ``,
            `// 컴포넌트 내부`,
            `<Image`,
            `  src="${src}"`,
            `  alt="${escapeAttr(alt)}"`,
        ];
        if (hasDims) {
            lines.push(`  width={${imgWidth}}`);
            lines.push(`  height={${imgHeight}}`);
        } else {
            lines.push(`  fill`);
            lines.push(`  // 부모 요소에 position: relative 필요`);
        }
        lines.push(`  sizes="${sizesStr}"`);
        if (isPriority) {
            lines.push(`  priority`);
            lines.push(`  // LCP 이미지: priority prop 사용`);
        } else {
            lines.push(`  loading="lazy"`);
        }
        lines.push(`/>`);
        return lines.join("\n");
    }, [baseUrl, widths, fallbackExt, filePattern, sizesStr, alt, loading, fetchPriority, imgWidth, imgHeight, largestWidth]);

    const cssCode = useMemo(() => {
        const fallback1x = applyPattern(baseUrl, widths[0] ?? 640, fallbackExt, filePattern);
        const fallbackLg = applyPattern(baseUrl, largestWidth, fallbackExt, filePattern);

        const imageSetParts: string[] = [];
        if (useAvif) {
            widths.forEach((w) =>
                imageSetParts.push(`    url("${applyPattern(baseUrl, w, "avif", filePattern)}") type("image/avif") ${w}w`)
            );
        }
        if (useWebp) {
            widths.forEach((w) =>
                imageSetParts.push(`    url("${applyPattern(baseUrl, w, "webp", filePattern)}") type("image/webp") ${w}w`)
            );
        }
        widths.forEach((w) =>
            imageSetParts.push(`    url("${applyPattern(baseUrl, w, fallbackExt, filePattern)}") ${w}w`)
        );

        return [
            `.hero-image {`,
            `  /* 구형 브라우저 fallback */`,
            `  background-image: url("${fallback1x}");`,
            ``,
            `  /* 모던 브라우저 — image-set() */`,
            `  background-image: image-set(`,
            imageSetParts.join(",\n"),
            `  );`,
            ``,
            `  background-size: cover;`,
            `  background-position: center;`,
            `  background-repeat: no-repeat;`,
            `}`,
            ``,
            `/* 반응형 미디어 쿼리 */`,
            `@media (min-width: 1280px) {`,
            `  .hero-image {`,
            `    background-image: url("${fallbackLg}");`,
            `  }`,
            `}`,
        ].join("\n");
    }, [baseUrl, widths, fallbackExt, filePattern, useAvif, useWebp, largestWidth]);

    const currentCode =
        outputTab === "img"     ? imgCode
        : outputTab === "picture" ? pictureCode
        : outputTab === "nextjs"  ? nextjsCode
        : cssCode;

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const addCondition = () => {
        const defaultIndex = conditions.findIndex((c) => c.breakpoint === "");
        const newCond: SizesCondition = { id: String(Date.now()), breakpoint: "480px", value: "100vw" };
        if (defaultIndex >= 0) {
            const next = [...conditions];
            next.splice(defaultIndex, 0, newCond);
            setConditions(next);
        } else {
            setConditions([...conditions, newCond]);
        }
    };

    const removeCondition = (id: string) => {
        setConditions((prev) => prev.filter((c) => c.id !== id));
    };

    const updateCondition = (id: string, field: "breakpoint" | "value", val: string) => {
        setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
    };

    const applySizesPreset = (value: string) => {
        const parts = value.split(",").map((p) => p.trim());
        const next: SizesCondition[] = parts.map((part, i) => {
            const match = part.match(/\(max-width:\s*([^)]+)\)\s+(.+)/);
            return match
                ? { id: String(i), breakpoint: match[1].trim(), value: match[2].trim() }
                : { id: String(i), breakpoint: "", value: part };
        });
        setConditions(next);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const maxW = widths[widths.length - 1] ?? 1;
    const aspectRatio =
        imgWidth && imgHeight && Number(imgWidth) > 0 && Number(imgHeight) > 0
            ? (Number(imgWidth) / Number(imgHeight)).toFixed(3)
            : null;

    const OUTPUT_TABS = [
        { id: "img",     label: "<img>" },
        { id: "picture", label: "<picture>" },
        { id: "nextjs",  label: "Next.js" },
        { id: "css",     label: "CSS" },
    ] as const;

    const OUTPUT_TIPS: Record<typeof outputTab, { title: string; points: string[] }> = {
        img: {
            title: "<img> 기본 반응형",
            points: [
                "srcset은 브라우저가 최적 이미지를 자율 선택하는 힌트입니다.",
                "sizes는 레이아웃 기준 표시 너비를 지정합니다. 정확할수록 유리합니다.",
                "HiDPI 화면을 위해 표시 크기의 2× 이미지를 포함하세요.",
            ],
        },
        picture: {
            title: "<picture> 포맷 분기",
            points: [
                "AVIF는 WebP 대비 20–30% 더 압축되나 구형 브라우저는 미지원합니다.",
                "<source> 순서가 중요합니다. 브라우저는 위에서부터 지원 여부를 확인합니다.",
                "<img>는 항상 마지막 fallback 위치에 두어야 합니다.",
            ],
        },
        nextjs: {
            title: "Next.js Image 컴포넌트",
            points: [
                "Next.js가 WebP/AVIF 변환·최적화를 자동으로 처리합니다.",
                "LCP 이미지(첫 화면 주요 이미지)에는 priority prop을 사용하세요.",
                "fill 모드 사용 시 부모에 position: relative를 반드시 적용하세요.",
            ],
        },
        css: {
            title: "CSS image-set() 배경",
            points: [
                "image-set()은 CSS 배경 이미지에서 포맷·해상도를 분기합니다.",
                "구형 브라우저 대비 일반 background-image fallback을 먼저 선언하세요.",
                "Hero 섹션·장식 배경처럼 SEO 무관 이미지에 적합합니다.",
            ],
        },
    };

    const currentTip = OUTPUT_TIPS[outputTab];

    return (
        <div className="space-y-8">
            <PageHeader
                title="반응형 이미지 헬퍼"
                description="srcset, sizes, picture 코드를 자동 생성하세요. 파일명 패턴·Sizes 빌더·Next.js·CSS image-set()까지 지원합니다."
            />

            <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start">

                {/* ══ Left: Settings ══════════════════════════════════════════ */}
                <div className="space-y-4">

                    {/* 기본 설정 */}
                    <SettingsCard title="기본 설정" icon={<ImageUp className="w-4 h-4" />}>
                        <Field label="이미지 베이스 URL">
                            <input
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                className={INPUT_CLS}
                                placeholder="https://cdn.example.com/images/hero"
                            />
                        </Field>

                        <Field label="alt 텍스트">
                            <input
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                                className={INPUT_CLS}
                                placeholder="이미지 설명 (접근성)"
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="대체 포맷">
                                <select
                                    value={fallbackExt}
                                    onChange={(e) => setFallbackExt(e.target.value)}
                                    className={SELECT_CLS}
                                >
                                    {["jpg", "jpeg", "png", "webp"].map((ext) => (
                                        <option key={ext} value={ext}>{ext}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="파일명 패턴">
                                <select
                                    value={filePattern}
                                    onChange={(e) => setFilePattern(e.target.value)}
                                    className={SELECT_CLS}
                                >
                                    {FILE_PATTERNS.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase mb-2">추가 포맷 소스</p>
                            <div className="flex gap-2">
                                <FormatToggle label="AVIF" checked={useAvif} onChange={setUseAvif} color="violet" />
                                <FormatToggle label="WebP" checked={useWebp} onChange={setUseWebp} color="sky" />
                            </div>
                        </div>
                    </SettingsCard>

                    {/* 너비 설정 */}
                    <SettingsCard title="너비 설정" icon={<Monitor className="w-4 h-4" />}>
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase mb-2">프리셋</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {WIDTH_PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => setWidthsInput(preset.widths.join(", "))}
                                        className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 hover:border-indigo-400/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Field label="너비 목록 (px, 콤마 구분)">
                            <input
                                value={widthsInput}
                                onChange={(e) => setWidthsInput(e.target.value)}
                                className={INPUT_CLS}
                                placeholder="320, 640, 960, 1280"
                            />
                        </Field>

                        {/* Width bar chart */}
                        {widths.length > 0 && (
                            <div>
                                <div className="flex items-end gap-1 h-9">
                                    {widths.map((w) => (
                                        <div
                                            key={w}
                                            className="relative group flex-1 flex flex-col justify-end"
                                        >
                                            <div
                                                className="w-full rounded-t-md bg-indigo-500/25 dark:bg-indigo-500/35 group-hover:bg-indigo-500/50 transition-colors"
                                                style={{ height: `${Math.round((w / maxW) * 32) + 4}px` }}
                                            />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                                <span className="text-[10px] bg-zinc-900 text-white rounded px-1.5 py-0.5 whitespace-nowrap">{w}px</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-1 mt-0.5">
                                    {widths.map((w) => (
                                        <div key={w} className="flex-1 text-center">
                                            <span className="text-[9px] text-zinc-400">{w >= 1000 ? `${w / 1000}k` : w}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SettingsCard>

                    {/* Sizes 빌더 */}
                    <SettingsCard title="Sizes 빌더" icon={<Layers className="w-4 h-4" />}>
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase mb-2">레이아웃 프리셋</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {SIZES_PRESETS.map((p) => (
                                    <button
                                        key={p.label}
                                        onClick={() => applySizesPreset(p.value)}
                                        className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-sky-500/10 hover:border-sky-400/40 hover:text-sky-600 dark:hover:text-sky-400 transition-all"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {conditions.map((cond) => (
                                <div key={cond.id} className="flex items-center gap-2">
                                    {cond.breakpoint ? (
                                        <>
                                            <span className="text-[10px] font-mono text-zinc-400 shrink-0 w-20">max-width</span>
                                            <select
                                                value={cond.breakpoint}
                                                onChange={(e) => updateCondition(cond.id, "breakpoint", e.target.value)}
                                                className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-white focus:outline-none"
                                            >
                                                {BREAKPOINTS.map((bp) => (
                                                    <option key={bp} value={bp}>{bp}</option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-mono text-zinc-400 flex-1 pl-1">기본값 (fallback)</span>
                                    )}
                                    <input
                                        value={cond.value}
                                        onChange={(e) => updateCondition(cond.id, "value", e.target.value)}
                                        placeholder="100vw"
                                        className="w-20 px-2 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                                    />
                                    {conditions.length > 1 && (
                                        <button
                                            onClick={() => removeCondition(cond.id)}
                                            className="p-1 text-zinc-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addCondition}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                        >
                            <Plus className="w-3.5 h-3.5" /> 조건 추가
                        </button>

                        <div className="mt-1 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-100 dark:border-zinc-700/40">
                            <p className="text-[10px] text-zinc-400 mb-1 font-semibold uppercase tracking-wide">생성된 sizes</p>
                            <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 break-all leading-relaxed">
                                {sizesStr || "—"}
                            </p>
                        </div>
                    </SettingsCard>

                    {/* 고급 설정 (접이식) */}
                    <CollapsibleCard title="고급 설정" icon={<Sparkles className="w-4 h-4" />}>
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="loading">
                                <select value={loading} onChange={(e) => setLoading(e.target.value as "lazy" | "eager")} className={SELECT_CLS}>
                                    <option value="lazy">lazy</option>
                                    <option value="eager">eager</option>
                                </select>
                            </Field>
                            <Field label="fetchpriority">
                                <select value={fetchPriority} onChange={(e) => setFetchPriority(e.target.value as "auto" | "high" | "low")} className={SELECT_CLS}>
                                    <option value="auto">auto</option>
                                    <option value="high">high</option>
                                    <option value="low">low</option>
                                </select>
                            </Field>
                            <Field label="decoding">
                                <select value={decoding} onChange={(e) => setDecoding(e.target.value as "async" | "sync" | "auto")} className={SELECT_CLS}>
                                    <option value="async">async</option>
                                    <option value="sync">sync</option>
                                    <option value="auto">auto</option>
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="width (px)">
                                <input
                                    type="number"
                                    value={imgWidth}
                                    onChange={(e) => setImgWidth(e.target.value)}
                                    className={INPUT_CLS}
                                    placeholder="1280"
                                />
                            </Field>
                            <Field label="height (px)">
                                <input
                                    type="number"
                                    value={imgHeight}
                                    onChange={(e) => setImgHeight(e.target.value)}
                                    className={INPUT_CLS}
                                    placeholder="720"
                                />
                            </Field>
                        </div>

                        {aspectRatio && (
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">비율</span>
                                <span className="font-mono">{aspectRatio}</span>
                                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                                <span className="font-mono">{imgWidth}:{imgHeight}</span>
                                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                                <span>{getAspectRatioName(Number(imgWidth), Number(imgHeight))}</span>
                            </div>
                        )}

                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed space-y-1">
                            <p><strong>CLS 방지:</strong> width/height 속성으로 레이아웃 이동을 방지하세요.</p>
                            <p><strong>LCP 최적화:</strong> 첫 화면 주요 이미지는 <code className="font-mono">loading="eager"</code> + <code className="font-mono">fetchpriority="high"</code>를 사용하세요.</p>
                        </div>
                    </CollapsibleCard>
                </div>

                {/* ══ Right: Output ════════════════════════════════════════════ */}
                <div className="space-y-4">
                    {/* Tab bar */}
                    <div className="flex gap-1 glass-card p-1 rounded-2xl w-fit">
                        {OUTPUT_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setOutputTab(tab.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                                    outputTab === tab.id
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Code block */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    {currentTip.title}
                                </span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95",
                                    copied
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                                )}
                            >
                                {copied ? (
                                    <><Check className="w-3.5 h-3.5" /> 복사됨</>
                                ) : (
                                    <><Copy className="w-3.5 h-3.5" /> 복사</>
                                )}
                            </button>
                        </div>
                        <pre className="p-5 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap bg-zinc-950 dark:bg-zinc-900/80 text-zinc-200 min-h-[260px] max-h-[560px]">
                            <code>{currentCode}</code>
                        </pre>
                    </div>

                    {/* Tips */}
                    <div className="glass-card p-5 rounded-2xl">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
                            <span>💡</span> 활용 팁
                        </h3>
                        <ul className="space-y-2">
                            {currentTip.points.map((point, i) => (
                                <li key={i} className="flex gap-2 text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: point.replace(/`([^`]+)`/g, '<code class="font-mono text-indigo-500 dark:text-indigo-400 text-[12px]">$1</code>') }} />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick reference */}
                    <div className="glass-card p-5 rounded-2xl">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">📐 빠른 참조</h3>
                        <div className="space-y-1.5 text-[12px] font-mono">
                            {[
                                { label: "현재 이미지 개수",   value: `${widths.length}개` },
                                { label: "최소 너비",          value: widths[0] ? `${widths[0]}px` : "—" },
                                { label: "최대 너비",          value: `${largestWidth}px` },
                                { label: "포맷 소스 수",       value: `${1 + (useWebp ? 1 : 0) + (useAvif ? 1 : 0)}개 (fallback${useWebp ? " + WebP" : ""}${useAvif ? " + AVIF" : ""})` },
                                { label: "sizes 조건 수",      value: `${conditions.filter((c) => c.value).length}개` },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-sans text-[11px]">{label}</span>
                                    <span className="text-zinc-800 dark:text-zinc-200">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsCard({ title, icon, children }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-indigo-500 dark:text-indigo-400">{icon}</span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</span>
            </div>
            <div className="px-5 py-4 space-y-4">{children}</div>
        </div>
    );
}

function CollapsibleCard({ title, icon, children }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400">{icon}</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform duration-200", open && "rotate-180")} />
            </button>
            {open && <div className="px-5 py-4 space-y-4">{children}</div>}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1.5">
            <span className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                {label}
            </span>
            {children}
        </label>
    );
}

function FormatToggle({ label, checked, onChange, color }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    color: "violet" | "sky";
}) {
    const activeClass =
        color === "violet"
            ? "bg-violet-500/10 border-violet-500/40 text-violet-700 dark:text-violet-400"
            : "bg-sky-500/10 border-sky-500/40 text-sky-700 dark:text-sky-400";
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                checked
                    ? activeClass
                    : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
            )}
        >
            <span className={cn("w-2 h-2 rounded-full", checked ? (color === "violet" ? "bg-violet-500" : "bg-sky-500") : "bg-zinc-300 dark:bg-zinc-600")} />
            {label}
        </button>
    );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function getAspectRatioName(w: number, h: number): string {
    if (!w || !h) return "";
    const g = gcd(w, h);
    const rw = w / g, rh = h / g;
    const known: Record<string, string> = {
        "16:9": "16:9 (와이드)", "4:3": "4:3 (표준)", "1:1": "1:1 (정사각)",
        "3:2": "3:2 (DSLR)", "21:9": "21:9 (울트라)", "9:16": "9:16 (세로)",
    };
    const key = `${rw}:${rh}`;
    return known[key] ?? `${rw}:${rh}`;
}
