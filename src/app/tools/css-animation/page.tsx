"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Play, Pause } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

interface AnimConfig {
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
    opacity: [number, number];
}

const defaultConfig: AnimConfig = {
    duration: 1.0,
    timingFunction: "ease-in-out",
    delay: 0,
    iterationCount: "infinite",
    direction: "alternate",
    fillMode: "both",
    translateX: 0,
    translateY: -30,
    rotate: 0,
    scale: 1.1,
    opacity: [1, 1],
};

const timingOptions = ["ease", "ease-in", "ease-out", "ease-in-out", "linear", "cubic-bezier(0.68,-0.55,0.265,1.55)"];
const iterationOptions = ["infinite", "1", "2", "3", "5"];
const directionOptions = ["normal", "reverse", "alternate", "alternate-reverse"];
const fillModeOptions = ["none", "forwards", "backwards", "both"];

export default function CssAnimationPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState<AnimConfig>({ ...defaultConfig });
    const [playing, setPlaying] = useState(true);
    const [bgColor, setBgColor] = useState("#6366f1");

    const update = (key: keyof AnimConfig, value: unknown) => setConfig((p) => ({ ...p, [key]: value }));

    const getKeyframes = useCallback(() => {
        const transforms = [];
        if (config.translateX !== 0) transforms.push(`translateX(${config.translateX}px)`);
        if (config.translateY !== 0) transforms.push(`translateY(${config.translateY}px)`);
        if (config.rotate !== 0) transforms.push(`rotate(${config.rotate}deg)`);
        if (config.scale !== 1) transforms.push(`scale(${config.scale})`);
        const transformStr = transforms.length > 0 ? `transform: ${transforms.join(" ")};` : "";
        const opacityStr = config.opacity[0] !== config.opacity[1] ? `opacity: ${config.opacity[1]};` : "";
        return `@keyframes myAnimation {\n  from { }\n  to {\n    ${[transformStr, opacityStr].filter(Boolean).join("\n    ")}\n  }\n}`;
    }, [config]);

    const getCss = useCallback(() => {
        return `${getKeyframes()}\n\n.element {\n  animation: myAnimation ${config.duration}s ${config.timingFunction} ${config.delay}s ${config.iterationCount} ${config.direction} ${config.fillMode};\n}`;
    }, [config, getKeyframes]);

    const getInlineStyle = (): React.CSSProperties => {
        if (!playing) return {};
        const transforms: string[] = [];
        if (config.translateX !== 0) transforms.push(`translateX(${config.translateX}px)`);
        if (config.translateY !== 0) transforms.push(`translateY(${config.translateY}px)`);
        if (config.rotate !== 0) transforms.push(`rotate(${config.rotate}deg)`);
        if (config.scale !== 1) transforms.push(`scale(${config.scale})`);
        return {
            animationName: "cssAnimPreview",
            animationDuration: `${config.duration}s`,
            animationTimingFunction: config.timingFunction,
            animationDelay: `${config.delay}s`,
            animationIterationCount: config.iterationCount === "infinite" ? "infinite" : Number(config.iterationCount),
            animationDirection: config.direction as never,
            animationFillMode: config.fillMode as never,
        };
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getCss());
        toast("CSS 애니메이션 코드가 복사되었습니다!", "success");
    };

    return (
        <>
            <style>{`
                @keyframes cssAnimPreview {
                    from { transform: none; }
                    to {
                        ${config.translateX !== 0 ? "" : ""}
                        transform: translateX(${config.translateX}px) translateY(${config.translateY}px) rotate(${config.rotate}deg) scale(${config.scale});
                        opacity: ${config.opacity[1]};
                    }
                }
            `}</style>

            <PageHeader title="CSS 애니메이션 생성기" description="옵션을 조절하여 CSS 애니메이션을 실시간으로 미리보고 코드를 복사하세요." />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="flex flex-col gap-6">
                    <div className="glass-card p-8 flex flex-col items-center justify-center min-h-64 gap-6">
                        <div
                            className="w-24 h-24 rounded-3xl shadow-xl"
                            style={{ backgroundColor: bgColor, ...getInlineStyle() }}
                        />
                        <div className="flex items-center gap-3">
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                            <button
                                onClick={() => setPlaying(!playing)}
                                className="flex items-center gap-2 px-4 py-2 glass-card border text-sm font-bold text-zinc-700 dark:text-zinc-300 rounded-xl transition-all active:scale-95"
                            >
                                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {playing ? "일시정지" : "재생"}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">CSS 코드</span>
                            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/30">
                                <Copy className="w-4 h-4" /> 복사
                            </button>
                        </div>
                        <pre className="p-4 bg-zinc-950 text-indigo-300 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-48">
                            {getCss()}
                        </pre>
                    </div>
                </div>

                {/* Controls */}
                <div className="glass-card p-6 flex flex-col gap-5">
                    {([
                        { key: "duration", label: "재생 시간 (초)", min: 0.1, max: 10, step: 0.1 },
                        { key: "delay", label: "딜레이 (초)", min: 0, max: 5, step: 0.1 },
                        { key: "translateX", label: "이동 X (px)", min: -300, max: 300, step: 1 },
                        { key: "translateY", label: "이동 Y (px)", min: -300, max: 300, step: 1 },
                        { key: "rotate", label: "회전 (deg)", min: -360, max: 360, step: 1 },
                        { key: "scale", label: "크기 (scale)", min: 0.1, max: 3, step: 0.05 },
                    ] as const).map(({ key, label, min, max, step }) => (
                        <div key={key} className="flex flex-col gap-2">
                            <div className="flex justify-between">
                                <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</label>
                                <span className="text-sm font-mono text-indigo-500 dark:text-indigo-400 font-bold">{config[key]}</span>
                            </div>
                            <input type="range" min={min} max={max} step={step} value={config[key] as number} onChange={(e) => update(key, Number(e.target.value))} className="w-full accent-indigo-500" />
                        </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        {([
                            { key: "timingFunction", label: "타이밍", options: timingOptions },
                            { key: "iterationCount", label: "반복 횟수", options: iterationOptions },
                            { key: "direction", label: "방향", options: directionOptions },
                            { key: "fillMode", label: "Fill Mode", options: fillModeOptions },
                        ] as const).map(({ key, label, options }) => (
                            <div key={key} className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</label>
                                <select
                                    value={config[key] as string}
                                    onChange={(e) => update(key, e.target.value)}
                                    className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-indigo-500 transition-all"
                                >
                                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
