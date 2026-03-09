"use client";

import Link from "next/link";
import {
    Code,
    FileText,
    Palette,
    Type,
    Binary,
    Link as LinkIcon,
    QrCode,
    Clock,
    Paintbrush,
    Layers,
    MousePointer2,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
    const tools: Tool[] = [
        {
            title: "HTML 특수문자 변환",
            desc: "HTML 엔티티를 쉽게 제거하거나 변환하세요.",
            href: "/tools/html-chars",
            icon: Code,
            color: "indigo",
        },
        {
            title: "JSON 포매터",
            desc: "JSON 데이터를 포맷, 검증 및 정렬하세요.",
            href: "/tools/json-formatter",
            icon: FileText,
            color: "orange",
        },
        {
            title: "색상 변환기",
            desc: "HEX, RGB, HSL 형식을 쉽게 변환하세요.",
            href: "/tools/color-converter",
            icon: Palette,
            color: "pink",
        },
        {
            title: "텍스트 변환기",
            desc: "대문자, 소문자, 텍스트 치환 등 다양한 변환을 지원합니다.",
            href: "/tools/text-transformer",
            icon: Type,
            color: "blue",
        },
        {
            title: "Base64 변환기",
            desc: "Base64 문자열을 안전하게 인코딩 또는 디코딩하세요.",
            href: "/tools/base64",
            icon: Binary,
            color: "emerald",
        },
        {
            title: "URL 인코더",
            desc: "URI 구성요소를 빠르게 인코딩 또는 디코딩하세요.",
            href: "/tools/url-encoder",
            icon: LinkIcon,
            color: "cyan",
        },
        {
            title: "QR 코드 생성기",
            desc: "즉시 사용 가능한 QR 코드를 생성하세요.",
            href: "/tools/qr-generator",
            icon: QrCode,
            color: "fuchsia",
        },
        {
            title: "타임스탬프 변환기",
            desc: "Unix 에포크 시간을 읽기 쉬운 형식으로 변환하세요.",
            href: "/tools/timestamp",
            icon: Clock,
            color: "amber",
        },
        {
            title: "CSS 그라데이션",
            desc: "사용자 지정 CSS 그라데이션을 쉽게 시각화하고 코드를 복사하세요.",
            href: "/tools/css-gradient",
            icon: Paintbrush,
            color: "teal",
        },
        {
            title: "CSS 그라데이션 배경",
            desc: "영감을 주는 아름다운 CSS 그라데이션 프리셋들을 모아놓은 갤러리입니다.",
            href: "/tools/gradient-backgrounds",
            icon: Layers,
            color: "rose",
        },
        {
            title: "이미지 맵핑",
            desc: "이미지 위에 클릭 가능한 영역을 정의하고 HTML 코드를 생성하세요.",
            href: "/tools/image-map",
            icon: MousePointer2,
            color: "yellow",
        },
    ];

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <section>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    WebTools 프리미엄 공구함 👋
                </h1>
                <p className="text-sm text-gray-400 dark:text-zinc-500 max-w-2xl font-medium">
                    웹개발과 디자인을 위한 가장 강력하고 아름다운 유틸리티 모음입니다.
                    모든 도구는 클라이언트 사이드에서 안전하게 작동합니다.
                </p>
            </section>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool) => (
                    <ToolCard key={tool.href} tool={tool} />
                ))}
            </div>
        </div>
    );
}

interface Tool {
    title: string;
    desc: string;
    href: string;
    icon: React.ElementType;
    color: string;
}

function ToolCard({ tool }: { tool: Tool }) {
    const Icon = tool.icon;

    return (
        <Link
            href={tool.href}
            className="glass-card glass-hover p-8 group flex flex-col justify-between min-h-[220px]"
        >
            <div className="flex items-center justify-between mb-6">
                <div className={cn(
                    "w-14 h-14 rounded-[20px] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md",
                    getColorClasses(tool.color)
                )}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-full glass border border-white/40 text-gray-400 dark:text-zinc-500 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300">
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
            <div>
                <h3 className="text-[19px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                    {tool.title}
                </h3>
                <p className="text-[13px] text-gray-400 dark:text-zinc-500 leading-relaxed font-medium">
                    {tool.desc}
                </p>
            </div>
        </Link>
    );
}

function getColorClasses(color: string) {
    const classes: Record<string, string> = {
        indigo: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
        orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
        pink: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
        blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
        cyan: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
        fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400",
        amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
        teal: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
        rose: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
        yellow: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
    };
    return classes[color] || "bg-gray-500/10 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400";
}
