"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { 
    Copy, Play, Pause, MousePointer2, Pointer, Repeat, Sparkles, Box, Layout, 
    ArrowUpRight, Heart, Bell, Zap, Maximize2, Minimize2, MoveRight, Layers, 
    Fingerprint, Rocket, Activity, Sun, Moon, Ghost, RefreshCw, Smartphone, 
    Tablet, Monitor, Wifi, Battery, Search, Settings, Shield, ShoppingCart, 
    Star, Target, Trash2, Umbrella, User, Volume2, Watch, Wind, Anchor, 
    Aperture, Archive, AtSign, Award, Bluetooth, Bold, Book, Bookmark, 
    Briefcase, Calendar, Camera, Cast, CheckCircle, ChevronUp, Chrome, 
    Clipboard, Clock, Cloud, Code, Coffee, Command, Compass, Cpu, CreditCard, 
    Database, Disc, Download, Droplet, Edit, ExternalLink, Eye, Facebook, 
    FastForward, Feather, Figma, FileText, Film, Filter, Flag, Folder, 
    Frown, Gift, GitBranch, Github, Globe, Grid, HardDrive, Hash, Headphones, 
    HelpCircle, Home, Image, Inbox, Info, Instagram, Italic, Key, Laptop, 
    LifeBuoy, Link, Linkedin, List, Loader, Lock, Mail, Map, MapPin, 
    MessageCircle, MessageSquare, Mic, MinusCircle, Monitor as MonitorIcon, 
    MoreHorizontal, MoreVertical, MousePointer, Move, Music, Navigation, 
    Octagon, Package, Paperclip, PauseCircle, PenTool, Percent, Phone, 
    PieChart, PlayCircle, PlusCircle, Pocket, Power, Printer, Radio, 
    RotateCcw, RotateCw, Rss, Save, Scissors, Send, Server, Share2, 
    Shuffle, Sidebar, Sliders, Smartphone as PhoneIcon, Speaker, Square, 
    StopCircle, Sunset, Tag, Terminal, Thermometer, ThumbsDown, ThumbsUp, 
    ToggleLeft, ToggleRight, Wrench, Trash, Trello, TrendingDown, TrendingUp, 
    Triangle, Truck, Tv, Twitter, Type, Umbrella as UmbrellaIcon, Underline, 
    Unlock, Upload, UserCheck, UserMinus, UserPlus, UserX, Users, Video, 
    VideoOff, Voicemail, Volume, Volume1, VolumeX, Watch as WatchIcon, 
    Wifi as WifiIcon, Wind as WindIcon, X, XCircle, XOctagon, XSquare, 
    Youtube, ZapOff, ZoomIn, ZoomOut
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { AngleDial } from "@/components/ui/AngleDial";
import { cn } from "@/lib/utils";

type TriggerType = "infinite" | "hover" | "active";

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

const defaultConfig: AnimConfig = {
    trigger: "infinite",
    duration: 1.0,
    timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
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

const presets = [
    // --- [Hover Presets] ---
    { name: "부드러운 떠오름", icon: Sparkles, config: { ...defaultConfig, trigger: "hover" as TriggerType, translateY: -12, scale: 1.05, shadow: 25, duration: 0.4, timingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" } },
    { name: "네온 글로우", icon: Box, config: { ...defaultConfig, trigger: "hover" as TriggerType, scale: 1.02, shadow: 50, duration: 0.5, timingFunction: "ease-in-out" } },
    { name: "빠른 줌인", icon: Maximize2, config: { ...defaultConfig, trigger: "hover" as TriggerType, scale: 1.2, duration: 0.2, timingFunction: "ease-out" } },
    { name: "부드러운 사라짐", icon: Ghost, config: { ...defaultConfig, trigger: "hover" as TriggerType, opacity: 0.2, scale: 0.95, duration: 0.4, timingFunction: "ease" } },
    { name: "오른쪽 슬라이드", icon: MoveRight, config: { ...defaultConfig, trigger: "hover" as TriggerType, translateX: 25, duration: 0.3, timingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" } },
    { name: "입체 레이어", icon: Layers, config: { ...defaultConfig, trigger: "hover" as TriggerType, scale: 1.1, rotate: -3, shadow: 40, duration: 0.4, timingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" } },
    { name: "태양 광채", icon: Sun, config: { ...defaultConfig, trigger: "hover" as TriggerType, scale: 1.1, rotate: 45, shadow: 70, duration: 0.6, timingFunction: "ease-out" } },
    { name: "달빛 은닉", icon: Moon, config: { ...defaultConfig, trigger: "hover" as TriggerType, opacity: 0.5, translateY: 15, blur: 4, duration: 0.8, timingFunction: "ease-in-out" } },
    { name: "흐릿해짐", icon: Eye, config: { ...defaultConfig, trigger: "hover" as TriggerType, blur: 5, opacity: 0.8, duration: 0.4 } },
    { name: "날카로운 축소", icon: ZoomOut, config: { ...defaultConfig, trigger: "hover" as TriggerType, scale: 0.9, duration: 0.2, timingFunction: "ease-in" } },
    { name: "사선 이동", icon: Navigation, config: { ...defaultConfig, trigger: "hover" as TriggerType, translateX: 15, translateY: -15, duration: 0.3 } },
    { name: "강력한 그림자", icon: Shield, config: { ...defaultConfig, trigger: "hover" as TriggerType, shadow: 100, translateY: -5, duration: 0.3 } },
    { name: "회전 확대", icon: RefreshCw, config: { ...defaultConfig, trigger: "hover" as TriggerType, rotate: 180, scale: 1.2, duration: 0.5 } },
    { name: "살짝 기울기", icon: Sliders, config: { ...defaultConfig, trigger: "hover" as TriggerType, rotate: 5, translateX: 5, duration: 0.2 } },
    { name: "흔들림 (반응)", icon: Smartphone, config: { ...defaultConfig, trigger: "hover" as TriggerType, translateX: 5, rotate: 2, duration: 0.1, timingFunction: "linear" } },
    { name: "서서히 밝게", icon: Aperture, config: { ...defaultConfig, trigger: "hover" as TriggerType, opacity: 1, scale: 1.05, duration: 0.5 } },

    // --- [Active Presets] ---
    { name: "통통 튀는 클릭", icon: Pointer, config: { ...defaultConfig, trigger: "active" as TriggerType, scale: 0.85, duration: 0.15, timingFunction: "ease-out" } },
    { name: "전기 충격", icon: Zap, config: { ...defaultConfig, trigger: "active" as TriggerType, scale: 1.15, rotate: 8, shadow: 40, duration: 0.1, timingFunction: "linear" } },
    { name: "중력 하강", icon: Minimize2, config: { ...defaultConfig, trigger: "active" as TriggerType, translateY: 8, scale: 0.96, shadow: 5, duration: 0.1, timingFunction: "ease-in" } },
    { name: "로켓 발사", icon: Rocket, config: { ...defaultConfig, trigger: "active" as TriggerType, translateY: -150, opacity: 0, scale: 0.5, duration: 0.5, timingFunction: "ease-in" } },
    { name: "깊은 압축", icon: Archive, config: { ...defaultConfig, trigger: "active" as TriggerType, scale: 0.7, opacity: 0.9, duration: 0.2 } },
    { name: "분쇄 효과", icon: Trash2, config: { ...defaultConfig, trigger: "active" as TriggerType, scale: 0, opacity: 0, rotate: 45, duration: 0.4 } },
    { name: "강한 반발", icon: Target, config: { ...defaultConfig, trigger: "active" as TriggerType, scale: 1.4, opacity: 0.5, duration: 0.3, timingFunction: "ease-out" } },
    { name: "살짝 눌림", icon: MousePointer, config: { ...defaultConfig, trigger: "active" as TriggerType, translateY: 2, shadow: 2, duration: 0.05 } },
    { name: "회전하며 사라짐", icon: RotateCcw, config: { ...defaultConfig, trigger: "active" as TriggerType, rotate: -360, scale: 0, opacity: 0, duration: 0.6 } },
    { name: "흔적 남기기", icon: PenTool, config: { ...defaultConfig, trigger: "active" as TriggerType, scale: 1.05, shadow: 30, opacity: 0.9, duration: 0.3 } },

    // --- [Infinite Presets] ---
    { name: "회전 루프", icon: Repeat, config: { ...defaultConfig, trigger: "infinite" as TriggerType, rotate: 360, duration: 4, timingFunction: "linear", direction: "normal" } },
    { name: "심장 박동", icon: Heart, config: { ...defaultConfig, trigger: "infinite" as TriggerType, scale: 1.18, duration: 0.7, direction: "alternate", timingFunction: "cubic-bezier(0.4, 0, 0.6, 1)" } },
    { name: "살랑살랑 부유", icon: ArrowUpRight, config: { ...defaultConfig, trigger: "infinite" as TriggerType, translateY: -20, duration: 2, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "경고 진동", icon: Bell, config: { ...defaultConfig, trigger: "infinite" as TriggerType, rotate: 12, translateX: 6, duration: 0.12, direction: "alternate", timingFunction: "linear" } },
    { name: "지문 스캔", icon: Fingerprint, config: { ...defaultConfig, trigger: "infinite" as TriggerType, opacity: 0.3, scale: 1.15, shadow: 30, duration: 1.5, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "맥박", icon: Activity, config: { ...defaultConfig, trigger: "infinite" as TriggerType, scale: 1.08, opacity: 0.7, shadow: 20, duration: 0.8, direction: "alternate" } },
    { name: "무한 호흡", icon: Wind, config: { ...defaultConfig, trigger: "infinite" as TriggerType, scale: 1.05, opacity: 0.6, blur: 2, duration: 2, direction: "alternate" } },
    { name: "빙글빙글 진동", icon: Aperture, config: { ...defaultConfig, trigger: "infinite" as TriggerType, rotate: 10, scale: 1.1, duration: 0.2, direction: "alternate-reverse" } },
    { name: "통통 튀기", icon: LifeBuoy, config: { ...defaultConfig, trigger: "infinite" as TriggerType, translateY: -40, scale: 0.9, duration: 0.6, direction: "alternate", timingFunction: "cubic-bezier(0.28, 0.84, 0.42, 1)" } },
    { name: "좌우 흔들기", icon: Move, config: { ...defaultConfig, trigger: "infinite" as TriggerType, translateX: 15, duration: 1, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "흐려졌다 맑아졌다", icon: Cloud, config: { ...defaultConfig, trigger: "infinite" as TriggerType, blur: 8, opacity: 0.4, duration: 2, direction: "alternate" } },
    { name: "깜빡깜빡", icon: Sun, config: { ...defaultConfig, trigger: "infinite" as TriggerType, opacity: 0.1, duration: 0.5, direction: "alternate" } },
    { name: "나침반 바늘", icon: Compass, config: { ...defaultConfig, trigger: "infinite" as TriggerType, rotate: 15, duration: 1, direction: "alternate", timingFunction: "cubic-bezier(0.18, 0.89, 0.32, 1.28)" } },
    { name: "시계 추", icon: Clock, config: { ...defaultConfig, trigger: "infinite" as TriggerType, rotate: 30, duration: 1, direction: "alternate", timingFunction: "ease-in-out" } },
    { name: "확대하며 회전", icon: ShoppingCart, config: { ...defaultConfig, trigger: "infinite" as TriggerType, scale: 1.5, rotate: 360, duration: 5, direction: "normal", timingFunction: "linear" } },
    { name: "점진적 축소", icon: Folder, config: { ...defaultConfig, trigger: "infinite" as TriggerType, scale: 0.5, opacity: 0.5, duration: 1, direction: "alternate" } },
    { name: "파동", icon: Wifi, config: { ...defaultConfig, trigger: "infinite" as TriggerType, scale: 1.3, opacity: 0, shadow: 40, duration: 1.5, direction: "normal" } },
    { name: "부드러운 유영", icon: Anchor, config: { ...defaultConfig, trigger: "infinite" as TriggerType, translateX: 10, translateY: 5, rotate: 2, duration: 3, direction: "alternate" } },
];

const timingOptions = [
    "ease", "ease-in", "ease-out", "ease-in-out", "linear", 
    "cubic-bezier(0.34, 1.56, 0.64, 1)", 
    "cubic-bezier(0.68,-0.55,0.265,1.55)", 
    "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    "cubic-bezier(0.25, 1, 0.5, 1)",
    "cubic-bezier(0.5, 0, 0.75, 0)",
    "cubic-bezier(0.19, 1, 0.22, 1)"
];
const iterationOptions = ["infinite", "1", "2", "3", "5", "10"];
const directionOptions = ["normal", "reverse", "alternate", "alternate-reverse"];

export default function CssAnimationPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState<AnimConfig>({ ...defaultConfig });
    const [playing, setPlaying] = useState(true);
    const [bgColor, setBgColor] = useState("#6366f1");

    const update = (key: keyof AnimConfig, value: unknown) => setConfig((p) => ({ ...p, [key]: value }));

    const getTransforms = useCallback((c: AnimConfig) => {
        const transforms = [];
        if (c.translateX !== 0) transforms.push(`translateX(${c.translateX}px)`);
        if (c.translateY !== 0) transforms.push(`translateY(${c.translateY}px)`);
        if (c.rotate !== 0) transforms.push(`rotate(${c.rotate}deg)`);
        if (c.scale !== 1) transforms.push(`scale(${c.scale})`);
        return transforms.join(" ") || "none";
    }, []);

    const getShadow = useCallback((val: number, color?: string) => {
        if (val === 0) return "none";
        const shadowColor = color ? `${color}44` : "rgba(0, 0, 0, 0.15)";
        const blur = val;
        const spread = val / 4;
        return `0 ${val / 3}px ${blur}px ${spread}px ${shadowColor}`;
    }, []);

    const getFilter = useCallback((blur: number) => {
        if (blur === 0) return "none";
        return `blur(${blur}px)`;
    }, []);

    const getCss = useCallback(() => {
        const transformStr = getTransforms(config);
        const shadowStr = getShadow(config.shadow, bgColor);
        const opacityStr = config.opacity !== 1 ? `opacity: ${config.opacity};` : "";
        const filterStr = config.blur !== 0 ? `filter: ${getFilter(config.blur)};` : "";

        if (config.trigger === "infinite") {
            return `@keyframes myAnimation {\n  from { transform: none; box-shadow: none; opacity: 1; filter: none; }\n  to {\n    transform: ${transformStr};\n    box-shadow: ${shadowStr};\n    ${opacityStr}\n    ${filterStr}\n  }\n}\n\n.element {\n  animation: myAnimation ${config.duration}s ${config.timingFunction} ${config.delay}s ${config.iterationCount} ${config.direction} both;\n}`;
        } else {
            const pseudo = config.trigger === "hover" ? ":hover" : ":active";
            return `.element {\n  transition: all ${config.duration}s ${config.timingFunction};\n  box-shadow: none;\n  transform: none;\n  opacity: 1;\n  filter: none;\n}\n\n.element${pseudo} {\n  transform: ${transformStr};\n  box-shadow: ${shadowStr};\n  ${opacityStr}\n  ${filterStr}\n}`;
        }
    }, [config, getTransforms, getShadow, getFilter, bgColor]);

    const getPreviewStyle = (): React.CSSProperties => {
        const transition = `all ${config.duration}s ${config.timingFunction}`;

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

        return {
            backgroundColor: bgColor,
            transition,
        };
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getCss());
        toast("CSS 코드가 복사되었습니다!", "success");
    };

    const triggerOptions = [
        { id: "infinite", label: "무한 루프", icon: Repeat },
        { id: "hover", label: "마우스 오버", icon: MousePointer2 },
        { id: "active", label: "클릭 유지", icon: Pointer },
    ] as const;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
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
                .preview-element-hover:hover {
                    transform: ${config.trigger === "hover" ? getTransforms(config) : "none"} !important;
                    box-shadow: ${config.trigger === "hover" ? getShadow(config.shadow, bgColor) : "none"} !important;
                    opacity: ${config.trigger === "hover" ? config.opacity : 1} !important;
                    filter: ${config.trigger === "hover" ? getFilter(config.blur) : "none"} !important;
                }
                .preview-element-active:active {
                    transform: ${config.trigger === "active" ? getTransforms(config) : "none"} !important;
                    box-shadow: ${config.trigger === "active" ? getShadow(config.shadow, bgColor) : "none"} !important;
                    opacity: ${config.trigger === "active" ? config.opacity : 1} !important;
                    filter: ${config.trigger === "active" ? getFilter(config.blur) : "none"} !important;
                }
                .presets-grid::-webkit-scrollbar {
                    width: 6px;
                }
                .presets-grid::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .presets-grid::-webkit-scrollbar-thumb {
                    background: #1e293b;
                }
            `}</style>

            <PageHeader
                title="CSS 애니메이션 생성기"
                description="수십 가지의 프리셋과 다양한 인터랙션 옵션을 통해 고퀄리티 웹 애니메이션을 즉시 생성하세요."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Panel: Preview & Code */}
                <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
                    <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[350px] gap-8 relative overflow-hidden group border-white/40 dark:border-zinc-800/50 order-2 xl:order-1">
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent scale-150 group-hover:scale-125 transition-transform duration-1000" />

                        <div
                            className={cn(
                                "w-32 h-32 rounded-[2.5rem] shadow-2xl z-10 cursor-pointer select-none flex items-center justify-center text-white/50",
                                config.trigger === "hover" && "preview-element-hover",
                                config.trigger === "active" && "preview-element-active"
                            )}
                            style={getPreviewStyle()}
                        >
                            {config.trigger === "hover" && <MousePointer2 className="w-8 h-8 opacity-20" />}
                            {config.trigger === "active" && <Pointer className="w-8 h-8 opacity-20" />}
                        </div>

                        <div className="flex flex-col items-center gap-4 z-10 w-full">
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-10 h-10 rounded-full cursor-pointer border-4 border-white dark:border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200 dark:ring-zinc-700 transition-transform active:scale-90"
                                />
                                {config.trigger === "infinite" && (
                                    <button
                                        onClick={() => setPlaying(!playing)}
                                        className="flex items-center gap-2 px-6 py-2.5 glass-card border text-sm font-black text-zinc-700 dark:text-zinc-300 rounded-2xl transition-all active:scale-95 hover:bg-white dark:hover:bg-zinc-800 shadow-sm"
                                    >
                                        {playing ? <Pause className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
                                        {playing ? "STOP" : "PLAY"}
                                    </button>
                                )}
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] opacity-80">
                                {config.trigger === "hover" ? "Hover the box" : config.trigger === "active" ? "Press the box" : "Animation Preview"}
                            </span>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex flex-col gap-4 border-white/40 dark:border-zinc-800/50 order-3 xl:order-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                                    <Layout className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">CSS CODE</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-xl shadow-indigo-500/30 uppercase"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                        </div>
                        <div className="relative group">
                            <pre className="p-4 bg-zinc-950 text-indigo-300/90 rounded-2xl text-[12px] font-mono leading-relaxed overflow-x-auto max-h-[350px] border border-white/5">
                                {getCss()}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Controls & Presets */}
                <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
                    {/* Trigger Selector */}
                    <div className="glass-card p-6 flex flex-col gap-4 border-white/40 dark:border-zinc-800/50">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-indigo-500" /> Interaction Mode
                            </label>
                            <span className="text-[10px] font-bold text-zinc-400 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                {config.trigger.toUpperCase()}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {triggerOptions.map((opt) => {
                                const Icon = opt.icon;
                                const isActive = config.trigger === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => update("trigger", opt.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 group",
                                            isActive
                                                ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-inner"
                                                : "bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                                            <span className="text-[11px] font-black uppercase tracking-tight">{opt.label}</span>
                                        </div>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="glass-card p-6 flex flex-col gap-4 border-white/40 dark:border-zinc-800/50">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Rocket className="w-3 h-3 text-fuchsia-500" /> Quick Presets
                            </label>
                            <span className="text-[10px] font-bold text-zinc-400 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">{presets.length} Presets Available</span>
                        </div>
                        <div className="presets-grid grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                            {presets.map((preset) => {
                                const Icon = preset.icon;
                                const isCurrentTrigger = config.trigger === preset.config.trigger;
                                return (
                                    <button
                                        key={preset.name}
                                        onClick={() => setConfig({ ...preset.config })}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all group relative overflow-hidden",
                                            isCurrentTrigger 
                                                ? "bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 shadow-sm hover:border-indigo-500/50" 
                                                : "bg-zinc-50/50 dark:bg-zinc-900/30 border-transparent opacity-50 grayscale hover:opacity-80 hover:grayscale-0"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isCurrentTrigger ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                        )}>
                                            <Icon className="w-3.5 h-3.5 group-hover:scale-110" />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 truncate w-full group-hover:text-indigo-500 transition-colors">{preset.name}</span>
                                            <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter">{preset.config.trigger}</span>
                                        </div>
                                        {!isCurrentTrigger && (
                                            <div className="absolute inset-0 bg-white/20 dark:bg-black/10 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded shadow-sm">CLICK TO APPLY</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Settings Panel */}
                    <div className="glass-card p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 border-white/40 dark:border-zinc-800/50">
                        {/* Transformations */}
                        <div className="flex flex-col gap-8">
                            <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 border-b border-indigo-500/10 pb-3 flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Transform & State
                            </h3>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col gap-4">
                                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Rotation</label>
                                    <AngleDial angle={config.rotate} onChange={(val) => update("rotate", val)} />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Scale ({config.scale.toFixed(2)}x)</label>
                                    <input type="range" min="0" max="3" step="0.01" value={config.scale} onChange={(e) => update("scale", Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                                </div>
                            </div>

                            {[
                                { key: "translateX", label: "Translate X (PX)", min: -400, max: 400, step: 1 },
                                { key: "translateY", label: "Translate Y (PX)", min: -400, max: 400, step: 1 },
                                { key: "shadow", label: "Outer Glow / Shadow", min: 0, max: 200, step: 1 },
                                { key: "opacity", label: "Final Opacity", min: 0, max: 1, step: 0.01 },
                                { key: "blur", label: "Blur Effect (PX)", min: 0, max: 20, step: 1 },
                            ].map((s) => (
                                <div key={s.key} className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-zinc-400 dark:text-zinc-500">{s.label}</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-mono">{config[s.key as keyof AnimConfig]}</span>
                                    </div>
                                    <input type="range" min={s.min} max={s.max} step={s.step} value={config[s.key as keyof AnimConfig] as number} onChange={(e) => update(s.key as keyof AnimConfig, Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                                </div>
                            ))}
                        </div>

                        {/* Timing & Motion */}
                        <div className="flex flex-col gap-8">
                            <h3 className="text-[11px] font-black text-fuchsia-500 uppercase tracking-[0.3em] mb-2 border-b border-fuchsia-500/10 pb-3 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Motion & Timing
                            </h3>

                            {[
                                { key: "duration", label: "Duration (Seconds)", min: 0, max: 10, step: 0.1 },
                                { key: "delay", label: "Start Delay (Seconds)", min: 0, max: 10, step: 0.1 },
                            ].map((s) => (
                                <div key={s.key} className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-zinc-400 dark:text-zinc-500">{s.label}</span>
                                        <span className="text-fuchsia-600 dark:text-fuchsia-400 font-mono">{config[s.key as keyof AnimConfig]}s</span>
                                    </div>
                                    <input type="range" min={s.min} max={s.max} step={s.step} value={config[s.key as keyof AnimConfig] as number} onChange={(e) => update(s.key as keyof AnimConfig, Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-fuchsia-500" />
                                </div>
                            ))}

                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Easing Function</label>
                                    <select
                                        value={config.timingFunction}
                                        onChange={(e) => update("timingFunction", e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 appearance-none shadow-sm"
                                    >
                                        {timingOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                                    </select>
                                </div>

                                {config.trigger === "infinite" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Iteration</label>
                                            <select value={config.iterationCount} onChange={(e) => update("iterationCount", e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-[11px] font-black appearance-none">
                                                {iterationOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Direction</label>
                                            <select value={config.direction} onChange={(e) => update("direction", e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-[11px] font-black appearance-none">
                                                {directionOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
