"use client";

import { useMemo, useState } from "react";
import { Copy, ImageUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ResponsiveImageHelperPage() {
    const [baseUrl, setBaseUrl] = useState("https://cdn.example.com/images/hero");
    const [widthsInput, setWidthsInput] = useState("320, 640, 960, 1280");
    const [sizes, setSizes] = useState("(max-width: 768px) 100vw, 50vw");
    const [alt, setAlt] = useState("샘플 이미지");
    const [fallbackExt, setFallbackExt] = useState("jpg");
    const [useWebp, setUseWebp] = useState(true);
    const [useAvif, setUseAvif] = useState(true);

    const widths = useMemo(() => {
        return widthsInput
            .split(",")
            .map((part) => Number(part.trim()))
            .filter((n) => Number.isFinite(n) && n > 0)
            .sort((a, b) => a - b);
    }, [widthsInput]);

    const largestWidth = widths[widths.length - 1] ?? 1280;

    const srcsetByExt = (ext: string) =>
        widths.map((w) => `${baseUrl}-${w}.${ext} ${w}w`).join(",\n");

    const imgTagCode = useMemo(() => {
        return `<img
  src="${baseUrl}-${largestWidth}.${fallbackExt}"
  srcset="${srcsetByExt(fallbackExt)}"
  sizes="${sizes}"
  alt="${escapeAttr(alt)}"
  loading="lazy"
  decoding="async"
/>`;
    }, [baseUrl, largestWidth, fallbackExt, sizes, alt, widthsInput]);

    const pictureTagCode = useMemo(() => {
        const lines: string[] = ["<picture>"];

        if (useAvif) {
            lines.push(
                `  <source type="image/avif" srcset="${srcsetByExt("avif")}" sizes="${sizes}" />`
            );
        }
        if (useWebp) {
            lines.push(
                `  <source type="image/webp" srcset="${srcsetByExt("webp")}" sizes="${sizes}" />`
            );
        }

        lines.push(`  <img`);
        lines.push(`    src="${baseUrl}-${largestWidth}.${fallbackExt}"`);
        lines.push(`    srcset="${srcsetByExt(fallbackExt)}"`);
        lines.push(`    sizes="${sizes}"`);
        lines.push(`    alt="${escapeAttr(alt)}"`);
        lines.push(`    loading="lazy"`);
        lines.push(`    decoding="async"`);
        lines.push(`  />`);
        lines.push(`</picture>`);

        return lines.join("\n");
    }, [useAvif, useWebp, baseUrl, largestWidth, fallbackExt, sizes, alt, widthsInput]);

    const copyText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-10">
            <PageHeader
                title="반응형 이미지 헬퍼"
                description="srcset, sizes, picture 코드를 빠르게 생성하고 프로젝트에 바로 붙여 넣으세요."
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section className="glass-card p-6 md:p-8 rounded-3xl space-y-5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageUp className="w-5 h-5" />
                        입력 설정
                    </h2>

                    <Field label="이미지 베이스 URL">
                        <input
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                            placeholder="https://cdn.example.com/images/hero"
                        />
                    </Field>

                    <Field label="가로폭 목록 (콤마 구분)">
                        <input
                            value={widthsInput}
                            onChange={(e) => setWidthsInput(e.target.value)}
                            className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                            placeholder="320, 640, 960, 1280"
                        />
                    </Field>

                    <Field label="sizes 값">
                        <input
                            value={sizes}
                            onChange={(e) => setSizes(e.target.value)}
                            className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                            placeholder="(max-width: 768px) 100vw, 50vw"
                        />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="대체 포맷">
                            <select
                                value={fallbackExt}
                                onChange={(e) => setFallbackExt(e.target.value)}
                                className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                            >
                                <option value="jpg">jpg</option>
                                <option value="jpeg">jpeg</option>
                                <option value="png">png</option>
                                <option value="webp">webp</option>
                            </select>
                        </Field>

                        <Field label="alt 텍스트">
                            <input
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                                className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                placeholder="이미지 설명"
                            />
                        </Field>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <ToggleButton label="AVIF source" checked={useAvif} onToggle={setUseAvif} />
                        <ToggleButton label="WebP source" checked={useWebp} onToggle={setUseWebp} />
                    </div>
                </section>

                <section className="space-y-5">
                    <CodeCard title="<img> 코드" code={imgTagCode} onCopy={() => copyText(imgTagCode)} />
                    <CodeCard title="<picture> 코드" code={pictureTagCode} onCopy={() => copyText(pictureTagCode)} />
                </section>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
            {children}
        </label>
    );
}

function ToggleButton({
    label,
    checked,
    onToggle,
}: {
    label: string;
    checked: boolean;
    onToggle: (next: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onToggle(!checked)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                checked
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
            }`}
        >
            {label}
        </button>
    );
}

function CodeCard({ title, code, onCopy }: { title: string; code: string; onCopy: () => void }) {
    return (
        <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{title}</p>
                <button
                    onClick={onCopy}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-indigo-500 transition-colors"
                >
                    <Copy className="w-3.5 h-3.5" />
                    복사
                </button>
            </div>
            <pre className="bg-zinc-900 text-zinc-200 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {code}
            </pre>
        </div>
    );
}

function escapeAttr(value: string) {
    return value.replace(/"/g, "&quot;");
}
