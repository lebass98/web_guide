"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Plus, Trash2, Palette, Sparkles } from "lucide-react";
import { AngleDial } from "@/components/ui/AngleDial";
import { GradientBar } from "@/components/ui/GradientBar";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { cn } from "@/lib/utils";

interface ColorStop {
    id: string;
    color: string;
    position: number;
    opacity?: number;
}

const hexToRgba = (hex: string, opacity: number = 100) => {
    if (opacity === 100) return hex;
    const hashless = hex.replace("#", "");
    const r = parseInt(
        hashless.length === 3 ? hashless.slice(0, 1).repeat(2) : hashless.slice(0, 2),
        16
    );
    const g = parseInt(
        hashless.length === 3 ? hashless.slice(1, 2).repeat(2) : hashless.slice(2, 4),
        16
    );
    const b = parseInt(
        hashless.length === 3 ? hashless.slice(2, 3).repeat(2) : hashless.slice(4, 6),
        16
    );
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

export default function CssGradientPage() {
    const [generatorMode, setGeneratorMode] = useState<"gradient" | "glow">("gradient");
    
    // Glow UI strict replication state
    const [glowHue, setGlowHue] = useState(250);
    const [glowSaturation, setGlowSaturation] = useState(80);
    const [glowLightness, setGlowLightness] = useState(60);
    const [glowMaskSize, setGlowMaskSize] = useState(40);
    const [glowScale, setGlowScale] = useState(1.0);
    const [noiseOverlay, setNoiseOverlay] = useState(false);
    const [noiseIntensity, setNoiseIntensity] = useState(35);
    const [glowX, setGlowX] = useState(0);
    const [glowY, setGlowY] = useState(0);

    const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
    const [angle, setAngle] = useState(90);
    const [stops, setStops] = useState<ColorStop[]>([
        { id: "1", color: "#fca5a5", position: 0, opacity: 100 },
        { id: "2", color: "#f43f5e", position: 100, opacity: 100 },
    ]);
    const [activeStopId, setActiveStopId] = useState<string>("1");
    const cssCode = useMemo(() => {
        // Sort stops by position to ensure valid CSS
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        const stopsString = sortedStops
            .map((stop) => `${hexToRgba(stop.color, stop.opacity)} ${stop.position}%`)
            .join(", ");

        if (gradientType === "linear") {
            return `background: linear-gradient(${angle}deg, ${stopsString});`;
        } else {
            return `background: radial-gradient(circle, ${stopsString});`;
        }
    }, [gradientType, angle, stops]);

    const handleCopy = () => {
        navigator.clipboard.writeText(cssCode);
    };

    const addStop = (pos?: number) => {
        if (stops.length >= 5) return; // Limit to 5 stops for simplicity

        let newPos = pos;
        if (newPos === undefined) {
            // Find a gap or add to the end
            const lastPos = stops[stops.length - 1].position;
            newPos = lastPos < 80 ? lastPos + 20 : 50;
        }

        const newId = Math.random().toString(36).substr(2, 9);
        setStops([
            ...stops,
            {
                id: newId,
                color: "#a855f7",
                position: newPos,
                opacity: 100,
            },
        ]);
        setActiveStopId(newId);
    };

    const removeStop = (id: string) => {
        if (stops.length <= 2) return; // Minimum 2 stops required
        const newStops = stops.filter((stop) => stop.id !== id);
        setStops(newStops);
        if (activeStopId === id) {
            setActiveStopId(newStops[0].id);
        }
    };

    const updateStopColor = (id: string, color: string) => {
        setStops((prev) => prev.map((stop) => (stop.id === id ? { ...stop, color } : stop)));
    };

    const updateStopPosition = (id: string, position: number) => {
        setStops((prev) => prev.map((stop) => (stop.id === id ? { ...stop, position } : stop)));
    };

    const updateStopOpacity = (id: string, opacity: number) => {
        setStops((prev) => prev.map((stop) => (stop.id === id ? { ...stop, opacity } : stop)));
    };

    const applyPreset = (presetColors: string[]) => {
        const newStops = presetColors.map((c, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            color: c,
            position: Math.round((i / (presetColors.length - 1)) * 100),
            opacity: 100,
        }));
        setStops(newStops);
        setActiveStopId(newStops[0].id);
    };

    const presets = [
        ["#2A7B9B", "#C5C757", "#EDDD53"],
        ["#4ade80", "#3b82f6"],
        ["#facc15", "#0ea5e9"],
        ["#ec4899", "#f43f5e"],
        ["#8b5cf6", "#d946ef"],
        ["#a5b4fc", "#fbcfe8"],
    ];

    return (
        <div className="space-y-10">
            <style>{`
                .glow-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 8px;
                    background: #27272A;
                    border-radius: 999px;
                    outline: none;
                }
                .glow-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                .hue-slider {
                    background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
                }
            `}</style>
            <PageHeader
                title="CSS 스타일 생성기"
                description="아름다운 CSS 그라데이션과 네온 Glow 효과를 손쉽게 만들어보세요."
            />

            {/* Tabs */}
            <div className="flex justify-center mb-8 -mt-2">
                <div className="inline-flex glass-card p-1 rounded-2xl">
                    <button
                        onClick={() => setGeneratorMode("gradient")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            generatorMode === "gradient" 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/5"
                        }`}
                    >
                        <Palette className="w-4 h-4" /> CSS 그라데이션
                    </button>
                    <button
                        onClick={() => setGeneratorMode("glow")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            generatorMode === "glow" 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/5"
                        }`}
                    >
                        <Sparkles className="w-4 h-4" /> Glow 효과
                    </button>
                </div>
            </div>

            {generatorMode === "gradient" ? (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
                    {/* Gradient Preview Area */}
            <div
                className="w-full h-64 lg:h-80 rounded-2xl shadow-inner border border-zinc-200 overflow-hidden relative group transition-all duration-300"
                style={{
                    background: cssCode.replace("background: ", "").replace(";", ""),
                }}
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-zinc-900 font-medium backdrop-blur-md px-6 py-3 rounded-full bg-white/30 border border-white/50 shadow-sm">
                        미리보기
                    </span>
                </div>
            </div>

            {/* Main Designer Workspace */}
            <div className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                {/* Top Bar: Gradient Bar & Controls */}
                <div className="flex flex-col lg:flex-row p-6 md:p-8 items-center gap-8 md:gap-10 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/30">
                    {/* Left: Gradient Bar */}
                    <div className="flex-1 w-full relative">
                        <GradientBar
                            stops={stops}
                            activeStopId={activeStopId}
                            onPositionChange={(id, pos) => updateStopPosition(id, pos)}
                            onSelectStop={setActiveStopId}
                            onAddStop={addStop}
                        />
                    </div>

                    {/* Right: Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4 lg:pt-0">
                        <div className="flex bg-white dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm p-1">
                             <button
                                onClick={() => setGradientType("linear")}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-semibold rounded transition-colors",
                                    gradientType === "linear"
                                        ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                )}
                            >
                                Linear
                            </button>
                            <button
                                onClick={() => setGradientType("radial")}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-semibold rounded transition-colors",
                                    gradientType === "radial"
                                        ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                )}
                            >
                                Radial
                            </button>
                        </div>

                        {gradientType === "linear" && (
                            <AngleDial angle={angle} onChange={setAngle} />
                        )}

                        <div className="flex flex-wrap justify-center gap-2 border-zinc-200 md:border-l md:pl-6 h-auto md:h-8 items-center">
                            {presets.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => applyPreset(p)}
                                    className="w-8 h-8 rounded shadow-sm border border-zinc-200 hover:scale-110 transition-transform"
                                    style={{
                                        background: `linear-gradient(135deg, ${p.join(", ")})`,
                                    }}
                                    title="Preset"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Edit Area: 3 Columns */}
                <div className="flex flex-col lg:flex-row p-6 md:p-8 gap-8 md:gap-10">
                    {/* Cols 1 & 2: Picker and HEX/RGBA (From ColorPicker component) */}
                    {stops.find((s) => s.id === activeStopId) ? (
                        <div className="lg:w-[432px]">
                            <ColorPicker
                                color={stops.find((s) => s.id === activeStopId)!.color}
                                opacity={stops.find((s) => s.id === activeStopId)!.opacity ?? 100}
                                onChange={(c, o) => {
                                    updateStopColor(activeStopId, c);
                                    updateStopOpacity(activeStopId, o);
                                }}
                            />
                        </div>
                    ) : (
                        <div className="hidden lg:block lg:w-[432px]" /> // Placeholder width
                    )}

                    {/* Col 3: Stops List */}
                    <div className="flex flex-col gap-3 flex-1 lg:border-l border-zinc-200 dark:border-zinc-700 lg:pl-8">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Stops
                        </label>
                        <div className="flex flex-col gap-2">
                            {stops.map((stop) => (
                                <div
                                    key={stop.id}
                                    onClick={() => setActiveStopId(stop.id)}
                                    className={cn(
                                        "flex items-center gap-2 md:gap-3 p-2 rounded-lg cursor-pointer transition-colors border",
                                        activeStopId === stop.id
                                            ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm"
                                            : "bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    {/* Color Preview */}
                                    <div
                                        className="w-10 h-10 rounded shadow-sm flex-shrink-0"
                                        style={{
                                            backgroundColor: hexToRgba(stop.color, stop.opacity),
                                        }}
                                    />

                                    {/* HEX Input */}
                                    <input
                                        type="text"
                                        value={stop.color.toUpperCase()}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (!val.startsWith("#")) val = "#" + val;
                                            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                                updateStopColor(stop.id, val);
                                            }
                                        }}
                                        className="w-24 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-sm font-sans font-semibold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                                    />

                                    {/* Position Input */}
                                    <input
                                        type="number"
                                        value={stop.position}
                                        onChange={(e) =>
                                            updateStopPosition(stop.id, Number(e.target.value))
                                        }
                                        className="w-16 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-sm text-center font-sans font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 hide-spin-buttons"
                                    />

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeStop(stop.id);
                                        }}
                                        disabled={stops.length <= 2}
                                        className="p-2 ml-auto text-zinc-400 hover:text-rose-500 rounded transition-colors disabled:opacity-30 disabled:hover:text-zinc-400"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Code Area: Dark Theme */}
            <div className="bg-[#2D333B] text-zinc-300 rounded-xl overflow-hidden shadow-lg border border-zinc-800 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-zinc-700/50 bg-[#22272E]">
                    <h3 className="font-bold text-xs text-white tracking-widest uppercase">CSS</h3>
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            className="rounded bg-zinc-800 border-zinc-600 text-fuchsia-500 focus:ring-fuchsia-500 focus:ring-offset-zinc-900"
                        />
                        Max compatibility (IE6+)
                    </label>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-[#539bf5] selection:text-white">
                    <div>
                        <span className="text-[#8ddb8c]">background:</span> {stops[0]?.color};
                    </div>
                    <div>
                        <span className="text-[#8ddb8c]">background:</span>{" "}
                        {cssCode.replace("background: ", "").replace(";", "")};
                    </div>
                </div>
                <button
                    onClick={handleCopy}
                    className="w-full py-4 border-t border-zinc-700/50 flex items-center justify-center gap-2 font-semibold hover:bg-[#22272E] hover:text-white transition-colors text-zinc-400 bg-[#2D333B]"
                >
                    <Copy className="w-4 h-4" /> Copy to clipboard
                </button>
            </div>
        </div>
    ) : (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
                <style>{`
                    .glow-slider { -webkit-appearance: none; width: 100%; height: 4px; background: #27272a; border-radius: 2px; outline: none; }
                    .glow-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #6366f1; cursor: pointer; }
                    .hue-slider { background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
                `}</style>
                {/* Glow Preview Area */}
                <div className="w-full h-80 rounded-2xl shadow-inner border border-zinc-200 dark:border-zinc-800 overflow-hidden relative flex items-center justify-center bg-zinc-950">
                    {/* Blob */}
                    <div 
                        className="absolute rounded-full transition-all duration-100 pointer-events-none"
                        style={{
                            width: '600px',
                            height: '600px',
                            background: `radial-gradient(circle, hsl(${glowHue}, ${glowSaturation}%, ${glowLightness}%) 0%, transparent ${glowMaskSize}%)`,
                            filter: 'blur(32px)',
                            transform: `translate(${glowX}px, ${glowY}px) scale(${glowScale})`,
                            mixBlendMode: 'screen'
                        }}
                    />
                    
                    {noiseOverlay && (
                        <div 
                            className="absolute inset-0 pointer-events-none mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                opacity: noiseIntensity / 100
                            }}
                        />
                    )}
                    
                    {/* Center Glass Item to show off the glow */}
                    <div className="relative z-10 w-64 h-40 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-white/70 shadow-2xl">
                        <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                        <span className="font-semibold tracking-wider text-sm">Glass Component</span>
                    </div>
                </div>

                {/* Workspace */}
                <div className="bg-[#18181B] rounded-[28px] shadow-sm border border-zinc-800 overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-10 text-white">
                    
                    {/* Left Col: Color & Shape */}
                    <div className="flex-1 space-y-8">
                        {/* Color Section */}
                        <div className="space-y-5">
                            <div className="flex justify-between items-center group mb-2">
                                <label className="text-sm font-medium text-zinc-400">Lightness</label>
                                <span className="text-sm text-zinc-500 font-mono">{glowLightness}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={glowLightness} onChange={(e) => setGlowLightness(Number(e.target.value))} className="w-full glow-slider" />

                            <div className="flex justify-between items-center group mb-2">
                                <label className="text-sm font-medium text-zinc-400">Saturation (Chroma)</label>
                                <span className="text-sm text-zinc-500 font-mono">{glowSaturation}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={glowSaturation} onChange={(e) => setGlowSaturation(Number(e.target.value))} className="w-full glow-slider" />

                            <div className="flex justify-between items-center group mb-2">
                                <label className="text-sm font-medium text-zinc-400">Hue</label>
                                <span className="text-sm text-zinc-500 font-mono">{glowHue}°</span>
                            </div>
                            <input 
                                type="range" min="0" max="360" value={glowHue} onChange={(e) => setGlowHue(Number(e.target.value))} 
                                className="w-full glow-slider hue-slider" 
                            />
                        </div>

                        <hr className="border-zinc-800" />

                        {/* Position */}
                        <div className="space-y-5">
                            <h3 className="font-semibold text-sm text-zinc-300 uppercase tracking-widest mb-4">Glow Position</h3>
                            
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-zinc-400">Horizontal (X)</label>
                                    <span className="text-sm text-zinc-500 font-mono">{glowX}px</span>
                                </div>
                                <input type="range" min="-500" max="500" value={glowX} onChange={(e) => setGlowX(Number(e.target.value))} className="w-full glow-slider" />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-zinc-400">Vertical (Y)</label>
                                    <span className="text-sm text-zinc-500 font-mono">{glowY}px</span>
                                </div>
                                <input type="range" min="-500" max="500" value={glowY} onChange={(e) => setGlowY(Number(e.target.value))} className="w-full glow-slider" />
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Shape Config & Code */}
                    <div className="flex-1 space-y-8 md:border-l border-zinc-800 md:pl-10">
                        {/* Shape Config */}
                        <div className="space-y-5">
                            <h3 className="font-semibold text-sm text-zinc-300 uppercase tracking-widest mb-4">Shape Configuration</h3>
                            
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-zinc-400">Gradient Mask Size</label>
                                    <span className="text-sm text-zinc-500 font-mono">{glowMaskSize}%</span>
                                </div>
                                <input type="range" min="10" max="100" value={glowMaskSize} onChange={(e) => setGlowMaskSize(Number(e.target.value))} className="w-full glow-slider" />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-zinc-400">Glow Scale</label>
                                    <span className="text-sm text-zinc-500 font-mono">{glowScale}x</span>
                                </div>
                                <input type="range" min="0.1" max="3" step="0.1" value={glowScale} onChange={(e) => setGlowScale(Number(e.target.value))} className="w-full glow-slider" />
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <label className="text-sm font-medium text-zinc-400">Noise Overlay</label>
                                <button 
                                    onClick={() => setNoiseOverlay(!noiseOverlay)}
                                    className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${noiseOverlay ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${noiseOverlay ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {noiseOverlay && (
                                <div className="pt-2 animate-in fade-in zoom-in-95">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-medium text-zinc-400">Noise Intensity</label>
                                        <span className="text-sm text-zinc-500 font-mono">{noiseIntensity}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={noiseIntensity} onChange={(e) => setNoiseIntensity(Number(e.target.value))} className="w-full glow-slider" />
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setGlowHue(Math.floor(Math.random() * 361));
                                    setGlowSaturation(Math.floor(Math.random() * 51) + 50);
                                    setGlowLightness(Math.floor(Math.random() * 51) + 30);
                                    setGlowMaskSize(Math.floor(Math.random() * 51) + 20);
                                    setGlowScale(Number((Math.random() * 1.5 + 0.5).toFixed(1)));
                                    setGlowX(Math.floor(Math.random() * 601) - 300);
                                    setGlowY(Math.floor(Math.random() * 601) - 300);
                                    if (Math.random() > 0.7) {
                                        setNoiseOverlay(true);
                                        setNoiseIntensity(Math.floor(Math.random() * 51) + 10);
                                    }
                                }}
                                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                            >
                                <Sparkles className="w-4 h-4" /> 무작위 스타일 생성
                            </button>

                            <button
                                onClick={() => {
                                    const code = `.glow-element {\n  position: absolute;\n  width: 600px;\n  height: 600px;\n  background: radial-gradient(\n    circle, \n    hsl(${glowHue}, ${glowSaturation}%, ${glowLightness}%) 0%, \n    transparent ${glowMaskSize}%\n  );\n  filter: blur(32px);\n  transform: translate(${glowX}px, ${glowY}px) scale(${glowScale});\n  mix-blend-mode: screen;\n  pointer-events: none;\n}` + (noiseOverlay ? `\n\n.glow-noise {\n  position: absolute;\n  inset: 0;\n  mix-blend-mode: overlay;\n  opacity: ${noiseIntensity / 100};\n  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");\n  pointer-events: none;\n}` : '');
                                    navigator.clipboard.writeText(code);
                                }}
                                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                            >
                                <Copy className="w-4 h-4" /> CSS 코드 복사하기
                            </button>
                            <p className="text-center text-xs text-zinc-500 mt-2 px-4 leading-relaxed">
                                CSS <strong>radial-gradient</strong>, <strong>blur</strong>와 <strong>mix-blend-mode</strong> 조합의 점진적 네온 발광.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
