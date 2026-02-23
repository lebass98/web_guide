"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2 } from "lucide-react";

export default function HtmlCharsPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleConvert = (text: string) => {
    setInput(text);
    // Remove or decode HTML entities
    // A simple browser built-in way to decode HTML entities
    try {
      const doc = new DOMParser().parseFromString(text, "text/html");
      setOutput(doc.documentElement.textContent || "");
    } catch (e) {
      setOutput(text);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <PageHeader 
        title="HTML Special Character Remover" 
        description="Decode HTML entities and remove special characters instantly." 
      />
      
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">Input HTML</label>
          <textarea
            className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
            placeholder="Paste your HTML string here... e.g. &lt;div&gt;Hello&lt;/div&gt;"
            value={input}
            onChange={(e) => handleConvert(e.target.value)}
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Output Result</label>
            <div className="flex gap-2">
              <button 
                onClick={() => handleConvert("")}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleCopy}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            readOnly
            className="flex-1 w-full p-4 glass-card resize-none font-mono text-sm text-fuchsia-100"
            placeholder="Clean text will appear here..."
            value={output}
          />
        </div>
      </div>
    </div>
  );
}
