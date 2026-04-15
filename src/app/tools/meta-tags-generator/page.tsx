"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Check, Download, RefreshCw, Search, Share2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type RobotsIndex = "index" | "noindex";
type RobotsFollow = "follow" | "nofollow";
type OgType = "website" | "article" | "product" | "profile";
type TwitterCard = "summary_large_image" | "summary";

interface FormState {
    // Basic
    title: string;
    description: string;
    keywords: string;
    canonicalUrl: string;
    author: string;
    language: string;
    robotsIndex: RobotsIndex;
    robotsFollow: RobotsFollow;
    // OG
    ogTitle: string;
    ogDescription: string;
    ogUrl: string;
    ogType: OgType;
    ogImage: string;
    ogSiteName: string;
    ogLocale: string;
    // Twitter
    twitterCard: TwitterCard;
    twitterSite: string;
    twitterCreator: string;
}

const DEFAULT: FormState = {
    title: "WebGuide - 웹 개발자를 위한 도구 모음",
    description: "HTML, CSS, JSON 등 웹 개발에 필요한 다양한 온라인 도구를 무료로 제공합니다.",
    keywords: "웹 도구, HTML 도구, CSS 도구, JSON 포매터, 색상 변환기",
    canonicalUrl: "https://example.com/",
    author: "WebGuide Team",
    language: "ko",
    robotsIndex: "index",
    robotsFollow: "follow",
    ogTitle: "",
    ogDescription: "",
    ogUrl: "",
    ogType: "website",
    ogImage: "",
    ogSiteName: "WebGuide",
    ogLocale: "ko_KR",
    twitterCard: "summary_large_image",
    twitterSite: "",
    twitterCreator: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(v: string) {
    return v
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function safeHost(url: string) {
    try {
        return new URL(url).hostname || url;
    } catch {
        return url || "example.com";
    }
}

function buildMetaTags(f: FormState): string {
    const lines: string[] = [];

    // charset + viewport always
    lines.push(`<meta charset="UTF-8" />`);
    lines.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`);

    if (f.title) lines.push(`<title>${esc(f.title)}</title>`);
    if (f.description) lines.push(`<meta name="description" content="${esc(f.description)}" />`);
    if (f.keywords) lines.push(`<meta name="keywords" content="${esc(f.keywords)}" />`);
    if (f.author) lines.push(`<meta name="author" content="${esc(f.author)}" />`);
    if (f.language) lines.push(`<meta http-equiv="Content-Language" content="${esc(f.language)}" />`);
    lines.push(`<meta name="robots" content="${f.robotsIndex}, ${f.robotsFollow}" />`);
    if (f.canonicalUrl) lines.push(`<link rel="canonical" href="${esc(f.canonicalUrl)}" />`);

    lines.push("");

    // OG
    const ogTitle = f.ogTitle || f.title;
    const ogDescription = f.ogDescription || f.description;
    const ogUrl = f.ogUrl || f.canonicalUrl;

    if (ogTitle) lines.push(`<meta property="og:title" content="${esc(ogTitle)}" />`);
    if (ogDescription) lines.push(`<meta property="og:description" content="${esc(ogDescription)}" />`);
    if (ogUrl) lines.push(`<meta property="og:url" content="${esc(ogUrl)}" />`);
    lines.push(`<meta property="og:type" content="${f.ogType}" />`);
    if (f.ogImage) lines.push(`<meta property="og:image" content="${esc(f.ogImage)}" />`);
    if (f.ogSiteName) lines.push(`<meta property="og:site_name" content="${esc(f.ogSiteName)}" />`);
    if (f.ogLocale) lines.push(`<meta property="og:locale" content="${esc(f.ogLocale)}" />`);

    lines.push("");

    // Twitter
    lines.push(`<meta name="twitter:card" content="${f.twitterCard}" />`);
    if (f.twitterSite) lines.push(`<meta name="twitter:site" content="${esc(f.twitterSite.startsWith("@") ? f.twitterSite : "@" + f.twitterSite)}" />`);
    if (f.twitterCreator) lines.push(`<meta name="twitter:creator" content="${esc(f.twitterCreator.startsWith("@") ? f.twitterCreator : "@" + f.twitterCreator)}" />`);
    if (ogTitle) lines.push(`<meta name="twitter:title" content="${esc(ogTitle)}" />`);
    if (ogDescription) lines.push(`<meta name="twitter:description" content="${esc(ogDescription)}" />`);
    if (f.ogImage) lines.push(`<meta name="twitter:image" content="${esc(f.ogImage)}" />`);

    return lines.join("\n");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
            {children}
        </span>
    );
}

const fieldCls =
    "w-full mt-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/60 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600";

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
                <Label>{label}</Label>
                {hint && <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function CharInput({
    value,
    onChange,
    placeholder,
    max,
    warn,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    max: number;
    warn: [number, number];
}) {
    const len = value.length;
    const color =
        len === 0
            ? "text-zinc-300 dark:text-zinc-600"
            : len < warn[0]
            ? "text-yellow-500"
            : len <= warn[1]
            ? "text-emerald-500"
            : "text-red-500";

    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(fieldCls, "pr-16")}
            />
            <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold", color)}>
                {len}/{max}
            </span>
        </div>
    );
}

function CopyBtn({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                copied
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "복사됨" : "복사"}
        </button>
    );
}

function DownloadBtn({ value }: { value: string }) {
    const handleDownload = () => {
        const html = `<!DOCTYPE html>\n<html lang="ko">\n<head>\n${value
            .split("\n")
            .map((l) => (l ? "  " + l : ""))
            .join("\n")}\n</head>\n<body>\n</body>\n</html>`;
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "meta-tags.html";
        a.click();
        URL.revokeObjectURL(url);
    };
    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-all"
        >
            <Download className="w-3.5 h-3.5" />
            다운로드
        </button>
    );
}

// ─── Previews ─────────────────────────────────────────────────────────────────

function GooglePreview({ f }: { f: FormState }) {
    const title = f.title || "페이지 제목";
    const desc = f.description || "페이지 설명이 여기에 표시됩니다.";
    const url = f.canonicalUrl || "https://example.com";
    const host = safeHost(url);
    const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

    const titleOk = f.title.length >= 30 && f.title.length <= 60;
    const descOk = f.description.length >= 80 && f.description.length <= 160;

    return (
        <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Google 검색 결과 미리보기
            </p>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 p-4 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />
                    <div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{f.ogSiteName || host}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 truncate">{displayUrl}</p>
                    </div>
                </div>
                <p className="text-[#1a0dab] dark:text-[#8ab4f8] text-base font-medium hover:underline cursor-pointer leading-snug line-clamp-1">
                    {title}
                </p>
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {desc}
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border", titleOk ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" : "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20")}>
                    제목 {f.title.length}자 {titleOk ? "✓" : `(권장 30~60자)`}
                </span>
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border", descOk ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" : "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20")}>
                    설명 {f.description.length}자 {descOk ? "✓" : `(권장 80~160자)`}
                </span>
            </div>
        </div>
    );
}

function SnsPreview({ f }: { f: FormState }) {
    const title = f.ogTitle || f.title || "페이지 제목";
    const desc = f.ogDescription || f.description || "페이지 설명이 여기에 표시됩니다.";
    const url = f.ogUrl || f.canonicalUrl;
    const host = safeHost(url);

    return (
        <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                SNS 공유 카드 미리보기
            </p>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/60 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
                <div
                    className={cn(
                        "w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800",
                        f.ogImage ? "aspect-[1.91/1]" : "h-28"
                    )}
                >
                    {f.ogImage ? (
                        <img
                            src={f.ogImage}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">og:image 미설정</p>
                    )}
                </div>
                <div className="p-4 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{host}</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">{title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{desc}</p>
                </div>
            </div>
        </div>
    );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

type InputTab = "basic" | "og" | "twitter";
type PreviewTab = "google" | "sns" | "code";

function TabBtn({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                active
                    ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            )}
        >
            {children}
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MetaTagsGeneratorPage() {
    const [form, setForm] = useState<FormState>(DEFAULT);
    const [inputTab, setInputTab] = useState<InputTab>("basic");
    const [previewTab, setPreviewTab] = useState<PreviewTab>("google");

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const metaCode = useMemo(() => buildMetaTags(form), [form]);

    return (
        <>
            <PageHeader
                title="Meta Tags 생성기"
                description="SEO 기본 태그, Open Graph, Twitter Card를 한 번에 생성하세요."
            />

            <div className="flex flex-col xl:flex-row gap-5">
                {/* ── Left: Input Panel ── */}
                <div className="xl:w-[480px] flex-shrink-0 flex flex-col gap-4">
                    {/* Input Tabs */}
                    <div className="flex gap-1 p-1 bg-zinc-100/80 dark:bg-zinc-800/60 rounded-2xl">
                        <TabBtn active={inputTab === "basic"} onClick={() => setInputTab("basic")}>
                            기본 SEO
                        </TabBtn>
                        <TabBtn active={inputTab === "og"} onClick={() => setInputTab("og")}>
                            Open Graph
                        </TabBtn>
                        <TabBtn active={inputTab === "twitter"} onClick={() => setInputTab("twitter")}>
                            Twitter
                        </TabBtn>
                    </div>

                    <div className="glass-card p-5 flex flex-col gap-4">
                        {/* ── Basic SEO ── */}
                        {inputTab === "basic" && (
                            <>
                                <Field label="페이지 제목" hint="권장 30~60자">
                                    <CharInput
                                        value={form.title}
                                        onChange={(v) => set("title", v)}
                                        placeholder="홈페이지 제목을 입력하세요"
                                        max={80}
                                        warn={[30, 60]}
                                    />
                                </Field>

                                <Field label="메타 설명" hint="권장 80~160자">
                                    <div className="relative">
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => set("description", e.target.value)}
                                            placeholder="페이지 내용을 간략하게 설명하세요"
                                            rows={3}
                                            className={cn(fieldCls, "resize-none pb-6")}
                                        />
                                        <span
                                            className={cn(
                                                "absolute right-3 bottom-2.5 text-[10px] font-mono font-bold",
                                                form.description.length === 0
                                                    ? "text-zinc-300 dark:text-zinc-600"
                                                    : form.description.length < 80
                                                    ? "text-yellow-500"
                                                    : form.description.length <= 160
                                                    ? "text-emerald-500"
                                                    : "text-red-500"
                                            )}
                                        >
                                            {form.description.length}/160
                                        </span>
                                    </div>
                                </Field>

                                <Field label="키워드" hint="쉼표로 구분 (선택)">
                                    <input
                                        type="text"
                                        value={form.keywords}
                                        onChange={(e) => set("keywords", e.target.value)}
                                        placeholder="키워드1, 키워드2, 키워드3"
                                        className={fieldCls}
                                    />
                                </Field>

                                <Field label="캐노니컬 URL">
                                    <input
                                        type="url"
                                        value={form.canonicalUrl}
                                        onChange={(e) => set("canonicalUrl", e.target.value)}
                                        placeholder="https://example.com/page"
                                        className={fieldCls}
                                    />
                                </Field>

                                <Field label="작성자">
                                    <input
                                        type="text"
                                        value={form.author}
                                        onChange={(e) => set("author", e.target.value)}
                                        placeholder="홍길동"
                                        className={fieldCls}
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="로봇 색인">
                                        <select
                                            value={form.robotsIndex}
                                            onChange={(e) => set("robotsIndex", e.target.value as RobotsIndex)}
                                            className={fieldCls}
                                        >
                                            <option value="index">index</option>
                                            <option value="noindex">noindex</option>
                                        </select>
                                    </Field>
                                    <Field label="로봇 링크">
                                        <select
                                            value={form.robotsFollow}
                                            onChange={(e) => set("robotsFollow", e.target.value as RobotsFollow)}
                                            className={fieldCls}
                                        >
                                            <option value="follow">follow</option>
                                            <option value="nofollow">nofollow</option>
                                        </select>
                                    </Field>
                                </div>

                                <Field label="언어">
                                    <select
                                        value={form.language}
                                        onChange={(e) => set("language", e.target.value)}
                                        className={fieldCls}
                                    >
                                        <option value="ko">한국어 (ko)</option>
                                        <option value="en">영어 (en)</option>
                                        <option value="ja">일본어 (ja)</option>
                                        <option value="zh">중국어 (zh)</option>
                                        <option value="es">스페인어 (es)</option>
                                        <option value="fr">프랑스어 (fr)</option>
                                        <option value="de">독일어 (de)</option>
                                    </select>
                                </Field>
                            </>
                        )}

                        {/* ── Open Graph ── */}
                        {inputTab === "og" && (
                            <>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-700/60">
                                    비워두면 기본 SEO 값이 자동으로 사용됩니다.
                                </p>

                                <Field label="og:title" hint="선택 — 비우면 제목 사용">
                                    <CharInput
                                        value={form.ogTitle}
                                        onChange={(v) => set("ogTitle", v)}
                                        placeholder={form.title || "og 제목 (비우면 기본 제목 사용)"}
                                        max={80}
                                        warn={[30, 60]}
                                    />
                                </Field>

                                <Field label="og:description" hint="선택 — 비우면 설명 사용">
                                    <textarea
                                        value={form.ogDescription}
                                        onChange={(e) => set("ogDescription", e.target.value)}
                                        placeholder={form.description || "og 설명 (비우면 기본 설명 사용)"}
                                        rows={3}
                                        className={cn(fieldCls, "resize-none")}
                                    />
                                </Field>

                                <Field label="og:url" hint="선택 — 비우면 canonical 사용">
                                    <input
                                        type="url"
                                        value={form.ogUrl}
                                        onChange={(e) => set("ogUrl", e.target.value)}
                                        placeholder={form.canonicalUrl || "https://example.com/page"}
                                        className={fieldCls}
                                    />
                                </Field>

                                <Field label="og:image" hint="권장 1200×630px">
                                    <input
                                        type="url"
                                        value={form.ogImage}
                                        onChange={(e) => set("ogImage", e.target.value)}
                                        placeholder="https://example.com/thumbnail.jpg"
                                        className={fieldCls}
                                    />
                                </Field>

                                <Field label="og:site_name">
                                    <input
                                        type="text"
                                        value={form.ogSiteName}
                                        onChange={(e) => set("ogSiteName", e.target.value)}
                                        placeholder="My Website"
                                        className={fieldCls}
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="og:type">
                                        <select
                                            value={form.ogType}
                                            onChange={(e) => set("ogType", e.target.value as OgType)}
                                            className={fieldCls}
                                        >
                                            <option value="website">website</option>
                                            <option value="article">article</option>
                                            <option value="product">product</option>
                                            <option value="profile">profile</option>
                                        </select>
                                    </Field>
                                    <Field label="og:locale">
                                        <select
                                            value={form.ogLocale}
                                            onChange={(e) => set("ogLocale", e.target.value)}
                                            className={fieldCls}
                                        >
                                            <option value="ko_KR">ko_KR</option>
                                            <option value="en_US">en_US</option>
                                            <option value="en_GB">en_GB</option>
                                            <option value="ja_JP">ja_JP</option>
                                            <option value="zh_CN">zh_CN</option>
                                            <option value="zh_TW">zh_TW</option>
                                        </select>
                                    </Field>
                                </div>
                            </>
                        )}

                        {/* ── Twitter Card ── */}
                        {inputTab === "twitter" && (
                            <>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-700/60">
                                    Twitter Card는 og: 값을 자동으로 상속합니다.
                                </p>

                                <Field label="twitter:card">
                                    <select
                                        value={form.twitterCard}
                                        onChange={(e) => set("twitterCard", e.target.value as TwitterCard)}
                                        className={fieldCls}
                                    >
                                        <option value="summary_large_image">summary_large_image (큰 이미지)</option>
                                        <option value="summary">summary (작은 이미지)</option>
                                    </select>
                                </Field>

                                <Field label="twitter:site" hint="사이트 트위터 계정">
                                    <input
                                        type="text"
                                        value={form.twitterSite}
                                        onChange={(e) => set("twitterSite", e.target.value)}
                                        placeholder="@yourbrand"
                                        className={fieldCls}
                                    />
                                </Field>

                                <Field label="twitter:creator" hint="작성자 트위터 계정">
                                    <input
                                        type="text"
                                        value={form.twitterCreator}
                                        onChange={(e) => set("twitterCreator", e.target.value)}
                                        placeholder="@author"
                                        className={fieldCls}
                                    />
                                </Field>

                                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 p-3 space-y-1.5">
                                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">자동 상속 값</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">제목: {form.ogTitle || form.title || "—"}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">설명: {form.ogDescription || form.description || "—"}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">이미지: {form.ogImage || "—"}</p>
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => setForm(DEFAULT)}
                            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mt-1 w-fit"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            기본값으로 초기화
                        </button>
                    </div>
                </div>

                {/* ── Right: Preview + Code ── */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Preview Tabs */}
                    <div className="flex gap-1 p-1 bg-zinc-100/80 dark:bg-zinc-800/60 rounded-2xl">
                        <TabBtn active={previewTab === "google"} onClick={() => setPreviewTab("google")}>
                            <Search className="w-3.5 h-3.5" /> Google 미리보기
                        </TabBtn>
                        <TabBtn active={previewTab === "sns"} onClick={() => setPreviewTab("sns")}>
                            <Share2 className="w-3.5 h-3.5" /> SNS 카드
                        </TabBtn>
                        <TabBtn active={previewTab === "code"} onClick={() => setPreviewTab("code")}>
                            <Code2 className="w-3.5 h-3.5" /> 코드
                        </TabBtn>
                    </div>

                    <div className="glass-card p-5 flex-1">
                        {previewTab === "google" && <GooglePreview f={form} />}
                        {previewTab === "sns" && <SnsPreview f={form} />}
                        {previewTab === "code" && (
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                        생성된 메타 태그
                                    </p>
                                    <div className="flex gap-2">
                                        <CopyBtn value={metaCode} />
                                        <DownloadBtn value={metaCode} />
                                    </div>
                                </div>
                                <pre className="flex-1 bg-zinc-900 dark:bg-zinc-950 text-zinc-200 rounded-2xl p-4 text-xs leading-relaxed overflow-auto font-mono whitespace-pre-wrap break-all min-h-[400px]">
                                    {metaCode}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Always-visible code copy shortcut */}
                    {previewTab !== "code" && (
                        <div className="glass-card p-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">코드 준비 완료</p>
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                    {metaCode.split("\n").filter(Boolean).length}줄의 메타 태그가 생성되었습니다.
                                </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <CopyBtn value={metaCode} />
                                <DownloadBtn value={metaCode} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
