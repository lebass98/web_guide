import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ColorStop {
    id: string;
    color: string;
    position: number;
    opacity?: number;
}

interface GradientBarProps {
    stops: ColorStop[];
    activeStopId: string | null;
    onPositionChange: (id: string, newPosition: number) => void;
    onSelectStop: (id: string) => void;
    onAddStop?: (position: number) => void;
    className?: string;
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

export function GradientBar({
    stops,
    activeStopId,
    onPositionChange,
    onSelectStop,
    onAddStop,
    className,
}: GradientBarProps) {
    const barRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Generate background gradient for the bar
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const backgroundGradient = `linear-gradient(to right, ${sortedStops
        .map((s) => `${hexToRgba(s.color, s.opacity)} ${s.position}%`)
        .join(", ")})`;

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.stopPropagation(); // Prevent triggering bar click
        e.preventDefault();
        setDraggingId(id);
        onSelectStop(id);
    };

    const calculatePosition = (clientX: number) => {
        if (!barRef.current) return 0;
        const rect = barRef.current.getBoundingClientRect();
        let percent = ((clientX - rect.left) / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));
        return Math.round(percent);
    };

    const handleBarClick = (e: React.MouseEvent) => {
        if (draggingId || !onAddStop) return;
        const position = calculatePosition(e.clientX);
        onAddStop(position);
    };

    useEffect(() => {
        if (!draggingId) return;

        const handlePointerMove = (e: PointerEvent) => {
            const position = calculatePosition(e.clientX);
            onPositionChange(draggingId, position);
        };

        const handlePointerUp = () => {
            setDraggingId(null);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [draggingId, onPositionChange]);

    // SVG checkerboard pattern for translucent colors
    const checkerboardUrl = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="8" height="8" fill="%23e5e7eb"/><rect x="8" y="8" width="8" height="8" fill="%23e5e7eb"/></svg>')`;

    return (
        <div className={cn("relative w-full pb-8", className)}>
            {/* Background layer: Checkered board */}
            <div
                className="absolute top-0 left-0 right-0 h-10 rounded-lg shadow-inner overflow-hidden border-2 border-zinc-300"
                style={{ backgroundImage: checkerboardUrl, opacity: 0.8 }}
            />
            {/* Middle layer: Gradient */}
            <div
                ref={barRef}
                onClick={handleBarClick}
                className="absolute top-0 left-0 right-0 h-10 rounded-lg shadow-inner cursor-crosshair border-2 border-transparent"
                style={{ background: backgroundGradient }}
            />

            {/* Foreground layer: Thumbs */}
            {stops.map((stop) => (
                <div
                    key={stop.id}
                    className="absolute top-0 w-4 h-12 -ml-2 group touch-none"
                    style={{ left: `${stop.position}%` }}
                >
                    {/* Draggable thumb pill */}
                    <div
                        onPointerDown={(e) => handlePointerDown(e, stop.id)}
                        className={cn(
                            "absolute top-0 left-0 w-full h-12 rounded-full border-2 bg-white cursor-ew-resize shadow-md transition-transform flex flex-col items-center justify-center p-[2px]",
                            activeStopId === stop.id
                                ? "border-zinc-800 z-30 scale-105"
                                : "border-zinc-400 z-10 hover:border-zinc-500"
                        )}
                    >
                        <div
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: hexToRgba(stop.color, stop.opacity) }}
                        />
                    </div>

                    {/* Percentage Box below */}
                    <div className="absolute top-[52px] left-1/2 -translate-x-1/2 w-10">
                        {/* The vertical connector line is hidden or small. We'll simulate by margin. */}
                        <div
                            className={cn(
                                "px-1 py-1 bg-white border rounded text-xs text-center font-mono font-medium shadow-sm",
                                activeStopId === stop.id
                                    ? "border-zinc-800 text-zinc-900"
                                    : "border-zinc-200 text-zinc-600"
                            )}
                        >
                            {stop.position}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
