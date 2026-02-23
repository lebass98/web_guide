"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Trash2, ArrowRight } from "lucide-react";

export default function TextTransformerPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeTransform, setActiveTransform] = useState<string>("uppercase");

  const transforms = [
    { id: "uppercase", label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
    { id: "lowercase", label: "lowercase", fn: (s: string) => s.toLowerCase() },
    { id: "titlecase", label: "Title Case", fn: (s: string) => s.replace(/\\w\\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) },
    { id: "nospaces", label: "Remove Spaces", fn: (s: string) => s.replace(/\\s/g, "") },
    { id: "reverse", label: "Reverse Text", fn: (s: string) => s.split("").reverse().join("") }
  ];

  const handleTransform = (text: string, transformId: string) => {
    setInput(text);
    setActiveTransform(transformId);
    
    const transform = transforms.find(t => t.id === transformId);
    if (transform) {
      setOutput(transform.fn(text));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <PageHeader 
        title="Text Transformer" 
        description="Convert string casing, remove spaces, and apply various text manipulations." 
      />
      
      <div className="flex flex-wrap gap-2 mb-6">
        {transforms.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTransform(input, t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTransform === t.id 
                ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50" 
                : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[400px]">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">Input Text</label>
          <textarea
            className="flex-1 w-full p-4 glass-card resize-none text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
            placeholder="Type or paste your text here..."
            value={input}
            onChange={(e) => handleTransform(e.target.value, activeTransform)}
          />
        </div>
        
        <div className="hidden lg:flex items-center justify-center opacity-50">
          <ArrowRight className="w-8 h-8 text-fuchsia-500" />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Transformed Result</label>
            <div className="flex gap-2">
              <button 
                onClick={() => handleTransform("", activeTransform)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleCopy}
                className="p-1.5 text-zinc-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            readOnly
            className="flex-1 w-full p-4 glass-card resize-none text-sm text-fuchsia-100"
            placeholder="Result will appear here..."
            value={output}
          />
        </div>
      </div>
    </div>
  );
}
