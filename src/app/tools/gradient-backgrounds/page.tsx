"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gradient {
    name: string;
    css: string;
    tags: string[];
}

type CopyMode = "shorthand" | "property" | "class";

// ─── Category groups ──────────────────────────────────────────────────────────

const CATEGORY_GROUPS = [
    {
        label: "분위기",
        color: "indigo" as const,
        items: [
            { id: "elegant",  label: "우아함" },
            { id: "energy",   label: "에너지" },
            { id: "calm",     label: "차분함" },
            { id: "romantic", label: "낭만" },
            { id: "mystery",  label: "미스터리" },
            { id: "fresh",    label: "신선함" },
            { id: "warm",     label: "따뜻함" },
        ],
    },
    {
        label: "트렌드",
        color: "violet" as const,
        items: [
            { id: "aurora",    label: "오로라" },
            { id: "sunset",    label: "선셋" },
            { id: "neon",      label: "네온" },
            { id: "cyberpunk", label: "사이버펑크" },
            { id: "lofi",      label: "로파이" },
            { id: "y2k",       label: "Y2K" },
            { id: "pastel",    label: "파스텔" },
            { id: "dark",      label: "다크모드" },
        ],
    },
    {
        label: "계절",
        color: "teal" as const,
        items: [
            { id: "spring", label: "봄" },
            { id: "summer", label: "여름" },
            { id: "autumn", label: "가을" },
            { id: "winter", label: "겨울" },
        ],
    },
];

const COLOR_ACTIVE = {
    indigo: "bg-indigo-500/10 border-indigo-400/50 text-indigo-700 dark:text-indigo-400",
    violet: "bg-violet-500/10 border-violet-400/50 text-violet-700 dark:text-violet-400",
    teal:   "bg-teal-500/10 border-teal-400/50 text-teal-700 dark:text-teal-400",
};

// ─── Gradient data ────────────────────────────────────────────────────────────

const GRADIENTS: Gradient[] = [
    // ── 우아함 ──
    { name: "Royal Night",     css: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",    tags: ["elegant", "dark", "mystery"] },
    { name: "Champagne",       css: "linear-gradient(135deg, #f5e6d3 0%, #d4b896 50%, #c9a87c 100%)",    tags: ["elegant", "warm", "lofi"] },
    { name: "Silver Silk",     css: "linear-gradient(to right, #bdc3c7, #2c3e50)",                        tags: ["elegant", "dark"] },
    { name: "Ivory Mist",      css: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",                  tags: ["elegant", "pastel", "warm"] },
    { name: "Onyx",            css: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",    tags: ["elegant", "dark", "mystery"] },
    { name: "Pearl",           css: "linear-gradient(135deg, #e8e8e8 0%, #d4d4d4 50%, #c8c8c8 100%)",    tags: ["elegant", "calm"] },
    { name: "Gold Leaf",       css: "linear-gradient(135deg, #f7d794 0%, #c9a84c 50%, #8B6914 100%)",    tags: ["elegant", "warm", "autumn"] },
    { name: "Midnight Blue",   css: "linear-gradient(to right, #141E30, #243B55)",                        tags: ["elegant", "dark", "mystery"] },
    { name: "Satin",           css: "linear-gradient(135deg, #f8f8f8 0%, #e8e8ec 50%, #d4d4e0 100%)",    tags: ["elegant", "calm", "pastel"] },
    { name: "Velvet Plum",     css: "linear-gradient(135deg, #2d1b69 0%, #6a3093 100%)",                  tags: ["elegant", "mystery", "dark"] },

    // ── 에너지 ──
    { name: "Electric",        css: "linear-gradient(to right, #00c6ff, #0072ff)",                        tags: ["energy", "neon", "cyberpunk"] },
    { name: "Solar Flare",     css: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",                  tags: ["energy", "warm", "sunset"] },
    { name: "Power Red",       css: "linear-gradient(to right, #ff4b2b, #ff416c)",                        tags: ["energy", "warm"] },
    { name: "Voltage",         css: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",                  tags: ["energy", "warm", "sunset"] },
    { name: "Reactor",         css: "linear-gradient(to right, #00f260, #0575e6)",                        tags: ["energy", "neon", "fresh"] },
    { name: "Rush",            css: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",                  tags: ["energy", "neon"] },
    { name: "Plasma",          css: "linear-gradient(to right, #cc2b5e, #753a88)",                        tags: ["energy", "neon", "cyberpunk"] },
    { name: "Thunder",         css: "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",                  tags: ["energy", "dark"] },

    // ── 차분함 ──
    { name: "Morning Mist",    css: "linear-gradient(to bottom, #e0eafc 0%, #cfdef3 100%)",               tags: ["calm", "pastel", "spring"] },
    { name: "Serenity",        css: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",                  tags: ["calm", "pastel", "romantic"] },
    { name: "Cloud Nine",      css: "linear-gradient(to bottom, #f0f4fd 0%, #d9e4ff 100%)",               tags: ["calm", "pastel", "winter"] },
    { name: "Still Water",     css: "linear-gradient(to right, #93a5cf, #e4efe9)",                        tags: ["calm", "cool"] },
    { name: "Breathing",       css: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",                  tags: ["calm", "pastel", "lofi"] },
    { name: "Pale Sky",        css: "linear-gradient(to bottom, #def9fc 0%, #bef3f5 100%)",               tags: ["calm", "fresh", "spring"] },
    { name: "Misty Shore",     css: "linear-gradient(to right, #89f7fe, #66a6ff)",                        tags: ["calm", "fresh", "summer"] },
    { name: "Soft Lilac",      css: "linear-gradient(to right, #d4b8e0, #b8cce4)",                        tags: ["calm", "pastel", "lofi"] },
    { name: "Ocean Floor",     css: "linear-gradient(to bottom, #1a5276 0%, #2e86c1 50%, #7fb3d3 100%)", tags: ["calm", "dark", "mystery"] },
    { name: "Fog",             css: "linear-gradient(to right, #d7dde8, #757f9a)",                        tags: ["calm", "mystery", "winter"] },

    // ── 낭만 ──
    { name: "Rose Gold",       css: "linear-gradient(135deg, #f7c5c5 0%, #e8a0bf 50%, #c9a0dc 100%)",    tags: ["romantic", "pastel", "y2k"] },
    { name: "Cherry Blossom",  css: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)",    tags: ["romantic", "spring", "warm"] },
    { name: "Velvet Kiss",     css: "linear-gradient(to right, #d1447f, #ff7597)",                        tags: ["romantic", "energy"] },
    { name: "Sunset Romance",  css: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",                  tags: ["romantic", "sunset", "pastel"] },
    { name: "Sweet Lilac",     css: "linear-gradient(to right, #c7bef5, #f5bef3)",                        tags: ["romantic", "pastel", "lofi"] },
    { name: "Peach Blossom",   css: "linear-gradient(135deg, #ffb7c5 0%, #ffd1dc 100%)",                  tags: ["romantic", "pastel", "spring"] },
    { name: "Coral Dream",     css: "linear-gradient(to right, #fd7fa6, #fbb961)",                        tags: ["romantic", "warm", "sunset"] },
    { name: "Cotton Candy",    css: "linear-gradient(135deg, #f6d5f7 0%, #fbe9d7 100%)",                  tags: ["romantic", "pastel", "y2k"] },
    { name: "Orchid",          css: "linear-gradient(135deg, #da22ff 0%, #9733ee 100%)",                  tags: ["romantic", "neon"] },
    { name: "Blush",           css: "linear-gradient(to right, #ffb6c1, #ffc8dd, #ffafcc)",               tags: ["romantic", "pastel", "calm"] },

    // ── 미스터리 ──
    { name: "Void",            css: "linear-gradient(to right, #0f0c29, #302b63, #24243e)",               tags: ["mystery", "dark", "cyberpunk"] },
    { name: "Purple Haze",     css: "linear-gradient(to right, #2d2d44, #614385)",                        tags: ["mystery", "dark", "elegant"] },
    { name: "Deep Ocean",      css: "linear-gradient(135deg, #000428 0%, #004e92 100%)",                  tags: ["mystery", "dark"] },
    { name: "Shadow",          css: "linear-gradient(to right, #1f1c18, #3d3521)",                        tags: ["mystery", "dark"] },
    { name: "Eclipse",         css: "linear-gradient(135deg, #2c1654 0%, #3b4371 100%)",                  tags: ["mystery", "dark", "aurora"] },
    { name: "Raven",           css: "linear-gradient(135deg, #16213e 0%, #0f3460 50%, #533483 100%)",    tags: ["mystery", "dark", "aurora"] },
    { name: "Abyss",           css: "linear-gradient(to bottom, #000000 0%, #130f40 100%)",               tags: ["mystery", "dark"] },
    { name: "Smoke",           css: "linear-gradient(to right, #29323c, #485563)",                        tags: ["mystery", "dark", "elegant"] },

    // ── 신선함 ──
    { name: "Mint Breeze",     css: "linear-gradient(to right, #43e97b, #38f9d7)",                        tags: ["fresh", "summer", "neon"] },
    { name: "Spring Burst",    css: "linear-gradient(135deg, #c6f9d1 0%, #a8f0d4 100%)",                  tags: ["fresh", "spring", "pastel"] },
    { name: "Aqua Clear",      css: "linear-gradient(to right, #00d2ff, #3a7bd5)",                        tags: ["fresh", "summer", "calm"] },
    { name: "Jungle",          css: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",                  tags: ["fresh", "summer", "energy"] },
    { name: "Ocean Breeze",    css: "linear-gradient(to right, #00f2fe, #4facfe)",                        tags: ["fresh", "summer", "neon"] },
    { name: "Spearmint",       css: "linear-gradient(to right, #79cbca, #e684ae)",                        tags: ["fresh", "romantic"] },
    { name: "Lime Splash",     css: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",                  tags: ["fresh", "calm", "pastel"] },
    { name: "Kiwi",            css: "linear-gradient(135deg, #6dd5fa 0%, #2193b0 100%)",                  tags: ["fresh", "calm"] },

    // ── 네온 / 사이버펑크 ──
    { name: "Neon City",       css: "linear-gradient(135deg, #0f0524 0%, #6b0ac9 50%, #0f0524 100%)",    tags: ["neon", "cyberpunk", "dark", "mystery"] },
    { name: "Cyber Pink",      css: "linear-gradient(to right, #ff00aa, #7000ff)",                        tags: ["neon", "cyberpunk", "energy"] },
    { name: "Acid Rain",       css: "linear-gradient(135deg, #0d0d0d 0%, #00ff41 100%)",                  tags: ["neon", "cyberpunk", "dark"] },
    { name: "Synthwave",       css: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",                  tags: ["neon", "cyberpunk", "aurora"] },
    { name: "Vaporwave",       css: "linear-gradient(to right, #ff6ec7, #7873f5, #4adede)",               tags: ["neon", "y2k", "cyberpunk"] },
    { name: "Cyber Blue",      css: "linear-gradient(135deg, #0061ff 0%, #60efff 100%)",                  tags: ["neon", "cyberpunk", "fresh"] },
    { name: "Glitch",          css: "linear-gradient(135deg, #ff00cc 0%, #333399 100%)",                  tags: ["neon", "cyberpunk"] },
    { name: "Laser",           css: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",                tags: ["neon", "energy", "fresh"] },
    { name: "Ultraviolet",     css: "linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)",                  tags: ["neon", "cyberpunk", "mystery"] },

    // ── 오로라 ──
    { name: "Aurora Borealis", css: "linear-gradient(135deg, #00b4d8 0%, #90e0ef 25%, #48cae4 50%, #0077b6 75%)", tags: ["aurora", "winter", "fresh"] },
    { name: "Northern Lights", css: "linear-gradient(135deg, #0d6e3f 0%, #56b4d3 50%, #9b59b6 100%)",    tags: ["aurora", "winter", "mystery"] },
    { name: "Polar Sky",       css: "linear-gradient(to bottom, #001f3f 0%, #0d6e3f 50%, #56b4d3 100%)", tags: ["aurora", "dark", "winter"] },
    { name: "Celestial",       css: "linear-gradient(135deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)",    tags: ["aurora", "neon", "energy"] },
    { name: "Galaxy",          css: "linear-gradient(135deg, #360033 0%, #0b8793 100%)",                  tags: ["aurora", "dark", "mystery"] },
    { name: "Stardust",        css: "linear-gradient(135deg, #1a1a2e 0%, #4a1942 50%, #6b2d6b 100%)",    tags: ["aurora", "dark", "mystery"] },
    { name: "Solaris",         css: "linear-gradient(to right, #021b79, #0575e6)",                        tags: ["aurora", "dark", "calm"] },
    { name: "Nebula",          css: "linear-gradient(135deg, #1B1464 0%, #a855f7 50%, #ec4899 100%)",    tags: ["aurora", "neon", "mystery"] },

    // ── 선셋 ──
    { name: "Sunset Bliss",    css: "linear-gradient(to right, #FEAC5E, #C779D0, #4BC0C8)",               tags: ["sunset", "warm", "romantic"] },
    { name: "Golden Hour",     css: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",                  tags: ["sunset", "warm", "energy"] },
    { name: "Dusk",            css: "linear-gradient(to right, #ff6b35, #f7c59f)",                        tags: ["sunset", "warm", "autumn"] },
    { name: "Amber Glow",      css: "linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)",                  tags: ["sunset", "warm", "summer"] },
    { name: "Coral Reef",      css: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",                  tags: ["sunset", "warm", "summer", "energy"] },
    { name: "Twilight",        css: "linear-gradient(to right, #a18cd1, #fbc2eb)",                        tags: ["sunset", "romantic", "pastel"] },
    { name: "Burning Sky",     css: "linear-gradient(135deg, #fc4a1a 0%, #f7971e 100%)",                  tags: ["sunset", "energy", "warm"] },
    { name: "Pacific Dream",   css: "linear-gradient(135deg, #34e89e 0%, #0f3443 100%)",                  tags: ["sunset", "fresh", "calm"] },
    { name: "Horizon",         css: "linear-gradient(to bottom, #ff7e5f 0%, #feb47b 50%, #86a8e7 100%)", tags: ["sunset", "warm", "calm"] },
    { name: "Evening Sky",     css: "linear-gradient(135deg, #e96c75 0%, #f7a58d 50%, #fcd0ae 100%)",    tags: ["sunset", "warm", "romantic"] },

    // ── 로파이 ──
    { name: "Lofi Study",      css: "linear-gradient(to bottom, #fddb92 0%, #d1fdff 100%)",               tags: ["lofi", "calm", "pastel"] },
    { name: "Rainy Cafe",      css: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",                  tags: ["lofi", "calm", "pastel", "autumn"] },
    { name: "Vintage Paper",   css: "linear-gradient(to right, #ede7d9, #d4c4a8)",                        tags: ["lofi", "elegant", "warm"] },
    { name: "Lo-Fi Dusk",      css: "linear-gradient(135deg, #b79891 0%, #94716b 100%)",                  tags: ["lofi", "autumn", "calm"] },
    { name: "Dreamy",          css: "linear-gradient(to right, #fccb90, #d57eeb)",                        tags: ["lofi", "romantic", "pastel"] },
    { name: "Cassette",        css: "linear-gradient(135deg, #c9b1bd 0%, #929fd1 100%)",                  tags: ["lofi", "y2k", "pastel"] },
    { name: "Warmth",          css: "linear-gradient(135deg, #ffd3a5 0%, #fd9853 100%)",                  tags: ["lofi", "warm", "autumn"] },

    // ── Y2K ──
    { name: "Disco",           css: "linear-gradient(to right, #ff6ec7, #7873f5)",                        tags: ["y2k", "neon", "romantic"] },
    { name: "Bubble Gum",      css: "linear-gradient(135deg, #ff9de2 0%, #bef9fd 100%)",                  tags: ["y2k", "pastel", "fresh"] },
    { name: "Millennium",      css: "linear-gradient(to right, #614385, #516395)",                        tags: ["y2k", "mystery", "elegant"] },
    { name: "Holographic",     css: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 50%, #a8edea 100%)",    tags: ["y2k", "neon", "pastel"] },
    { name: "Chrome",          css: "linear-gradient(135deg, #e8e8e8 0%, #a0a0a0 25%, #e0e0e0 100%)",    tags: ["y2k", "elegant", "calm"] },
    { name: "Frosted Grape",   css: "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",                  tags: ["y2k", "neon", "romantic"] },

    // ── 파스텔 ──
    { name: "Macaron",         css: "linear-gradient(135deg, #f8d1cc 0%, #d4e8f0 100%)",                  tags: ["pastel", "romantic", "spring"] },
    { name: "Ice Cream",       css: "linear-gradient(to right, #ffdde1, #ee9ca7)",                        tags: ["pastel", "romantic", "summer"] },
    { name: "Powder Blue",     css: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",                  tags: ["pastel", "calm", "winter"] },
    { name: "Soft Peach",      css: "linear-gradient(to right, #ffdab9, #ffb6c1)",                        tags: ["pastel", "warm", "romantic"] },
    { name: "Lavender",        css: "linear-gradient(135deg, #e8d5f5 0%, #cfe0f5 100%)",                  tags: ["pastel", "calm", "lofi"] },
    { name: "Pistachio",       css: "linear-gradient(135deg, #d4f5d4 0%, #b8e8b8 100%)",                  tags: ["pastel", "fresh", "spring"] },

    // ── 다크모드 ──
    { name: "Carbon",          css: "linear-gradient(to right, #1c1c1c, #3a3a3a)",                        tags: ["dark", "mystery", "elegant"] },
    { name: "Graphite",        css: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",    tags: ["dark", "calm", "aurora"] },
    { name: "Night Mode",      css: "linear-gradient(to bottom, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)", tags: ["dark", "mystery"] },
    { name: "Obsidian",        css: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",                  tags: ["dark", "elegant"] },
    { name: "Deep Space",      css: "linear-gradient(to right, #000000, #434343)",                        tags: ["dark", "mystery", "aurora"] },
    { name: "Terminal",        css: "linear-gradient(to right, #000000, #0f9b0f)",                        tags: ["dark", "neon", "cyberpunk"] },
    { name: "Charcoal",        css: "linear-gradient(135deg, #232526 0%, #414345 100%)",                  tags: ["dark", "elegant"] },

    // ── 봄 ──
    { name: "Sakura",          css: "linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)",                  tags: ["spring", "romantic", "pastel"] },
    { name: "Garden",          css: "linear-gradient(to right, #84fab0, #8fd3f4)",                        tags: ["spring", "fresh", "calm"] },
    { name: "April",           css: "linear-gradient(135deg, #f0e6fa 0%, #c8e6f0 100%)",                  tags: ["spring", "calm", "pastel"] },
    { name: "Bloom",           css: "linear-gradient(to right, #f7cac9, #92a8d1)",                        tags: ["spring", "romantic", "calm"] },

    // ── 여름 ──
    { name: "Tropical",        css: "linear-gradient(to right, #11998e, #38ef7d)",                        tags: ["summer", "fresh", "energy"] },
    { name: "Sandy Beach",     css: "linear-gradient(to right, #f9d423, #ff4e50)",                        tags: ["summer", "warm", "sunset", "energy"] },
    { name: "Sea Foam",        css: "linear-gradient(135deg, #00cdac 0%, #8ddad5 100%)",                  tags: ["summer", "fresh", "calm"] },
    { name: "Tropic",          css: "linear-gradient(135deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)",    tags: ["summer", "neon", "energy"] },

    // ── 가을 ──
    { name: "Autumn Leaves",   css: "linear-gradient(135deg, #d4682a 0%, #f7b733 100%)",                  tags: ["autumn", "warm", "energy"] },
    { name: "Maple",           css: "linear-gradient(to right, #d1410c, #f5a623)",                        tags: ["autumn", "warm", "sunset"] },
    { name: "Harvest",         css: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",                  tags: ["autumn", "mystery"] },
    { name: "October",         css: "linear-gradient(to right, #8e9eab, #eef2f3)",                        tags: ["autumn", "calm", "fog"] },
    { name: "Pumpkin",         css: "linear-gradient(135deg, #eb5757 0%, #f8b500 100%)",                  tags: ["autumn", "warm", "energy"] },

    // ── 겨울 ──
    { name: "Frozen",          css: "linear-gradient(to right, #e0f7fa, #b3e5fc, #e1f5fe)",               tags: ["winter", "calm", "fresh"] },
    { name: "Snowfall",        css: "linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%)",               tags: ["winter", "calm", "pastel"] },
    { name: "Arctic",          css: "linear-gradient(135deg, #2980b9 0%, #6dd5fa 50%, #ffffff 100%)",    tags: ["winter", "fresh", "calm"] },
    { name: "Icicle",          css: "linear-gradient(to right, #a1c4fd, #c2e9fb)",                        tags: ["winter", "calm", "pastel"] },
    { name: "Blizzard",        css: "linear-gradient(135deg, #d7d2cc 0%, #304352 100%)",                  tags: ["winter", "dark", "calm"] },
];

// ─── Copy helpers ─────────────────────────────────────────────────────────────

function getCopyText(css: string, mode: CopyMode): string {
    if (mode === "shorthand")  return `background: ${css};`;
    if (mode === "property")   return `background-image: ${css};`;
    return `.element {\n  background: ${css};\n  background-size: cover;\n}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GradientBackgroundsPage() {
    const [activeTag, setActiveTag]   = useState<string>("all");
    const [search, setSearch]         = useState("");
    const [copyMode, setCopyMode]     = useState<CopyMode>("shorthand");
    const [copiedName, setCopiedName] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let list = GRADIENTS;
        if (activeTag !== "all") list = list.filter((g) => g.tags.includes(activeTag));
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((g) => g.name.toLowerCase().includes(q));
        }
        return list;
    }, [activeTag, search]);

    const handleCopy = async (g: Gradient) => {
        await navigator.clipboard.writeText(getCopyText(g.css, copyMode));
        setCopiedName(g.name);
        setTimeout(() => setCopiedName(null), 2000);
    };

    const totalByTag = (tag: string) =>
        GRADIENTS.filter((g) => g.tags.includes(tag)).length;

    return (
        <>
            <PageHeader
                title="CSS 그라데이션 배경"
                description={`${GRADIENTS.length}가지 큐레이션 그라데이션 컬렉션입니다. 분위기·트렌드·계절별로 탐색하고 클릭 한 번으로 CSS 코드를 복사하세요.`}
            />

            {/* ── Controls ── */}
            <div className="mb-6 space-y-4">
                {/* Search + Copy mode */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="그라데이션 이름 검색..."
                            className="w-full pl-9 pr-9 py-2.5 glass-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white placeholder:text-zinc-400"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Copy mode selector */}
                    <div className="flex items-center gap-1 glass-card p-1 rounded-xl self-start">
                        {([ ["shorthand", "background:"], ["property", "background-image:"], ["class", ".class {}"] ] as [CopyMode, string][]).map(([mode, label]) => (
                            <button
                                key={mode}
                                onClick={() => setCopyMode(mode)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                                    copyMode === mode
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category filters */}
                <div className="space-y-3">
                    {/* All */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveTag("all")}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                activeTag === "all"
                                    ? "bg-zinc-800 dark:bg-white border-zinc-800 dark:border-white text-white dark:text-zinc-900"
                                    : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-400 dark:hover:border-zinc-500"
                            )}
                        >
                            전체
                            <span className="ml-1.5 opacity-50 font-normal text-[10px]">{GRADIENTS.length}</span>
                        </button>
                        <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                        {/* Groups */}
                        {CATEGORY_GROUPS.map((group) => (
                            <div key={group.label} className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
                                    {group.label}
                                </span>
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTag(item.id)}
                                        className={cn(
                                            "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                                            activeTag === item.id
                                                ? COLOR_ACTIVE[group.color]
                                                : "bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600"
                                        )}
                                    >
                                        {item.label}
                                        <span className="ml-1 opacity-50 font-normal text-[10px]">{totalByTag(item.id)}</span>
                                    </button>
                                ))}
                                <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5 last:hidden" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Result count */}
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {filtered.length}개 표시 중
                    {activeTag !== "all" && (
                        <button
                            onClick={() => { setActiveTag("all"); setSearch(""); }}
                            className="ml-2 text-indigo-500 hover:underline"
                        >
                            필터 초기화
                        </button>
                    )}
                </p>
            </div>

            {/* ── Grid ── */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map((g) => (
                        <GradientCard
                            key={g.name}
                            gradient={g}
                            isCopied={copiedName === g.name}
                            onCopy={handleCopy}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <span className="text-4xl">🎨</span>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">검색 결과가 없습니다.</p>
                    <button
                        onClick={() => { setActiveTag("all"); setSearch(""); }}
                        className="text-xs text-indigo-500 hover:underline mt-1"
                    >
                        필터 초기화
                    </button>
                </div>
            )}

            {/* ── Copy toast ── */}
            {copiedName && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold px-4 py-2.5 rounded-full shadow-2xl pointer-events-none">
                    <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span className="font-bold">{copiedName}</span> CSS 복사됨
                </div>
            )}
        </>
    );
}

// ─── GradientCard ──────────────────────────────────────────────────────────────

function GradientCard({
    gradient,
    isCopied,
    onCopy,
}: {
    gradient: Gradient;
    isCopied: boolean;
    onCopy: (g: Gradient) => void;
}) {
    return (
        <div
            className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 border border-white/60 dark:border-zinc-800/60"
            onClick={() => onCopy(gradient)}
        >
            {/* Gradient preview */}
            <div
                className="w-full h-44 transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ background: gradient.css }}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 top-0 h-44 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10">
                <span className={cn(
                    "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full shadow-xl backdrop-blur-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300",
                    isCopied
                        ? "bg-emerald-600/95 text-white"
                        : "bg-white/90 text-zinc-900"
                )}>
                    {isCopied ? (
                        <><Check className="w-3.5 h-3.5" /> 복사됨!</>
                    ) : (
                        <><Copy className="w-3.5 h-3.5" /> CSS 복사</>
                    )}
                </span>
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between px-3.5 py-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 z-10">
                <div className="min-w-0 flex-1 mr-2">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate">{gradient.name}</p>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                        {gradient.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <button
                    className={cn(
                        "shrink-0 w-8 h-8 flex items-center justify-center rounded-full border transition-all",
                        isCopied
                            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    )}
                    onClick={(e) => { e.stopPropagation(); onCopy(gradient); }}
                >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
}
