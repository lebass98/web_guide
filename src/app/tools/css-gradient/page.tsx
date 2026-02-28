"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Plus, Trash2, Palette } from "lucide-react";
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
            <PageHeader
                title="CSS 그라데이션 생성기"
                description="다양한 색상과 방향을 조합하여 아름다운 CSS 그라데이션을 만들어보세요."
            />

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
            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
                {/* Top Bar: Gradient Bar & Controls */}
                <div className="flex flex-col lg:flex-row p-8 items-center gap-10 border-b border-gray-100 bg-gray-50/30">
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
                    <div className="flex items-center gap-6 pt-4 lg:pt-0">
                        <div className="flex bg-white rounded-md border border-zinc-200 shadow-sm p-1">
                            <button
                                onClick={() => setGradientType("linear")}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-semibold rounded transition-colors",
                                    gradientType === "linear"
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                Linear
                            </button>
                            <button
                                onClick={() => setGradientType("radial")}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-semibold rounded transition-colors",
                                    gradientType === "radial"
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                Radial
                            </button>
                        </div>

                        {gradientType === "linear" && (
                            <AngleDial angle={angle} onChange={setAngle} />
                        )}

                        <div className="flex gap-2 border-l border-zinc-200 pl-6 h-8 items-center">
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
                <div className="flex flex-col lg:flex-row p-8 gap-10">
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
                        <div className="w-[432px]" /> // Placeholder width
                    )}

                    {/* Col 3: Stops List */}
                    <div className="flex flex-col gap-3 flex-1 lg:border-l border-zinc-200 lg:pl-8">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Stops
                        </label>
                        <div className="flex flex-col gap-2">
                            {stops.map((stop) => (
                                <div
                                    key={stop.id}
                                    onClick={() => setActiveStopId(stop.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border",
                                        activeStopId === stop.id
                                            ? "bg-zinc-100 border-zinc-200 shadow-sm"
                                            : "bg-transparent border-transparent hover:bg-zinc-50"
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
                                        className="w-24 px-3 py-2 bg-white border border-zinc-200 rounded text-sm font-sans font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400"
                                    />

                                    {/* Position Input */}
                                    <input
                                        type="number"
                                        value={stop.position}
                                        onChange={(e) =>
                                            updateStopPosition(stop.id, Number(e.target.value))
                                        }
                                        className="w-16 px-3 py-2 bg-white border border-zinc-200 rounded text-sm text-center font-sans font-bold text-zinc-700 focus:outline-none focus:border-zinc-400 hide-spin-buttons"
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
    );
}
