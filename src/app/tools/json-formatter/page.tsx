"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatJson = (text: string) => {
    setInput(text);
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
      setOutput("");
    }
  };

  const handleCopy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <PageHeader 
        title="JSON Formatter & Validator" 
        description="Format, validate, and beautify your JSON data instantly." 
      />
      
      <div className="flex items-center gap-2 mb-4">
        {error ? (
          <div className="flex items-center gap-2 text-destructive-foreground bg-destructive/20 px-3 py-1.5 rounded-md text-sm font-medium">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        ) : input.trim() ? (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Valid JSON
          </div>
        ) : null}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[500px]">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">Input JSON</label>
          <textarea
            className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
            placeholder="Paste your minified or unformatted JSON here..."
            value={input}
            onChange={(e) => formatJson(e.target.value)}
            spellCheck={false}
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Formatted Output</label>
            <div className="flex gap-2">
              <button 
                onClick={() => formatJson("")}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleCopy}
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
          <textarea
            readOnly
            className={cn(
              "flex-1 w-full p-4 glass-card resize-none font-mono text-sm",
              error ? "text-zinc-500 opacity-50" : "text-fuchsia-100"
            )}
            placeholder="Formatted JSON will appear here..."
            value={output}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
