"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw } from "lucide-react";

export default function QrGeneratorPage() {
  const [input, setInput] = useState("https://tool.yeongsby.com/");

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw white background
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qrcode.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <PageHeader 
        title="QR Code Generator" 
        description="Instantly generate and download high-quality QR codes." 
      />
      
      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        <div className="flex-1 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">URL or Text</label>
              <textarea
                className="w-full h-32 p-4 bg-black/50 border border-white/10 rounded-xl resize-none font-mono text-sm focus:outline-none focus:border-fuchsia-500 transition-colors"
                placeholder="Enter URL or text to encode..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setInput("")}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors border border-white/10 flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:w-96 flex flex-col items-center justify-center gap-6 glass-card p-8">
          <div className="bg-white p-4 rounded-xl shadow-2xl relative group">
            <QRCodeSVG 
              id="qr-code-svg"
              value={input || " "} 
              size={240} 
              level={"H"}
              includeMargin={true}
            />
          </div>
          
          <button 
            disabled={!input.trim()}
            onClick={downloadQR}
            className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:hover:bg-fuchsia-600 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,38,211,0.4)] disabled:shadow-none"
          >
            <Download className="w-5 h-5" /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
