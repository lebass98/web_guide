"use client";

import { useState, useMemo, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
    Copy, Check, Play, Pause, RotateCcw, MousePointer2, Pointer, Repeat,
    Sparkles, ArrowUpRight, Heart, Bell, Zap, Maximize2, Minimize2, MoveRight,
    Layers, Fingerprint, Rocket, Activity, Sun, Ghost, RefreshCw, Wifi,
    Anchor, Aperture, Archive, Clock, Cloud, Compass, Eye, LifeBuoy,
    Move, Navigation, PenTool, Shield, Sliders, Target, Trash2, Wind,
    ZoomOut, RotateCw, Shuffle, Loader,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { AngleDial } from "@/components/ui/AngleDial";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TriggerType = "infinite" | "hover" | "active";
type PresetTab   = "all" | TriggerType;

interface AnimConfig {
    trigger: TriggerType;
    duration: number;
    timingFunction: string;
    delay: number;
    iterationCount: string;
    direction: string;
    fillMode: string;
    translateX: number;
    translateY: number;
    rotate: number;
    scale: number;
    opacity: number;
    shadow: number;
    blur: number;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT: AnimConfig = {
    trigger: "hover",
    duration: 0.4,
    timingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    delay: 0,
    iterationCount: "infinite",
    direction: "alternate",
    fillMode: "both",
    translateX: 0,
    translateY: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    shadow: 0,
    blur: 0,
};

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS = [
    // 호버 효과
    { name: "부드럽게 떠오름",  icon: ArrowUpRight, trigger: "hover" as TriggerType, config: { translateY: -12, scale: 1.05, shadow: 25, duration: 0.4, timingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" } },
    { name: "스프링 팝업",      icon: Maximize2,    trigger: "hover" as TriggerType, config: { scale: 1.2, duration: 0.35, timingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" } },
    { name: "오른쪽 슬라이드",  icon: MoveRight,    trigger: "hover" as TriggerType, config: { translateX: 25, duration: 0.3, timingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" } },
    { name: "네온 글로우",       icon: Sparkles,    trigger: "hover" as TriggerType, config: { scale: 1.02, shadow: 55, duration: 0.5, timingFunction: "ease-in-out" } },
    { name: "입체 기울기",       icon: Layers,    trigger: "hover" as TriggerType, config: { scale: 1.1, rotate: -3, shadow: 40, duration: 0.4, timingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" } },
    { name: "사라짐",            icon: Ghost,    trigger: "hover" as TriggerType, config: { opacity: 0.15, scale: 0.95, duration: 0.4, timingFunction: "ease" } },
    { name: "블러 효과",         icon: Eye,    trigger: "hover" as TriggerType, config: { blur: 5, opacity: 0.7, duration: 0.4 } },
    { name: "사선 이동",         icon: Navigation,    trigger: "hover" as TriggerType, config: { translateX: 15, translateY: -15, duration: 0.3 } },
    { name: "강한 그림자",       icon: Shield,    trigger: "hover" as TriggerType, config: { shadow: 100, translateY: -5, duration: 0.3 } },
    { name: "회전 확대",         icon: RefreshCw,    trigger: "hover" as TriggerType, config: { rotate: 15, scale: 1.15, duration: 0.5 } },
    { name: "살짝 기울기",       icon: Sliders,    trigger: "hover" as TriggerType, config: { rotate: 5, translateX: 5, duration: 0.2 } },
    { name: "아래로 가라앉음",   icon: ZoomOut,    trigger: "hover" as TriggerType, config: { scale: 0.9, translateY: 8, duration: 0.3, timingFunction: "ease-in" } },

    // 클릭 효과
    { name: "눌리는 버튼",       icon: Minimize2,   trigger: "active" as TriggerType, config: { scale: 0.88, translateY: 3, shadow: 4, duration: 0.12, timingFunction: "ease-out" } },
    { name: "전기 충격",         icon: Zap,   trigger: "active" as TriggerType, config: { scale: 1.12, rotate: 6, shadow: 40, duration: 0.1, timingFunction: "linear" } },
    { name: "로켓 발사",         icon: Rocket,   trigger: "active" as TriggerType, config: { translateY: -120, opacity: 0, scale: 0.6, duration: 0.5, timingFunction: "ease-in" } },
    { name: "파괴 효과",         icon: Trash2,   trigger: "active" as TriggerType, config: { scale: 0, opacity: 0, rotate: 45, duration: 0.4 } },
    { name: "강한 반발",         icon: Target,   trigger: "active" as TriggerType, config: { scale: 1.35, opacity: 0.5, duration: 0.3, timingFunction: "ease-out" } },
    { name: "살짝 눌림",         icon: PenTool,   trigger: "active" as TriggerType, config: { translateY: 2, shadow: 2, scale: 0.98, duration: 0.06 } },
    { name: "회전하며 사라짐",   icon: RotateCw,   trigger: "active" as TriggerType, config: { rotate: -360, scale: 0, opacity: 0, duration: 0.6 } },
    { name: "깊은 압축",         icon: Archive,   trigger: "active" as TriggerType, config: { scale: 0.7, opacity: 0.85, duration: 0.2 } },

    // 루프 애니메이션
    { name: "회전 루프",         icon: Repeat, trigger: "infinite" as TriggerType, config: { rotate: 360, duration: 4, timingFunction: "linear", direction: "normal" } },
    { name: "심장 박동",         icon: Heart, trigger: "infinite" as TriggerType, config: { scale: 1.18, duration: 0.7, direction: "alternate", timingFunction: "cubic-bezier(0.4, 0, 0.6, 1)" } },
    { name: "부유 효과",         icon: ArrowUpRight, trigger: "infinite" as TriggerType, config: { translateY: -20, duration: 2, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "벨 알림",           icon: Bell, trigger: "infinite" as TriggerType, config: { rotate: 14, duration: 0.12, direction: "alternate", timingFunction: "linear" } },
    { name: "맥박",              icon: Activity, trigger: "infinite" as TriggerType, config: { scale: 1.08, opacity: 0.7, shadow: 20, duration: 0.8, direction: "alternate" } },
    { name: "무한 호흡",         icon: Wind, trigger: "infinite" as TriggerType, config: { scale: 1.05, opacity: 0.6, blur: 2, duration: 2, direction: "alternate" } },
    { name: "통통 튀기",         icon: LifeBuoy, trigger: "infinite" as TriggerType, config: { translateY: -40, scale: 0.9, duration: 0.6, direction: "alternate", timingFunction: "cubic-bezier(0.28, 0.84, 0.42, 1)" } },
    { name: "좌우 흔들기",       icon: Move, trigger: "infinite" as TriggerType, config: { translateX: 15, duration: 1, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "파동 효과",         icon: Wifi, trigger: "infinite" as TriggerType, config: { scale: 1.3, opacity: 0, shadow: 40, duration: 1.5, direction: "normal" } },
    { name: "깜빡임",            icon: Sun, trigger: "infinite" as TriggerType, config: { opacity: 0.1, duration: 0.5, direction: "alternate" } },
    { name: "시계 추",           icon: Clock, trigger: "infinite" as TriggerType, config: { rotate: 30, duration: 1, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "나침반 진동",       icon: Compass, trigger: "infinite" as TriggerType, config: { rotate: 15, duration: 1, direction: "alternate", timingFunction: "cubic-bezier(0.18, 0.89, 0.32, 1.28)" } },
    { name: "흐렸다 맑아짐",     icon: Cloud, trigger: "infinite" as TriggerType, config: { blur: 8, opacity: 0.4, duration: 2, direction: "alternate" } },
    { name: "앵커 유영",         icon: Anchor, trigger: "infinite" as TriggerType, config: { translateX: 10, translateY: 5, rotate: 2, duration: 3, direction: "alternate" } },
    { name: "지문 스캔",         icon: Fingerprint, trigger: "infinite" as TriggerType, config: { opacity: 0.3, scale: 1.15, shadow: 30, duration: 1.5, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "로딩 스핀",         icon: Loader, trigger: "infinite" as TriggerType, config: { rotate: 360, duration: 1, timingFunction: "linear", direction: "normal" } },
    { name: "무한 확대축소",     icon: Shuffle, trigger: "infinite" as TriggerType, config: { scale: 1.5, duration: 2, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "빙글 흔들기",       icon: Aperture, trigger: "infinite" as TriggerType, config: { rotate: 10, scale: 1.1, duration: 0.2, direction: "alternate-reverse" } },
];

// ─── Options ──────────────────────────────────────────────────────────────────

const EASING_OPTIONS = [
    { value: "ease",                                   label: "Ease (기본)" },
    { value: "ease-in",                                label: "Ease In (천천히 시작)" },
    { value: "ease-out",                               label: "Ease Out (천천히 끝)" },
    { value: "ease-in-out",                            label: "Ease In Out (부드럽게)" },
    { value: "linear",                                 label: "Linear (일정한 속도)" },
    { value: "cubic-bezier(0.34, 1.56, 0.64, 1)",     label: "Spring (스프링)" },
    { value: "cubic-bezier(0.68,-0.55,0.265,1.55)",   label: "Back (되튀기)" },
    { value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)","label": "Elastic (탄성)" },
    { value: "cubic-bezier(0.25, 1, 0.5, 1)",         label: "Snap (빠른 멈춤)" },
    { value: "cubic-bezier(0.19, 1, 0.22, 1)",        label: "Expo Out (급격히 감속)" },
];

const ITERATION_OPTIONS  = ["infinite", "1", "2", "3", "5"];
const DIRECTION_OPTIONS  = [
    { value: "normal",           label: "normal (정방향)" },
    { value: "reverse",          label: "reverse (역방향)" },
    { value: "alternate",        label: "alternate (왕복)" },
    { value: "alternate-reverse",label: "alternate-reverse (역왕복)" },
];

const TRIGGER_LABELS: Record<TriggerType, string> = {
    hover:    "호버",
    active:   "클릭",
    infinite: "루프",
};
const TRIGGER_BADGE: Record<TriggerType, string> = {
    hover:    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    active:   "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    infinite: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTransforms(c: AnimConfig): string {
    const t: string[] = [];
    if (c.translateX !== 0) t.push(`translateX(${c.translateX}px)`);
    if (c.translateY !== 0) t.push(`translateY(${c.translateY}px)`);
    if (c.rotate !== 0)     t.push(`rotate(${c.rotate}deg)`);
    if (c.scale !== 1)      t.push(`scale(${c.scale})`);
    return t.join(" ") || "none";
}

function getShadow(val: number, color?: string): string {
    if (val === 0) return "none";
    const c = color ? `${color}44` : "rgba(0,0,0,0.15)";
    return `0 ${val / 3}px ${val}px ${val / 4}px ${c}`;
}

function getFilter(blur: number): string {
    return blur === 0 ? "none" : `blur(${blur}px)`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CssAnimationPage() {
    const { toast } = useToast();
    const [config, setConfig]     = useState<AnimConfig>({ ...DEFAULT });
    const [playing, setPlaying]   = useState(true);
    const [bgColor, setBgColor]   = useState("#6366f1");
    const [tab, setTab]           = useState<PresetTab>("all");
    const [copied, setCopied]     = useState(false);
    const previewKey              = useRef(0); // force re-mount for animation restart

    const update = (key: keyof AnimConfig, value: unknown) =>
        setConfig((p) => ({ ...p, [key]: value }));

    const applyPreset = (preset: typeof PRESETS[number]) => {
        previewKey.current += 1;
        setConfig({
            ...DEFAULT,
            trigger: preset.trigger,
            iterationCount: preset.trigger === "infinite" ? "infinite" : "1",
            direction: preset.config.direction ?? (preset.trigger === "infinite" ? "alternate" : "normal"),
            ...preset.config,
        } as AnimConfig);
        setPlaying(true);
    };

    const reset = () => {
        previewKey.current += 1;
        setConfig({ ...DEFAULT });
        setPlaying(true);
    };

    const cssCode = useMemo((): string => {
        const tr  = getTransforms(config);
        const sh  = getShadow(config.shadow, bgColor);
        const op  = config.opacity !== 1 ? `  opacity: ${config.opacity};` : "";
        const fil = config.blur !== 0    ? `  filter: ${getFilter(config.blur)};` : "";

        if (config.trigger === "infinite") {
            return [
                `@keyframes myAnimation {`,
                `  from {`,
                `    transform: none;`,
                `    box-shadow: none;`,
                `    opacity: 1;`,
                `    filter: none;`,
                `  }`,
                `  to {`,
                `    transform: ${tr};`,
                `    box-shadow: ${sh};`,
                op,
                fil,
                `  }`,
                `}`,
                ``,
                `.element {`,
                `  animation: myAnimation ${config.duration}s ${config.timingFunction}`,
                `             ${config.delay}s ${config.iterationCount}`,
                `             ${config.direction} both;`,
                `}`,
            ].filter((l) => l !== "").join("\n");
        }

        const ps = config.trigger === "hover" ? ":hover" : ":active";
        return [
            `.element {`,
            `  transition: all ${config.duration}s ${config.timingFunction};`,
            `}`,
            ``,
            `.element${ps} {`,
            `  transform: ${tr};`,
            `  box-shadow: ${sh};`,
            op,
            fil,
            `}`,
        ].filter((l) => l !== "").join("\n");
    }, [config, bgColor]);

    const previewStyle = useMemo((): React.CSSProperties => {
        if (config.trigger === "infinite") {
            if (!playing) return { backgroundColor: bgColor };
            return {
                backgroundColor: bgColor,
                animationName: "cssAnimPreview",
                animationDuration: `${config.duration}s`,
                animationTimingFunction: config.timingFunction,
                animationDelay: `${config.delay}s`,
                animationIterationCount: config.iterationCount === "infinite" ? "infinite" : Number(config.iterationCount),
                animationDirection: config.direction as never,
                animationFillMode: "both",
            };
        }
        return { backgroundColor: bgColor, transition: `all ${config.duration}s ${config.timingFunction}` };
    }, [config, bgColor, playing]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(cssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        toast("CSS 코드가 복사되었습니다!", "success");
    };

    const visiblePresets = useMemo(
        () => tab === "all" ? PRESETS : PRESETS.filter((p) => p.trigger === tab),
        [tab]
    );

    const isSelected = (p: typeof PRESETS[number]) =>
        config.trigger === p.trigger &&
        config.translateX === (p.config.translateX ?? 0) &&
        config.translateY === (p.config.translateY ?? 0) &&
        config.rotate     === (p.config.rotate     ?? 0) &&
        config.scale      === (p.config.scale      ?? 1) &&
        config.duration   === (p.config.duration   ?? DEFAULT.duration);

    return (
        <div className="space-y-8 pb-10">
            <style>{`
                @keyframes cssAnimPreview {
                    from { transform: none; box-shadow: none; opacity: 1; filter: none; }
                    to {
                        transform: ${getTransforms(config)};
                        box-shadow: ${getShadow(config.shadow, bgColor)};
                        opacity: ${config.opacity};
                        filter: ${getFilter(config.blur)};
                    }
                }
                .preview-hover:hover {
                    transform: ${config.trigger === "hover" ? getTransforms(config) : "none"} !important;
                    box-shadow: ${config.trigger === "hover" ? getShadow(config.shadow, bgColor) : "none"} !important;
                    opacity: ${config.trigger === "hover" ? config.opacity : 1} !important;
                    filter: ${config.trigger === "hover" ? getFilter(config.blur) : "none"} !important;
                    transition: all ${config.duration}s ${config.timingFunction} !important;
                }
                .preview-active:active {
                    transform: ${config.trigger === "active" ? getTransforms(config) : "none"} !important;
                    box-shadow: ${config.trigger === "active" ? getShadow(config.shadow, bgColor) : "none"} !important;
                    opacity: ${config.trigger === "active" ? config.opacity : 1} !important;
                    filter: ${config.trigger === "active" ? getFilter(config.blur) : "none"} !important;
                    transition: all ${config.duration}s ${config.timingFunction} !important;
                }
            `}</style>

            <PageHeader
                title="CSS 애니메이션 생성기"
                description="프리셋을 클릭해 바로 적용하고, 슬라이더로 세밀하게 조정하세요. 완성된 CSS 코드를 복사해 프로젝트에 바로 붙여넣으세요."
            />

            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">

                <div className="xl:sticky xl:top-24 space-y-4">

                    {/* Preview box */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">미리보기</span>
                            <div className="flex items-center gap-2">
                                {/* Color picker */}
                                <label className="relative cursor-pointer group/color">
                                    <div className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-700 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-600 overflow-hidden">
                                        <div className="w-full h-full" style={{ backgroundColor: bgColor }} />
                                    </div>
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </label>
                                {/* Play/Pause - only for infinite */}
                                {config.trigger === "infinite" && (
                                    <button
                                        onClick={() => setPlaying(!playing)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold glass-card rounded-xl transition-all active:scale-95"
                                    >
                                        {playing
                                            ? <><Pause className="w-3.5 h-3.5 text-amber-500" /> 정지</>
                                            : <><Play  className="w-3.5 h-3.5 text-emerald-500" /> 재생</>
                                        }
                                    </button>
                                )}
                                <button
                                    onClick={reset}
                                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                                    title="초기화"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="flex items-center justify-center h-52 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.06),transparent_70%)]" />
                            <div
                                key={previewKey.current}
                                className={cn(
                                    "w-24 h-24 rounded-2xl shadow-xl z-10 cursor-pointer select-none flex items-center justify-center",
                                    config.trigger === "hover"  && "preview-hover",
                                    config.trigger === "active" && "preview-active"
                                )}
                                style={previewStyle}
                            >
                                {config.trigger === "hover"  && <MousePointer2 className="w-6 h-6 text-white/40" />}
                                {config.trigger === "active" && <Pointer        className="w-6 h-6 text-white/40" />}
                            </div>
                        </div>

                        {/* Current trigger hint */}
                        <div className="flex items-center justify-center py-2.5 border-t border-zinc-100 dark:border-zinc-800 gap-2">
                            <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold border", TRIGGER_BADGE[config.trigger])}>
                                {TRIGGER_LABELS[config.trigger]}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                                {config.trigger === "hover"    && "박스 위에 마우스를 올려보세요"}
                                {config.trigger === "active"   && "박스를 눌러보세요"}
                                {config.trigger === "infinite" && `${config.duration}s 루프 재생 중`}
                            </span>
                        </div>
                    </div>

                    {/* CSS Code */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">생성된 CSS</span>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95",
                                    copied
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                                )}
                            >
                                {copied ? <><Check className="w-3.5 h-3.5" /> 복사됨</> : <><Copy className="w-3.5 h-3.5" /> 복사</>}
                            </button>
                        </div>
                        <pre className="p-4 text-[11.5px] font-mono leading-relaxed overflow-x-auto bg-zinc-950 dark:bg-zinc-900/80 text-indigo-300 max-h-[280px]">
                            <code>{cssCode}</code>
                        </pre>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">프리셋 선택</span>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">{PRESETS.length}개</span>
                            </div>
                            {/* Tab pills */}
                            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl">
                                {([ ["all","전체"], ["hover","호버"], ["active","클릭"], ["infinite","루프"] ] as [PresetTab, string][]).map(([id, label]) => (
                                    <button
                                        key={id}
                                        onClick={() => setTab(id)}
                                        className={cn(
                                            "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                                            tab === id
                                                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Presets grid */}
                        <div className="p-4">
                            {/* Group by trigger when showing all */}
                            {tab === "all" ? (
                                <div className="space-y-5">
                                    {(["hover", "active", "infinite"] as TriggerType[]).map((triggerType) => {
                                        const group = PRESETS.filter((p) => p.trigger === triggerType);
                                        return (
                                            <div key={triggerType}>
                                                <div className="flex items-center gap-2 mb-2.5">
                                                    <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md border", TRIGGER_BADGE[triggerType])}>
                                                        {TRIGGER_LABELS[triggerType]}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400">{group.length}개</span>
                                                </div>
                                                <PresetGrid presets={group} selected={isSelected} onApply={applyPreset} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <PresetGrid presets={visiblePresets} selected={isSelected} onApply={applyPreset} />
                            )}
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">세부 조정</span>
                            <button
                                onClick={reset}
                                className="ml-auto text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" /> 초기화
                            </button>
                        </div>

                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                            <div className="space-y-5">
                                <SectionTitle color="indigo">변형 (Transform)</SectionTitle>

                                {/* Rotate dial + Scale */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <SliderLabel label="회전 각도" value={`${config.rotate}°`} color="indigo" />
                                        <AngleDial angle={config.rotate} onChange={(v) => update("rotate", v)} />
                                    </div>
                                    <div className="space-y-2">
                                        <SliderLabel label="크기 (Scale)" value={`${config.scale.toFixed(2)}×`} color="indigo" />
                                        <input
                                            type="range" min="0" max="3" step="0.01"
                                            value={config.scale}
                                            onChange={(e) => update("scale", Number(e.target.value))}
                                            className="w-full accent-indigo-500 mt-1"
                                        />
                                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                            <span>0</span><span>1</span><span>3</span>
                                        </div>
                                    </div>
                                </div>

                                {[
                                    { key: "translateX", label: "가로 이동 (X)", unit: "px", min: -400, max: 400, step: 1 },
                                    { key: "translateY", label: "세로 이동 (Y)", unit: "px", min: -400, max: 400, step: 1 },
                                    { key: "shadow",     label: "그림자 강도",   unit: "",   min: 0,    max: 200, step: 1 },
                                    { key: "opacity",    label: "투명도",         unit: "",   min: 0,    max: 1,   step: 0.01 },
                                    { key: "blur",       label: "블러 효과",      unit: "px", min: 0,    max: 20,  step: 0.5 },
                                ].map((s) => (
                                    <div key={s.key} className="space-y-1.5">
                                        <SliderLabel
                                            label={s.label}
                                            value={`${config[s.key as keyof AnimConfig]}${s.unit}`}
                                            color="indigo"
                                        />
                                        <input
                                            type="range" min={s.min} max={s.max} step={s.step}
                                            value={config[s.key as keyof AnimConfig] as number}
                                            onChange={(e) => update(s.key as keyof AnimConfig, Number(e.target.value))}
                                            className="w-full accent-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5">
                                <SectionTitle color="violet">타이밍 (Timing)</SectionTitle>

                                {[
                                    { key: "duration", label: "재생 시간", unit: "s", min: 0.05, max: 10, step: 0.05 },
                                    { key: "delay",    label: "딜레이",    unit: "s", min: 0,    max: 5,  step: 0.1 },
                                ].map((s) => (
                                    <div key={s.key} className="space-y-1.5">
                                        <SliderLabel
                                            label={s.label}
                                            value={`${config[s.key as keyof AnimConfig]}${s.unit}`}
                                            color="violet"
                                        />
                                        <input
                                            type="range" min={s.min} max={s.max} step={s.step}
                                            value={config[s.key as keyof AnimConfig] as number}
                                            onChange={(e) => update(s.key as keyof AnimConfig, Number(e.target.value))}
                                            className="w-full accent-violet-500"
                                        />
                                    </div>
                                ))}

                                {/* Easing */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">이징 함수</label>
                                    <select
                                        value={config.timingFunction}
                                        onChange={(e) => update("timingFunction", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                    >
                                        {EASING_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Loop-only options */}
                                {config.trigger === "infinite" && (
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">반복 횟수</label>
                                            <select
                                                value={config.iterationCount}
                                                onChange={(e) => update("iterationCount", e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                            >
                                                {ITERATION_OPTIONS.map((o) => (
                                                    <option key={o} value={o}>{o === "infinite" ? "무한" : `${o}회`}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">방향</label>
                                            <select
                                                value={config.direction}
                                                onChange={(e) => update("direction", e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                            >
                                                {DIRECTION_OPTIONS.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Trigger Mode */}
                                <div className="space-y-2 pt-1">
                                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">인터랙션 모드</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["hover", "active", "infinite"] as TriggerType[]).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => update("trigger", t)}
                                                className={cn(
                                                    "py-2 rounded-xl text-xs font-semibold border transition-all",
                                                    config.trigger === t
                                                        ? TRIGGER_BADGE[t]
                                                        : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                                                )}
                                            >
                                                {TRIGGER_LABELS[t]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PresetGrid({
    presets,
    selected,
    onApply,
}: {
    presets: typeof PRESETS;
    selected: (p: typeof PRESETS[number]) => boolean;
    onApply:  (p: typeof PRESETS[number]) => void;
}) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {presets.map((p) => {
                const Icon = p.icon;
                const sel  = selected(p);
                const badge = TRIGGER_BADGE[p.trigger];
                return (
                    <button
                        key={p.name}
                        onClick={() => onApply(p)}
                        className={cn(
                            "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all active:scale-95 group",
                            sel
                                ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-400 dark:border-indigo-500/60 shadow-sm"
                                : "bg-white/50 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800/70"
                        )}
                    >
                        <div className={cn(
                            "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            sel
                                ? "bg-indigo-500 text-white"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-500"
                        )}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={cn(
                                "text-[12px] font-semibold leading-tight truncate",
                                sel ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                            )}>
                                {p.name}
                            </p>
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 inline-block", badge)}>
                                {TRIGGER_LABELS[p.trigger]}
                            </span>
                        </div>
                        {sel && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    </button>
                );
            })}
        </div>
    );
}

function SectionTitle({ children, color }: { children: React.ReactNode; color: "indigo" | "violet" }) {
    return (
        <div className={cn(
            "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider pb-2 border-b",
            color === "indigo"
                ? "text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20"
                : "text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20"
        )}>
            {children}
        </div>
    );
}

function SliderLabel({ label, value, color }: { label: string; value: string; color: "indigo" | "violet" }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
            <span className={cn("text-[11px] font-mono font-bold", color === "indigo" ? "text-indigo-600 dark:text-indigo-400" : "text-violet-600 dark:text-violet-400")}>
                {value}
            </span>
        </div>
    );
}
