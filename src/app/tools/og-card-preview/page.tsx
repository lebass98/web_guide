"use client";

import { useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

type CardType = "website" | "article" | "profile";

const DEFAULT_FORM = {
    siteName: "WebGuide",
    pageUrl: "https://webguide.tools/tools/og-card-preview",
    title: "OG/트위터 카드 미리보기 도구",
    description: "Open Graph와 Twitter Card 메타 태그를 미리 확인하고 바로 복사하세요.",
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    author: "WebGuide Team",
    cardType: "summary_large_image" as const,
    ogType: "website" as CardType,
};

export default function OgCardPreviewPage() {
    const [form, setForm] = useState(DEFAULT_FORM);

    const generatedMetaTags = useMemo(() => {
        return [
            `<meta property="og:title" content="${escapeHtml(form.title)}" />`,
            `<meta property="og:description" content="${escapeHtml(form.description)}" />`,
            `<meta property="og:image" content="${escapeHtml(form.imageUrl)}" />`,
            `<meta property="og:url" content="${escapeHtml(form.pageUrl)}" />`,
            `<meta property="og:site_name" content="${escapeHtml(form.siteName)}" />`,
            `<meta property="og:type" content="${form.ogType}" />`,
            `<meta name="twitter:card" content="${form.cardType}" />`,
            `<meta name="twitter:title" content="${escapeHtml(form.title)}" />`,
            `<meta name="twitter:description" content="${escapeHtml(form.description)}" />`,
            `<meta name="twitter:image" content="${escapeHtml(form.imageUrl)}" />`,
            `<meta name="twitter:site" content="@${escapeHtml(form.author.replace(/\s+/g, ""))}" />`,
        ].join("\n");
    }, [form]);

    const copyMetaTags = async () => {
        await navigator.clipboard.writeText(generatedMetaTags);
    };

    const update = (key: keyof typeof DEFAULT_FORM, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-10">
            <PageHeader
                title="OG·트위터 카드 미리보기"
                description="Open Graph/Twitter Card 결과를 실제 카드 형태로 확인하고, 메타 태그를 한 번에 복사하세요."
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section className="glass-card p-6 md:p-8 rounded-3xl space-y-5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">메타 정보 입력</h2>
                    <TextField
                        label="페이지 제목"
                        value={form.title}
                        onChange={(value) => update("title", value)}
                    />
                    <TextAreaField
                        label="페이지 설명"
                        value={form.description}
                        onChange={(value) => update("description", value)}
                    />
                    <TextField
                        label="대표 이미지 URL"
                        value={form.imageUrl}
                        onChange={(value) => update("imageUrl", value)}
                    />
                    <TextField
                        label="페이지 URL"
                        value={form.pageUrl}
                        onChange={(value) => update("pageUrl", value)}
                    />
                    <TextField
                        label="사이트 이름"
                        value={form.siteName}
                        onChange={(value) => update("siteName", value)}
                    />
                    <TextField
                        label="작성자/브랜드"
                        value={form.author}
                        onChange={(value) => update("author", value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                            label="OG 타입"
                            value={form.ogType}
                            onChange={(value) => update("ogType", value)}
                            options={[
                                { label: "website", value: "website" },
                                { label: "article", value: "article" },
                                { label: "profile", value: "profile" },
                            ]}
                        />
                        <SelectField
                            label="Twitter 카드"
                            value={form.cardType}
                            onChange={(value) => update("cardType", value)}
                            options={[
                                { label: "summary_large_image", value: "summary_large_image" },
                                { label: "summary", value: "summary" },
                            ]}
                        />
                    </div>
                    <button
                        onClick={() => setForm(DEFAULT_FORM)}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <RefreshCw className="w-4 h-4" />
                        기본값 복원
                    </button>
                </section>

                <section className="space-y-6">
                    <div className="glass-card p-5 rounded-2xl">
                        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Open Graph 미리보기</p>
                        <SocialCardPreview form={form} />
                    </div>

                    <div className="glass-card p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">생성된 메타 태그</p>
                            <button
                                onClick={copyMetaTags}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-indigo-500 transition-colors"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                복사
                            </button>
                        </div>
                        <pre className="bg-zinc-900 text-zinc-200 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto">
                            {generatedMetaTags}
                        </pre>
                    </div>
                </section>
            </div>
        </div>
    );
}

function SocialCardPreview({ form }: { form: typeof DEFAULT_FORM }) {
    const hostname = safeHostname(form.pageUrl);

    return (
        <article className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <div className="aspect-[1.91/1] w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <img src={form.imageUrl} alt={form.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{hostname}</p>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">{form.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">{form.description}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{form.siteName}</p>
            </div>
        </article>
    );
}

function TextField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
        </label>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
}) {
    return (
        <label className="block">
            <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function safeHostname(url: string) {
    try {
        return new URL(url).hostname;
    } catch {
        return "example.com";
    }
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
