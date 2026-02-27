"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { 
  Square, 
  Circle, 
  Hexagon, 
  MousePointer2, 
  Trash2, 
  Copy, 
  Download, 
  Upload,
  Plus,
  Settings2,
  Code as CodeIcon,
  ChevronRight,
  Target,
  Type,
  Link as LinkIcon,
  X,
  Maximize2,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

type ShapeType = "rect" | "circle" | "poly";

interface MapArea {
  id: string;
  type: ShapeType;
  coords: number[];
  href: string;
  alt: string;
  title: string;
  target: "_blank" | "_self" | "_parent" | "_top";
}

export default function ImageMapPage() {
  const [image, setImage] = useState<string | null>(null);
  const [mapName, setMapName] = useState("workmap");
  const [areas, setAreas] = useState<MapArea[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState<ShapeType>("rect");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<"edit" | "code">("edit");
  const [zoom, setZoom] = useState(1);

  const imgRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setAreas([]);
        setSelectedId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Scale coordinates back to original image size
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;

    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);

    return { x, y };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image || viewMode === "code") return;
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !image) return;
    const { x, y } = getCoordinates(e);
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const x1 = Math.min(startPos.x, currentPos.x);
    const y1 = Math.min(startPos.y, currentPos.y);
    const x2 = Math.max(startPos.x, currentPos.x);
    const y2 = Math.max(startPos.y, currentPos.y);

    if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
      const newArea: MapArea = {
        id: Math.random().toString(36).substr(2, 9),
        type: drawingMode,
        coords: drawingMode === "rect" ? [x1, y1, x2, y2] : [],
        href: "https://",
        alt: `영역 ${areas.length + 1}`,
        title: `영역 ${areas.length + 1}`,
        target: "_blank",
      };
      setAreas([...areas, newArea]);
      setSelectedId(newArea.id);
    }
  };

  const deleteArea = (id: string) => {
    setAreas(areas.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateArea = (id: string, updates: Partial<MapArea>) => {
    setAreas(areas.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const generateCode = () => {
    let code = `<!-- 이미지 맵 시작 -->\n`;
    code += `<img src="IMAGE_PATH.jpg" usemap="#${mapName}" alt="이미지 설명">\n\n`;
    code += `<map name="${mapName}">\n`;
    areas.forEach(area => {
      const coords = area.coords.join(",");
      code += `  <area shape="${area.type}" coords="${coords}" href="${area.href}" alt="${area.alt}" title="${area.title}" target="${area.target}">\n`;
    });
    code += `</map>\n`;
    code += `<!-- 이미지 맵 끝 -->`;
    return code;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCode());
  };

  const downloadHtml = () => {
    const element = document.createElement("a");
    const file = new Blob([generateCode()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${mapName}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Convert natural coordinates to visual coordinates for highlighting
  const getVisualRect = (area: MapArea) => {
    if (!imgRef.current) return { x: 0, y: 0, width: 0, height: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = rect.width / imgRef.current.naturalWidth;
    const scaleY = rect.height / imgRef.current.naturalHeight;

    return {
      x: area.coords[0] * scaleX,
      y: area.coords[1] * scaleY,
      width: (area.coords[2] - area.coords[0]) * scaleX,
      height: (area.coords[3] - area.coords[1]) * scaleY
    };
  };

  return (
    <>
      <PageHeader 
        title="이미지 맵 에디터" 
        description="이미지 위에 클릭 가능한 다중 링크 영역을 직접 정의하고 바로 사용할 수 있는 HTML 코드를 생성하세요." 
      />

      <div className="flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-250px)]">
        {/* Left Toolbar - Standard Tools Aesthetic */}
        <div className="w-full lg:w-20 flex lg:flex-col gap-3 p-3 glass-card bg-white/40 shadow-xl self-start sticky top-0">
          <button 
            onClick={() => { setDrawingMode("rect"); setViewMode("edit"); }}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 group",
              drawingMode === "rect" && viewMode === "edit"
                ? "bg-fuchsia-100 text-fuchsia-600 shadow-inner" 
                : "text-zinc-400 hover:bg-zinc-100/50 hover:text-zinc-600"
            )}
            title="사각형 그리기"
          >
            <Square className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Rect</span>
          </button>
          
          <button 
            disabled
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-zinc-300 cursor-not-allowed opacity-30"
            title="원형 (준비 중)"
          >
            <Circle className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Circle</span>
          </button>

          <div className="h-px w-full bg-zinc-200/50 my-2 hidden lg:block" />
          <div className="w-px h-full bg-zinc-200/50 mx-2 lg:hidden" />

          <button 
            onClick={() => setViewMode(viewMode === "edit" ? "code" : "edit")}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300",
              viewMode === "code" 
                ? "bg-fuchsia-100 text-fuchsia-600 shadow-inner" 
                : "text-zinc-400 hover:bg-zinc-100/50 hover:text-zinc-600"
            )}
            title="코드 생성 및 보기"
          >
            <CodeIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Code</span>
          </button>

          <button 
            onClick={() => { setImage(null); setAreas([]); setSelectedId(null); }}
            className="mt-auto flex flex-col items-center gap-1.5 p-3 rounded-2xl text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300"
            title="새로 만들기"
          >
            <RefreshCcw className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Reset</span>
          </button>
        </div>

        {/* Main Editor Workarea */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-[500px]">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-4 glass-card bg-zinc-50/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <label className="group relative flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-zinc-200 overflow-hidden active:scale-95">
                <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                <span className="text-sm font-semibold">이미지 불러오기</span>
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
              
              {image && (
                <div className="flex items-center gap-3 px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm animate-in fade-in slide-in-from-left-2 duration-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-tighter">
                    {areas.length} Areas Created
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1 px-2 hover:bg-white rounded transition-colors text-xs font-bold">-</button>
                <span className="text-[10px] font-mono w-12 text-center text-zinc-500">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1 px-2 hover:bg-white rounded transition-colors text-xs font-bold">+</button>
              </div>
              <button 
                disabled={!image}
                onClick={downloadHtml}
                className="p-2.5 text-zinc-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                title="HTML 파일로 다운로드"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Editor Surface */}
          <div className="flex-1 glass-card overflow-auto relative min-h-[400px] flex items-center justify-center bg-zinc-800/10 p-8 checkerboard-pattern group/surface">
            {viewMode === "edit" ? (
              image ? (
                <div 
                  className="relative transition-transform duration-300 ease-out shadow-2xl bg-white"
                  style={{ transform: `scale(${zoom})` }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <img 
                    ref={imgRef}
                    src={image} 
                    alt="Editor Workspace" 
                    className="max-w-none select-none pointer-events-none"
                    draggable={false}
                  />
                  <svg 
                    ref={svgRef}
                    className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
                    viewBox={imgRef.current ? `0 0 ${imgRef.current.naturalWidth} ${imgRef.current.naturalHeight}` : "0 0 100 100"}
                  >
                    {/* Rendered Areas */}
                    {areas.map(area => (
                      <g key={area.id} className="group/area cursor-pointer">
                        <rect
                          x={area.coords[0]}
                          y={area.coords[1]}
                          width={area.coords[2] - area.coords[0]}
                          height={area.coords[3] - area.coords[1]}
                          className={cn(
                            "transition-all duration-200",
                            selectedId === area.id 
                              ? "fill-fuchsia-500/30 stroke-fuchsia-500 stroke-[4px]" 
                              : "fill-fuchsia-500/10 stroke-fuchsia-500/60 stroke-[2px] group-hover/area:fill-fuchsia-500/20"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(area.id);
                          }}
                        />
                        {/* Area Label on Hover */}
                        <text
                          x={area.coords[0] + 5}
                          y={area.coords[1] + 15}
                          className={cn(
                            "text-[10px] font-bold pointer-events-none transition-opacity",
                            selectedId === area.id ? "opacity-100 fill-fuchsia-700" : "opacity-0 group-hover/area:opacity-100 fill-fuchsia-500"
                          )}
                        >
                          {area.title}
                        </text>
                      </g>
                    ))}
                    
                    {/* Active Drawing Preview */}
                    {isDrawing && drawingMode === "rect" && (
                      <rect
                        x={Math.min(startPos.x, currentPos.x)}
                        y={Math.min(startPos.y, currentPos.y)}
                        width={Math.abs(currentPos.x - startPos.x)}
                        height={Math.abs(currentPos.y - startPos.y)}
                        className="fill-fuchsia-500/10 stroke-fuchsia-400 stroke-[3px]"
                        strokeDasharray="8,8"
                      />
                    )}
                  </svg>
                </div>
              ) : (
                <div className="text-zinc-400 flex flex-col items-center gap-6 animate-pulse">
                  <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center border-4 border-dashed border-zinc-200">
                    <Upload className="w-10 h-10 opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-zinc-600 mb-1">작업을 위해 이미지를 업로드하세요</p>
                    <p className="text-sm opacity-60">드래그하여 클릭 영역을 설정할 수 있습니다</p>
                  </div>
                </div>
              )
            ) : (
              <div className="w-full h-full p-0 flex flex-col">
                <div className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 mr-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-mono font-bold opacity-60 tracking-widest uppercase">HTML Output</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-zinc-950 p-8 font-mono text-sm overflow-auto text-fuchsia-400 selection:bg-fuchsia-500/30 selection:text-white">
                  <pre>{generateCode()}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Properties Panel - Premium Sidebar Aesthetic */}
        <div className="w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="glass-card bg-white p-6 shadow-xl border-zinc-100 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                <Settings2 className="w-5 h-5 text-fuchsia-500" />
                Configuration
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">맵 이름 (name)</label>
                <div className="relative">
                   <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                   <input 
                    type="text" 
                    value={mapName}
                    onChange={(e) => setMapName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none text-sm font-bold transition-all"
                    placeholder="map-name"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100 my-2" />

            {selectedId ? (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {areas.filter(a => a.id === selectedId).map(area => (
                  <div key={area.id} className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-fuchsia-100 text-fuchsia-600 rounded uppercase">Active Area Settings</span>
                      <button onClick={() => setSelectedId(null)} className="text-zinc-300 hover:text-zinc-600"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">링크 주소 (href)</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                        <input 
                          type="text" 
                          value={area.href}
                          onChange={(e) => updateArea(area.id, { href: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-fuchsia-50/30 border border-fuchsia-100 rounded-xl focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none text-sm font-medium text-zinc-700 transition-all"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">대체 텍스트 (alt)</label>
                        <input 
                          type="text" 
                          value={area.alt}
                          onChange={(e) => updateArea(area.id, { alt: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">타겟 (target)</label>
                        <select 
                          value={area.target}
                          onChange={(e) => updateArea(area.id, { target: e.target.value as any })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold transition-all appearance-none cursor-pointer"
                        >
                          <option value="_blank">New Tab</option>
                          <option value="_self">Current</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">타이틀 (title)</label>
                      <input 
                        type="text" 
                        value={area.title}
                        onChange={(e) => updateArea(area.id, { title: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium transition-all"
                      />
                    </div>

                    <button 
                      onClick={() => deleteArea(area.id)}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-rose-100 bg-rose-50/30 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all group/del"
                    >
                      <Trash2 className="w-4 h-4 group-hover:shake transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest">Delete This Area</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 text-center py-12 px-6 border-2 border-dashed border-zinc-50 rounded-3xl bg-zinc-50/30">
                <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center mb-4 transition-transform hover:rotate-12 duration-500">
                  <MousePointer2 className="w-8 h-8 text-zinc-200" />
                </div>
                <p className="text-sm font-bold text-zinc-400 leading-relaxed">
                  편집할 영역을 선택하거나<br />이미지 위를 드래그하여<br />새로운 영역을 만드세요
                </p>
              </div>
            )}
          </div>

          <div className="glass-card bg-zinc-900 border-zinc-800 p-6 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Plus className="w-4 h-4 text-fuchsia-400" />
                  Area Layers
                </h3>
             </div>
             <div className="space-y-2 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
              {areas.length === 0 ? (
                <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">No Layers Yet</p>
                </div>
              ) : (
                areas.map((area, index) => (
                  <div 
                    key={area.id}
                    onClick={() => setSelectedId(area.id)}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300",
                      selectedId === area.id 
                        ? "bg-fuchsia-500 shadow-lg shadow-fuchsia-500/20 scale-[1.02]" 
                        : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors",
                        selectedId === area.id ? "bg-white text-fuchsia-600" : "bg-zinc-800 text-zinc-500"
                      )}>
                        {index + 1}
                      </div>
                      <span className={cn(
                        "text-xs font-bold truncate tracking-tight",
                        selectedId === area.id ? "text-white" : "text-zinc-300"
                      )}>
                        {area.title || "New Area layer"}
                      </span>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      selectedId === area.id ? "text-white rotate-90" : "text-zinc-600 group-hover:translate-x-1"
                    )} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .checkerboard-pattern {
          background-image: 
            linear-gradient(45deg, #f8f8f8 25%, transparent 25%), 
            linear-gradient(-45deg, #f8f8f8 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #f8f8f8 75%), 
            linear-gradient(-45deg, transparent 75%, #f8f8f8 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </>
  );
}
