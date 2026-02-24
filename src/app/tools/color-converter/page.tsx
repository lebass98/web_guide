"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy } from "lucide-react";

export default function ColorConverterPage() {
  const [hex, setHex] = useState("#f87171");
  const [rgb, setRgb] = useState("rgb(248, 113, 113)");
  const [hsl, setHsl] = useState("hsl(0, 91%, 71%)");
  const [error, setError] = useState<string | null>(null);

  // Extremely basic conversions for MVP
  const hexToRgb = (hex: string) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const updateFromHex = (value: string) => {
    setHex(value);
    const rgbVal = hexToRgb(value);
    if (rgbVal) {
      setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
      const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
      setHsl(`hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`);
      setError(null);
    } else {
      setError("잘못된 HEX 코드");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <PageHeader 
        title="색상 코드 변환기" 
        description="HEX, RGB, HSL 색상 형식을 즉시 변환하세요." 
      />
      
      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        <div 
          className="lg:w-1/3 h-64 lg:h-auto rounded-3xl shadow-2xl transition-colors duration-300 border border-white/10"
          style={{ backgroundColor: error ? "transparent" : hex }}
        />
        
        <div className="flex-1 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">HEX</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 font-mono focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
                <button 
                  onClick={() => handleCopy(hex)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> 복사
                </button>
              </div>
              {error && <span className="text-xs text-destructive-foreground">{error}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">RGB</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rgb}
                  readOnly
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 font-mono text-zinc-400"
                />
                <button 
                  onClick={() => handleCopy(rgb)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> 복사
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">HSL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hsl}
                  readOnly
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 font-mono text-zinc-400"
                />
                <button 
                  onClick={() => handleCopy(hsl)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> 복사
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
