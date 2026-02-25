"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UrlEncoderPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);

  const processText = (text: string, currentMode: "encode" | "decode") => {
    setInput(text);
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (currentMode === "encode") {
        setOutput(encodeURIComponent(text));
      } else {
        setOutput(decodeURIComponent(text));
      }
      setError(null);
    } catch (err) {
      setError(currentMode === "decode" ? "잘못된 URI 구성요소입니다." : "인코딩에 실패했습니다.");
      setOutput("");
    }
  };

  const handleModeSwitch = (newMode: "encode" | "decode") => {
    setMode(newMode);
    processText(input, newMode);
  };

  return (
    <div className="flex flex-col gap-8 lg:gap-10 pb-10">
      <PageHeader 
        title="URL 인코더/디코더" 
        description="URI 구성요소를 안전하게 인코딩하거나 URL 문자열을 텍스트로 디코딩하세요." 
      />
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleModeSwitch("encode")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            mode === "encode" 
              ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]" 
              : "bg-zinc-100 text-zinc-600 border border-zinc-200/80 hover:bg-zinc-200/50 hover:text-zinc-900"
          )}
        >
          인코딩
        </button>
        <button
          onClick={() => handleModeSwitch("decode")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            mode === "decode" 
              ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]" 
              : "bg-zinc-100 text-zinc-600 border border-zinc-200/80 hover:bg-zinc-200/50 hover:text-zinc-900"
          )}
        >
          디코딩
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[400px]">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-600">입력</label>
          <textarea
            className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
            placeholder={mode === "encode" ? "인코딩할 URL이나 문자열을 입력하세요..." : "디코딩할 인코딩된 URL을 붙여넣으세요..."}
            value={input}
            onChange={(e) => processText(e.target.value, mode)}
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-600">변환 결과</label>
            <div className="flex gap-2">
              <button 
                onClick={() => processText("", mode)}
                className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-md transition-colors"
                title="지우기"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(output)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  output ? "text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10" : "text-zinc-500 cursor-not-allowed"
                )}
                title="클립보드에 복사"
                disabled={!output}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="relative flex-1 w-full">
            <textarea
              readOnly
              className={cn(
                "w-full h-full p-4 glass-card resize-none font-mono text-sm",
                error ? "text-zinc-500 opacity-50" : "text-fuchsia-100"
              )}
              placeholder="결과가 여기에 표시됩니다..."
              value={output}
              spellCheck={false}
            />
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20 font-medium">
                  <ShieldAlert className="w-5 h-5" />
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
