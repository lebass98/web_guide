import React, { useState, useEffect } from 'react';
import { RgbaColorPicker, RgbaColor } from 'react-colorful';
import { cn } from '@/lib/utils';

// Helper to convert hex to RGB object
const hexToRgb = (hex: string) => {
  const hashless = hex.replace("#", "");
  const r = parseInt(hashless.length === 3 ? hashless.slice(0, 1).repeat(2) : hashless.substring(0, 2), 16);
  const g = parseInt(hashless.length === 3 ? hashless.slice(1, 2).repeat(2) : hashless.substring(2, 4), 16);
  const b = parseInt(hashless.length === 3 ? hashless.slice(2, 3).repeat(2) : hashless.substring(4, 6), 16);
  return { r, g, b };
};

// Helper to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [Math.round(r), Math.round(g), Math.round(b)].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

interface ColorPickerProps {
  color: string; // Hex string e.g. #ff0000
  opacity: number; // 0-100
  onChange: (color: string, opacity: number) => void;
  className?: string;
}

export function ColorPicker({ color, opacity, onChange, className }: ColorPickerProps) {
  const [internalColor, setInternalColor] = useState<RgbaColor>({ r: 255, g: 0, b: 0, a: 1 });
  
  // Sync prop changes to internal state
  useEffect(() => {
    const { r, g, b } = hexToRgb(color || '#000000');
    setInternalColor({ r, g, b, a: (opacity ?? 100) / 100 });
  }, [color, opacity]);

  const handlePickerChange = (newColor: RgbaColor) => {
    setInternalColor(newColor);
    onChange(rgbToHex(newColor.r, newColor.g, newColor.b), Math.round(newColor.a * 100));
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    // Allow typing, only trigger if valid length
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val, Math.round(internalColor.a * 100));
    }
  };

  const handleRgbaChange = (field: 'r' | 'g' | 'b' | 'a', value: string) => {
    const num = field === 'a' ? parseFloat(value) : parseInt(value);
    if (isNaN(num)) return;
    
    let validNum = num;
    if (field === 'a') {
      validNum = Math.max(0, Math.min(100, validNum)); // For percentage input
      const newColor = { ...internalColor, a: validNum / 100 };
      setInternalColor(newColor);
      onChange(rgbToHex(newColor.r, newColor.g, newColor.b), validNum);
    } else {
      validNum = Math.max(0, Math.min(255, validNum));
      const newColor = { ...internalColor, [field]: validNum };
      setInternalColor(newColor);
      onChange(rgbToHex(newColor.r, newColor.g, newColor.b), Math.round(newColor.a * 100));
    }
  };

  return (
    <div className={cn("flex flex-col md:flex-row gap-8", className)}>
      {/* Column 1: Picker */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Picker</label>
        <div className="custom-color-picker">
          <style dangerouslySetInnerHTML={{__html: `
            .custom-color-picker .react-colorful { width: 200px; height: 200px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .custom-color-picker .react-colorful__pointer { width: 16px; height: 16px; border-width: 3px; }
          `}} />
          <RgbaColorPicker color={internalColor} onChange={handlePickerChange} />
        </div>
      </div>

      {/* Column 2: HEX & RGBA */}
      <div className="flex flex-col gap-4 w-48">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">HEX</label>
          <input
            type="text"
            value={color.toUpperCase()}
            onChange={handleHexChange}
            className="w-full h-10 bg-white border border-zinc-200 rounded text-sm text-center font-sans font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          {/* Labels Row */}
          <div className="flex items-center gap-2">
            {['R', 'G', 'B', 'A'].map(label => (
              <label key={label} className="flex-1 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider text-center">
                {label}
              </label>
            ))}
          </div>
          {/* Inputs Row */}
          <div className="flex items-center gap-2">
            {['r', 'g', 'b', 'a'].map(field => (
              <input
                key={field}
                type="number"
                value={
                  field === 'r' ? internalColor.r :
                  field === 'g' ? internalColor.g :
                  field === 'b' ? internalColor.b :
                  Math.round(internalColor.a * 100)
                }
                onChange={(e) => handleRgbaChange(field as any, e.target.value)}
                className="w-full h-10 bg-white border border-zinc-200 rounded text-sm text-center font-sans font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 shadow-sm hide-spin-buttons"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
