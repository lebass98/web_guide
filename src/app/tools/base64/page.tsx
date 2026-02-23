"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Base64Page() {
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
        setOutput(btoa(unescape(encodeURIComponent(text))));
      } else {
        setOutput(decodeURIComponent(escape(atob(text))));
      }
      setError(null);
    } catch (err) {
      setError(currentMode === "decode" ? "Invalid Base64 sequence." : "Failed to encode.");
      setOutput("");
    }
  };

  const handleModeSwitch = (newMode: "encode" | "decode") => {
    setMode(newMode);
    processText(input, newMode);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <PageHeader 
        title="Base64 Encoder/Decoder" 
        description="Safely encode text to Base64 format or decode it back to plain text." 
      />
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleModeSwitch("encode")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            mode === "encode" 
              ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]" 
              : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          Encode
        </button>
        <button
          onClick={() => handleModeSwitch("decode")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            mode === "decode" 
              ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]" 
              : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          Decode
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[400px]">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">Input</label>
          <textarea
            className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
            placeholder={mode === "encode" ? "Type text to encode..." : "Paste Base64 to decode..."}
            value={input}
            onChange={(e) => processText(e.target.value, mode)}
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Output Result</label>
            <div className="flex gap-2">
              <button 
                onClick={() => processText("", mode)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(output)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  output ? "text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10" : "text-zinc-500 cursor-not-allowed"
                )}
                title="Copy to clipboard"
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
              placeholder="Result will appear here..."
              value={output}
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
