"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Copy, Clock, CalendarDays } from "lucide-react";

export default function TimestampPage() {
  const [currentUnix, setCurrentUnix] = useState(Math.floor(Date.now() / 1000));
  const [inputUnix, setInputUnix] = useState(currentUnix.toString());
  const [localTime, setLocalTime] = useState("");
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUnix(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    updateTimes(inputUnix);
  }, [inputUnix]);

  const updateTimes = (unixStr: string) => {
    const num = parseInt(unixStr, 10);
    if (!isNaN(num) && num > 0) {
      // Assuming it's in seconds if it's less than 3000-01-01 in ms
      const ms = num < 32503680000 ? num * 1000 : num;
      const d = new Date(ms);
      setLocalTime(d.toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" }));
      setUtcTime(d.toUTCString());
    } else {
      setLocalTime("Invalid Timestamp");
      setUtcTime("Invalid Timestamp");
    }
  };

  const setNow = () => {
    setInputUnix(Math.floor(Date.now() / 1000).toString());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <PageHeader 
        title="Unix Timestamp Converter" 
        description="Convert epoch timestamps to human-readable dates in local and UTC formats." 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div className="flex flex-col gap-6">
          <div className="p-6 glass-card border border-fuchsia-500/20 shadow-[0_0_20px_rgba(217,70,239,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Current Unix Time
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-mono font-bold tracking-tight text-white">{currentUnix}</span>
              <button 
                onClick={() => handleCopy(currentUnix.toString())}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                title="Copy current time"
              >
                <Copy className="w-4 h-4 text-zinc-300" />
              </button>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white mb-2">Convert Timestamp</h3>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">Timestamp (Seconds or MS)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputUnix}
                  onChange={(e) => setInputUnix(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-lg focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
                <button 
                  onClick={setNow}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 font-medium"
                >
                  Now
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-8 h-full">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-fuchsia-400" />
              Human Readable Dates
            </h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-400">Local Time</label>
                <button 
                  onClick={() => handleCopy(localTime)}
                  className="text-xs flex items-center gap-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-medium text-lg leading-relaxed text-zinc-100">
                {localTime}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-400">UTC Time</label>
                <button 
                  onClick={() => handleCopy(utcTime)}
                  className="text-xs flex items-center gap-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-medium text-lg leading-relaxed text-zinc-100">
                {utcTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
