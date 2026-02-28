import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils"; // Assumes you have a standard cn utility

interface AngleDialProps {
    angle: number;
    onChange: (angle: number) => void;
    className?: string;
}

export function AngleDial({ angle, onChange, className }: AngleDialProps) {
    const dialRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const calculateAngle = useCallback(
        (clientX: number, clientY: number) => {
            if (!dialRef.current) return;
            const rect = dialRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = clientX - centerX;
            const dy = clientY - centerY;

            // Calculate angle in degrees, offset so 0 is top
            let newAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            if (newAngle < 0) newAngle += 360;

            onChange(Math.round(newAngle));
        },
        [onChange]
    );

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent text selection
        setIsDragging(true);
        calculateAngle(e.clientX, e.clientY);
    };

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e: PointerEvent) => {
            calculateAngle(e.clientX, e.clientY);
        };

        const handlePointerUp = () => {
            setIsDragging(false);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [isDragging, calculateAngle]);

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div
                ref={dialRef}
                onPointerDown={handlePointerDown}
                className="relative w-10 h-10 rounded-full border-2 border-zinc-300 bg-white cursor-pointer shadow-sm touch-none"
            >
                <div
                    className="absolute inset-0 transition-transform duration-75"
                    style={{ transform: `rotate(${angle}deg)` }}
                >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-800 rounded-full shadow-sm" />
                </div>
            </div>
            <div className="relative">
                <input
                    type="number"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) val = 0;
                        if (val > 360) val = val % 360;
                        if (val < 0) val = (val % 360) + 360;
                        onChange(val);
                    }}
                    className="w-16 h-10 px-2 py-1 bg-white border border-zinc-300 rounded-lg text-sm text-center font-medium text-zinc-900 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 appearance-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">
                    °
                </span>
            </div>
        </div>
    );
}
