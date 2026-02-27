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
    Type,
    Link as LinkIcon,
    X,
    RefreshCcw,
    MousePointer,
    Hand,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ShapeType = "select" | "rect" | "circle" | "poly";
type CreationMethod = "drag" | "click";

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
    const [imageUrl, setImageUrl] = useState("");
    const [mapName, setMapName] = useState("workmap");
    const [areas, setAreas] = useState<MapArea[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [drawingMode, setDrawingMode] = useState<ShapeType>("rect");
    const [creationMethod, setCreationMethod] = useState<CreationMethod>("drag");

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
    const [tempPolyPoints, setTempPolyPoints] = useState<{ x: number; y: number }[]>([]);
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [resizingHandle, setResizingHandle] = useState<{ id: string; index: number } | null>(
        null
    );
    const [movingArea, setMovingArea] = useState<{
        id: string;
        startX: number;
        startY: number;
        initialCoords: number[];
    } | null>(null);

    const [viewMode, setViewMode] = useState<"edit" | "code">("edit");
    const [zoom, setZoom] = useState(1);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; areaId: string } | null>(
        null
    );
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingAreaId, setEditingAreaId] = useState<string | null>(null);

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
                setImageUrl("");
                setTempPolyPoints([]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUrlLoad = () => {
        if (imageUrl.trim()) {
            setImage(imageUrl);
            setAreas([]);
            setSelectedId(null);
            setTempPolyPoints([]);
        }
    };

    const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!imgRef.current) return { x: 0, y: 0 };
        const rect = imgRef.current.getBoundingClientRect();

        let clientX, clientY;
        if ("touches" in e) {
            clientX = e.touches?.[0]?.clientX || 0;
            clientY = e.touches?.[0]?.clientY || 0;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const scaleX = imgRef.current.naturalWidth / rect.width;
        const scaleY = imgRef.current.naturalHeight / rect.height;

        const x = Math.round((clientX - rect.left) * scaleX);
        const y = Math.round((clientY - rect.top) * scaleY);

        return { x, y };
    }, []);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, areaId: id });
        setSelectedId(id);
    };

    const finishPoly = useCallback(() => {
        if (tempPolyPoints.length < 3) return;

        const coords = tempPolyPoints.flatMap((p) => [p.x, p.y]);
        const newArea: MapArea = {
            id: Math.random().toString(36).substr(2, 9),
            type: "poly",
            coords,
            href: "https://",
            alt: `영역 ${areas.length + 1}`,
            title: `영역 ${areas.length + 1}`,
            target: "_blank",
        };
        setAreas([...areas, newArea]);
        setSelectedId(newArea.id);
        setTempPolyPoints([]);
        setIsDrawing(false);
    }, [tempPolyPoints, areas]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!image || viewMode === "code") return;
        const { x, y } = getCoordinates(e);

        if (drawingMode === "select") {
            setSelectedId(null);
            return;
        }

        if (drawingMode === "poly") {
            setIsDrawing(true);
            setTempPolyPoints((prev) => [...prev, { x, y }]);
            return;
        }

        if (creationMethod === "drag") {
            setIsDrawing(true);
            setStartPos({ x, y });
            setCurrentPos({ x, y });
        } else {
            // Click method
            if (!isDrawing) {
                setIsDrawing(true);
                setStartPos({ x, y });
                setCurrentPos({ x, y });
            } else {
                // Complete the shape
                completeShape(x, y);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { x, y } = getCoordinates(e);

        if (resizingHandle) {
            const area = areas.find((a) => a.id === resizingHandle.id);
            if (!area) return;

            const newCoords = [...area.coords];
            if (area.type === "rect") {
                if (resizingHandle.index === 0) {
                    newCoords[0] = x;
                    newCoords[1] = y;
                }
                if (resizingHandle.index === 1) {
                    newCoords[2] = x;
                    newCoords[1] = y;
                }
                if (resizingHandle.index === 2) {
                    newCoords[2] = x;
                    newCoords[3] = y;
                }
                if (resizingHandle.index === 3) {
                    newCoords[0] = x;
                    newCoords[3] = y;
                }
            } else if (area.type === "circle") {
                const radius = Math.round(
                    Math.sqrt(Math.pow(x - newCoords[0], 2) + Math.pow(y - newCoords[1], 2))
                );
                newCoords[2] = radius;
            } else if (area.type === "poly") {
                newCoords[resizingHandle.index * 2] = x;
                newCoords[resizingHandle.index * 2 + 1] = y;
            }
            updateArea(area.id, { coords: newCoords });
            return;
        }

        if (movingArea) {
            const dx = x - movingArea.startX;
            const dy = y - movingArea.startY;
            const newCoords = movingArea.initialCoords.map((coord, i) => {
                if (movingArea.initialCoords.length === 3 && i === 2) return coord; // Don't shift radius for circle
                return i % 2 === 0 ? coord + dx : coord + dy;
            });
            updateArea(movingArea.id, { coords: newCoords });
            return;
        }

        if (!isDrawing || !image) return;
        setCurrentPos({ x, y });
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (resizingHandle) {
            setResizingHandle(null);
            return;
        }

        if (movingArea) {
            setMovingArea(null);
            return;
        }

        if (!isDrawing || drawingMode === "poly") return;

        if (creationMethod === "drag") {
            const { x, y } = getCoordinates(e);
            completeShape(x, y);
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent, id: string, index: number) => {
        e.stopPropagation();
        setResizingHandle({ id, index });
    };

    const handleAreaMouseDown = (e: React.MouseEvent, area: MapArea) => {
        e.stopPropagation();
        setSelectedId(area.id);
        const { x, y } = getCoordinates(e);
        setMovingArea({
            id: area.id,
            startX: x,
            startY: y,
            initialCoords: [...area.coords],
        });
    };

    const completeShape = (endX: number, endY: number) => {
        setIsDrawing(false);
        let coords: number[] = [];

        if (drawingMode === "rect") {
            const x1 = Math.min(startPos.x, endX);
            const y1 = Math.min(startPos.y, endY);
            const x2 = Math.max(startPos.x, endX);
            const y2 = Math.max(startPos.y, endY);
            if (Math.abs(x2 - x1) < 5 || Math.abs(y2 - y1) < 5) return;
            coords = [x1, y1, x2, y2];
        } else if (drawingMode === "circle") {
            const radius = Math.round(
                Math.sqrt(Math.pow(endX - startPos.x, 2) + Math.pow(endY - startPos.y, 2))
            );
            if (radius < 5) return;
            coords = [startPos.x, startPos.y, radius];
        }

        const newArea: MapArea = {
            id: Math.random().toString(36).substr(2, 9),
            type: drawingMode,
            coords,
            href: "https://",
            alt: `영역 ${areas.length + 1}`,
            title: `영역 ${areas.length + 1}`,
            target: "_blank",
        };
        setAreas([...areas, newArea]);
        setSelectedId(newArea.id);
    };

    const deleteArea = (id: string) => {
        setAreas(areas.filter((a) => a.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const updateArea = (id: string, updates: Partial<MapArea>) => {
        setAreas(areas.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    };

    const generateCode = () => {
        let code = `<!-- 이미지 맵 시작 -->\n`;
        code += `<img src="IMAGE_PATH.jpg" usemap="#${mapName}" alt="이미지 설명">\n\n`;
        code += `<map name="${mapName}">\n`;
        areas.forEach((area) => {
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

    const getAreaCenter = (area: MapArea) => {
        if (area.type === "rect") {
            return {
                x: (area.coords[0] + area.coords[2]) / 2,
                y: (area.coords[1] + area.coords[3]) / 2,
            };
        } else if (area.type === "circle") {
            return { x: area.coords[0], y: area.coords[1] };
        } else if (area.type === "poly") {
            let sumX = 0,
                sumY = 0;
            for (let i = 0; i < area.coords.length; i += 2) {
                sumX += area.coords[i];
                sumY += area.coords[i + 1];
            }
            return {
                x: sumX / (area.coords.length / 2),
                y: sumY / (area.coords.length / 2),
            };
        }
        return { x: 0, y: 0 };
    };

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newAreas = [...areas];
        const item = newAreas.splice(draggedIndex, 1)[0];
        newAreas.splice(index, 0, item);

        setAreas(newAreas);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <>
            <PageHeader
                title="이미지 맵 에디터"
                description="이미지 위에 사각형, 원형, 다각형 등 다양한 클릭 영역을 자유롭게 정의하세요."
            />

            <div className="flex flex-col lg:flex-row gap-6 lg:max-h-[calc(100vh-250px)]">
                {/* Left Toolbar */}
                <div className="w-full lg:w-16 flex lg:flex-col gap-3 p-2.5 glass-card bg-white/40 shadow-xl self-start sticky top-0 z-10 transition-all duration-300">
                    <button
                        onClick={() => {
                            setDrawingMode("select");
                            setTempPolyPoints([]);
                        }}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group",
                            drawingMode === "select"
                                ? "bg-fuchsia-100 text-fuchsia-600 shadow-inner"
                                : "text-zinc-400 hover:bg-zinc-100/50"
                        )}
                    >
                        <MousePointer2 className="w-6 h-6" />
                        <span className="text-[11px] font-bold uppercase lg:hidden mt-1">선택</span>
                        <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50">
                            선택 및 이동
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-900" />
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            setDrawingMode("rect");
                            setTempPolyPoints([]);
                        }}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group",
                            drawingMode === "rect"
                                ? "bg-fuchsia-100 text-fuchsia-600 shadow-inner"
                                : "text-zinc-400 hover:bg-zinc-100/50"
                        )}
                    >
                        <Square className="w-6 h-6" />
                        <span className="text-[11px] font-bold uppercase lg:hidden mt-1">
                            사각형
                        </span>
                        <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50">
                            사각형 그리기
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-900" />
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            setDrawingMode("circle");
                            setTempPolyPoints([]);
                        }}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group",
                            drawingMode === "circle"
                                ? "bg-fuchsia-100 text-fuchsia-600 shadow-inner"
                                : "text-zinc-400 hover:bg-zinc-100/50"
                        )}
                    >
                        <Circle className="w-6 h-6" />
                        <span className="text-[11px] font-bold uppercase lg:hidden mt-1">원형</span>
                        <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50">
                            원형 그리기
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-900" />
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            setDrawingMode("poly");
                            setTempPolyPoints([]);
                        }}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group",
                            drawingMode === "poly"
                                ? "bg-fuchsia-100 text-fuchsia-600 shadow-inner"
                                : "text-zinc-400 hover:bg-zinc-100/50"
                        )}
                    >
                        <Hexagon className="w-6 h-6" />
                        <span className="text-[11px] font-bold uppercase lg:hidden mt-1">
                            다각형
                        </span>
                        <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50">
                            다각형 그리기
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-900" />
                        </div>
                    </button>

                    <div className="h-px w-full bg-zinc-200/50 my-1 hidden lg:block" />

                    <div className="lg:mt-auto flex lg:flex-col gap-3">
                        <button
                            onClick={() => setViewMode(viewMode === "edit" ? "code" : "edit")}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group",
                                viewMode === "code"
                                    ? "bg-fuchsia-100 text-fuchsia-600 shadow-inner"
                                    : "text-zinc-400 hover:bg-zinc-100/50"
                            )}
                        >
                            <CodeIcon className="w-6 h-6" />
                            <span className="text-[11px] font-bold uppercase lg:hidden mt-1">
                                코드
                            </span>
                            <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50">
                                코드 보기
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-900" />
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setImage(null);
                                setAreas([]);
                                setSelectedId(null);
                                setTempPolyPoints([]);
                            }}
                            className="relative flex flex-col items-center justify-center p-3 rounded-2xl text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-all group"
                        >
                            <RefreshCcw className="w-6 h-6" />
                            <span className="text-[11px] font-bold uppercase lg:hidden mt-1">
                                초기화
                            </span>
                            <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50 font-bold">
                                전체 초기화
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-rose-600" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Main Editor Workarea */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 gap-4 glass-card bg-zinc-50/50 backdrop-blur-md">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                            <label className="group relative flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl cursor-pointer transition-all shadow-lg flex-shrink-0">
                                <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                <span className="text-sm font-semibold">파일 업로드</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                />
                            </label>

                            <button
                                onClick={() => setIsUrlModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl transition-all shadow-sm flex-shrink-0 font-semibold text-sm"
                            >
                                <LinkIcon className="w-4 h-4" />
                                <span>URL 불러오기</span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 self-center">
                            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 shadow-inner mr-2">
                                <button
                                    onClick={() => setCreationMethod("drag")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold uppercase transition-all",
                                        creationMethod === "drag"
                                            ? "bg-white text-zinc-900 shadow-sm"
                                            : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <Hand className="w-3.5 h-3.5" /> 드래그
                                </button>
                                <button
                                    onClick={() => setCreationMethod("click")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold uppercase transition-all",
                                        creationMethod === "click"
                                            ? "bg-white text-zinc-900 shadow-sm"
                                            : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <MousePointer className="w-3.5 h-3.5" /> 클릭
                                </button>
                            </div>

                            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                                <button
                                    onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                                    className="p-1 px-2 hover:bg-white rounded transition-colors text-sm font-bold"
                                >
                                    -
                                </button>
                                <span className="text-sm font-mono w-12 text-center text-zinc-500">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                                    className="p-1 px-2 hover:bg-white rounded transition-colors text-sm font-bold"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                disabled={!image}
                                onClick={downloadHtml}
                                className="p-2.5 text-zinc-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl disabled:opacity-30 transition-all"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 glass-card overflow-auto relative min-h-[450px] flex items-center justify-center bg-zinc-800/10 p-8 checkerboard-pattern group/surface">
                        {viewMode === "edit" ? (
                            image ? (
                                <div
                                    className="relative transition-transform shadow-2xl bg-white"
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
                                        className={cn(
                                            "absolute inset-0 w-full h-full pointer-events-auto transition-all",
                                            drawingMode === "select"
                                                ? "cursor-default"
                                                : "cursor-crosshair"
                                        )}
                                        viewBox={
                                            imgRef.current
                                                ? `0 0 ${imgRef.current.naturalWidth} ${imgRef.current.naturalHeight}`
                                                : "0 0 100 100"
                                        }
                                    >
                                        {areas.map((area, index) => {
                                            const center = getAreaCenter(area);
                                            return (
                                                <g
                                                    key={area.id}
                                                    className="group/area cursor-pointer"
                                                >
                                                    {area.type === "rect" && (
                                                        <rect
                                                            x={area.coords[0]}
                                                            y={area.coords[1]}
                                                            width={area.coords[2] - area.coords[0]}
                                                            height={area.coords[3] - area.coords[1]}
                                                            className={cn(
                                                                "transition-all cursor-move",
                                                                selectedId === area.id
                                                                    ? "fill-fuchsia-500/30 stroke-fuchsia-500 stroke-[4px]"
                                                                    : "fill-fuchsia-500/10 stroke-fuchsia-500/60 stroke-[2px] group-hover/area:fill-fuchsia-500/20"
                                                            )}
                                                            onMouseDown={(e) =>
                                                                handleAreaMouseDown(e, area)
                                                            }
                                                            onContextMenu={(e) =>
                                                                handleContextMenu(e, area.id)
                                                            }
                                                        />
                                                    )}
                                                    {area.type === "circle" && (
                                                        <circle
                                                            cx={area.coords[0]}
                                                            cy={area.coords[1]}
                                                            r={area.coords[2]}
                                                            className={cn(
                                                                "transition-all cursor-move",
                                                                selectedId === area.id
                                                                    ? "fill-fuchsia-500/30 stroke-fuchsia-500 stroke-[4px]"
                                                                    : "fill-fuchsia-500/10 stroke-fuchsia-500/60 stroke-[2px] group-hover/area:fill-fuchsia-500/20"
                                                            )}
                                                            onMouseDown={(e) =>
                                                                handleAreaMouseDown(e, area)
                                                            }
                                                            onContextMenu={(e) =>
                                                                handleContextMenu(e, area.id)
                                                            }
                                                        />
                                                    )}
                                                    {area.type === "poly" && (
                                                        <polygon
                                                            points={area.coords.join(",")}
                                                            className={cn(
                                                                "transition-all cursor-move",
                                                                selectedId === area.id
                                                                    ? "fill-fuchsia-500/30 stroke-fuchsia-500 stroke-[4px]"
                                                                    : "fill-fuchsia-500/10 stroke-fuchsia-500/60 stroke-[2px] group-hover/area:fill-fuchsia-500/20"
                                                            )}
                                                            onMouseDown={(e) =>
                                                                handleAreaMouseDown(e, area)
                                                            }
                                                            onContextMenu={(e) =>
                                                                handleContextMenu(e, area.id)
                                                            }
                                                        />
                                                    )}

                                                    {/* Area Number Label */}
                                                    <g className="pointer-events-none">
                                                        <rect
                                                            x={center.x - 12 / zoom}
                                                            y={center.y - 12 / zoom}
                                                            width={24 / zoom}
                                                            height={24 / zoom}
                                                            rx={12 / zoom}
                                                            className={cn(
                                                                "fill-white/80 stroke-zinc-200 stroke-[1px] shadow-sm transition-all",
                                                                selectedId === area.id
                                                                    ? "fill-fuchsia-600 stroke-fuchsia-400"
                                                                    : ""
                                                            )}
                                                        />
                                                        <text
                                                            x={center.x}
                                                            y={center.y}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            className={cn(
                                                                "font-bold transition-all",
                                                                selectedId === area.id
                                                                    ? "fill-white"
                                                                    : "fill-zinc-700"
                                                            )}
                                                            style={{ fontSize: `${12 / zoom}px` }}
                                                        >
                                                            #{index + 1}
                                                        </text>
                                                    </g>

                                                    {/* Resize Handles */}
                                                    {selectedId === area.id && (
                                                        <g>
                                                            {area.type === "rect" &&
                                                                [
                                                                    {
                                                                        x: area.coords[0],
                                                                        y: area.coords[1],
                                                                        cursor: "nw-resize",
                                                                    },
                                                                    {
                                                                        x: area.coords[2],
                                                                        y: area.coords[1],
                                                                        cursor: "ne-resize",
                                                                    },
                                                                    {
                                                                        x: area.coords[2],
                                                                        y: area.coords[3],
                                                                        cursor: "se-resize",
                                                                    },
                                                                    {
                                                                        x: area.coords[0],
                                                                        y: area.coords[3],
                                                                        cursor: "sw-resize",
                                                                    },
                                                                ].map((pos, i) => (
                                                                    <circle
                                                                        key={i}
                                                                        cx={pos.x}
                                                                        cy={pos.y}
                                                                        r={8 / zoom}
                                                                        className={cn(
                                                                            "fill-white stroke-fuchsia-500 stroke-2 pointer-events-auto shadow-sm"
                                                                        )}
                                                                        style={{
                                                                            cursor: pos.cursor,
                                                                        }}
                                                                        onMouseDown={(e) =>
                                                                            handleResizeMouseDown(
                                                                                e,
                                                                                area.id,
                                                                                i
                                                                            )
                                                                        }
                                                                    />
                                                                ))}
                                                            {area.type === "circle" && (
                                                                <circle
                                                                    cx={
                                                                        area.coords[0] +
                                                                        area.coords[2]
                                                                    }
                                                                    cy={area.coords[1]}
                                                                    r={8 / zoom}
                                                                    className="fill-white stroke-fuchsia-500 stroke-2 cursor-ew-resize pointer-events-auto"
                                                                    onMouseDown={(e) =>
                                                                        handleResizeMouseDown(
                                                                            e,
                                                                            area.id,
                                                                            0
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                            {area.type === "poly" &&
                                                                Array.from({
                                                                    length: area.coords.length / 2,
                                                                }).map((_, i) => (
                                                                    <circle
                                                                        key={i}
                                                                        cx={area.coords[i * 2]}
                                                                        cy={area.coords[i * 2 + 1]}
                                                                        r={8 / zoom}
                                                                        className="fill-white stroke-fuchsia-500 stroke-2 cursor-move pointer-events-auto"
                                                                        onMouseDown={(e) =>
                                                                            handleResizeMouseDown(
                                                                                e,
                                                                                area.id,
                                                                                i
                                                                            )
                                                                        }
                                                                    />
                                                                ))}
                                                        </g>
                                                    )}
                                                </g>
                                            );
                                        })}

                                        {/* Poly temporary points */}
                                        {drawingMode === "poly" && tempPolyPoints.length > 0 && (
                                            <g>
                                                <polyline
                                                    points={[...tempPolyPoints, currentPos]
                                                        .map((p) => `${p.x},${p.y}`)
                                                        .join(" ")}
                                                    className="fill-fuchsia-500/10 stroke-fuchsia-400 stroke-[2px]"
                                                    strokeDasharray="4,4"
                                                />
                                                {tempPolyPoints.map((p, i) => (
                                                    <circle
                                                        key={i}
                                                        cx={p.x}
                                                        cy={p.y}
                                                        r={zoom > 1 ? 3 / zoom : 3}
                                                        className="fill-fuchsia-600"
                                                    />
                                                ))}
                                            </g>
                                        )}

                                        {/* Preview for dragging */}
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
                                        {isDrawing && drawingMode === "circle" && (
                                            <circle
                                                cx={startPos.x}
                                                cy={startPos.y}
                                                r={Math.sqrt(
                                                    Math.pow(currentPos.x - startPos.x, 2) +
                                                        Math.pow(currentPos.y - startPos.y, 2)
                                                )}
                                                className="fill-fuchsia-500/10 stroke-fuchsia-400 stroke-[3px]"
                                                strokeDasharray="8,8"
                                            />
                                        )}
                                    </svg>
                                </div>
                            ) : (
                                <div className="text-zinc-400 flex flex-col items-center gap-6 animate-pulse">
                                    <Upload className="w-16 h-16 opacity-20" />
                                    <p className="font-bold text-center">
                                        이미지를 업로드하거나 URL을 입력하세요
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="w-full h-full p-0 flex flex-col bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="flex items-center justify-between p-4 bg-zinc-900">
                                    <span className="text-sm font-mono font-bold text-zinc-500 uppercase tracking-widest">
                                        HTML 결과 코드
                                    </span>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all"
                                    >
                                        <Copy className="w-3.5 h-3.5" /> 코드 복사
                                    </button>
                                </div>
                                <pre className="flex-1 p-8 font-mono text-sm overflow-auto text-fuchsia-400 selection:bg-fuchsia-500/30">
                                    {generateCode()}
                                </pre>
                            </div>
                        )}
                    </div>

                    {drawingMode === "poly" && isDrawing && (
                        <div className="flex items-center justify-center p-4 glass-card bg-fuchsia-500/10 border-fuchsia-500/50 animate-in fade-in zoom-in duration-300">
                            <p className="text-sm font-bold text-fuchsia-600 mr-4">
                                점들을 클릭하여 영역을 만드세요 ({tempPolyPoints.length}개 점)
                            </p>
                            <button
                                onClick={finishPoly}
                                className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold shadow-lg"
                            >
                                영역 완성하기
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Properties Panel */}
                <div className="w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="glass-card bg-white p-6 shadow-xl flex flex-col gap-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                            <Settings2 className="w-5 h-5 text-fuchsia-500" /> 설정
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                    맵 이름
                                </label>
                                <input
                                    type="text"
                                    value={mapName}
                                    onChange={(e) => setMapName(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none text-sm font-bold transition-all"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-zinc-100 my-2" />

                        {selectedId ? (
                            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
                                {areas
                                    .filter((a) => a.id === selectedId)
                                    .map((area) => (
                                        <div key={area.id} className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-zinc-50 pb-2">
                                                <h3 className="text-lg font-bold text-zinc-800">
                                                    영역 속성
                                                </h3>
                                                <button
                                                    onClick={() => setSelectedId(null)}
                                                    className="text-zinc-300 hover:text-zinc-600"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-zinc-600">
                                                    href (링크 URL)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={area.href}
                                                    onChange={(e) =>
                                                        updateArea(area.id, {
                                                            href: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-sm font-medium text-zinc-700 transition-all"
                                                    placeholder="https://example.com"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-zinc-600">
                                                    alt
                                                </label>
                                                <input
                                                    type="text"
                                                    value={area.alt}
                                                    onChange={(e) =>
                                                        updateArea(area.id, { alt: e.target.value })
                                                    }
                                                    className="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-sm font-medium text-zinc-700 transition-all"
                                                    placeholder="대체 텍스트"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-zinc-600">
                                                    title (툴팁)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={area.title}
                                                    onChange={(e) =>
                                                        updateArea(area.id, {
                                                            title: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-sm font-medium text-zinc-700 transition-all"
                                                    placeholder="마우스오버 툴팁"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-zinc-600">
                                                    target
                                                </label>
                                                <select
                                                    value={area.target}
                                                    onChange={(e) =>
                                                        updateArea(area.id, {
                                                            target: e.target.value as any,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-sm font-medium text-zinc-700 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="_self">없음</option>
                                                    <option value="_blank">새 창 (_blank)</option>
                                                    <option value="_parent">
                                                        부모 창 (_parent)
                                                    </option>
                                                    <option value="_top">최상위 창 (_top)</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-zinc-600">
                                                    coords (좌표)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={area.coords.join(",")}
                                                    onChange={(e) => {
                                                        const newCoords = e.target.value
                                                            .split(",")
                                                            .map((v) => parseInt(v.trim()) || 0);
                                                        updateArea(area.id, { coords: newCoords });
                                                    }}
                                                    className="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-sm font-medium text-zinc-700 transition-all"
                                                    placeholder="예: 10,20,100,80"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2">
                                                <button
                                                    onClick={() => setSelectedId(null)}
                                                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                                >
                                                    속성 적용
                                                </button>

                                                <button
                                                    onClick={() => deleteArea(area.id)}
                                                    className="w-full py-3 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl font-bold text-sm uppercase tracking-widest transition-all"
                                                >
                                                    영역 삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-50/50 rounded-3xl border-2 border-dashed border-zinc-100">
                                <MousePointer2 className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
                                <p className="text-sm font-bold text-zinc-400">
                                    도구와 생성 방식을 선택 후<br />
                                    이미지 작업 영역을 만드세요
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="glass-card bg-zinc-900 p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Plus className="w-4 h-4 text-fuchsia-400" /> 영역 레이어 (
                            {areas.length})
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                            {areas.map((area, index) => (
                                <div
                                    key={area.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setSelectedId(area.id)}
                                    className={cn(
                                        "group flex items-center justify-between p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all",
                                        selectedId === area.id
                                            ? "bg-fuchsia-500 shadow-lg scale-[1.02]"
                                            : "bg-white/5 hover:bg-white/10",
                                        draggedIndex === index
                                            ? "opacity-30 border-2 border-dashed border-fuchsia-400"
                                            : ""
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold",
                                                selectedId === area.id
                                                    ? "bg-white text-fuchsia-600"
                                                    : "bg-zinc-800 text-zinc-500"
                                            )}
                                        >
                                            #{index + 1}
                                        </div>
                                        <span
                                            className={cn(
                                                "text-sm font-bold",
                                                selectedId === area.id
                                                    ? "text-white"
                                                    : "text-zinc-300"
                                            )}
                                        >
                                            {area.type === "rect"
                                                ? "사각형"
                                                : area.type === "circle"
                                                  ? "원형"
                                                  : "다각형"}
                                            :{" "}
                                            {area.href.length > 20
                                                ? area.href.substring(0, 20) + "..."
                                                : area.href || "링크 없음"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <div className="w-3 h-0.5 bg-zinc-400 rounded-full" />
                                            <div className="w-3 h-0.5 bg-zinc-400 rounded-full" />
                                            <div className="w-3 h-0.5 bg-zinc-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                    background-position:
                        0 0,
                        0 10px,
                        10px -10px,
                        -10px 0px;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
            `}</style>

            {/* URL Input Modal */}
            {isUrlModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md glass-card bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-fuchsia-500" />
                                이미지 URL 입력
                            </h3>
                            <button
                                onClick={() => setIsUrlModalOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-zinc-500 mb-6">
                            웹상에 있는 이미지의 주소를 입력하여 바로 불러올 수 있습니다.
                        </p>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleImageUrlLoad();
                                            setIsUrlModalOpen(false);
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none text-sm font-medium transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsUrlModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl font-bold text-sm transition-all"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => {
                                        handleImageUrlLoad();
                                        setIsUrlModalOpen(false);
                                    }}
                                    className="flex-1 px-4 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-fuchsia-500/20 transition-all"
                                >
                                    불러오기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[101] bg-white border border-zinc-200 shadow-xl rounded-lg py-1.5 min-w-[120px] animate-in fade-in zoom-in duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            setEditingAreaId(contextMenu.areaId);
                            setIsPropertyModalOpen(true);
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-fuchsia-50 text-zinc-700 text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        <Settings2 className="w-4 h-4 text-fuchsia-500" />
                        속성 편집
                    </button>
                    <div className="h-px bg-zinc-100 my-1.5" />
                    <button
                        onClick={() => {
                            deleteArea(contextMenu.areaId);
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-500 text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        영역 삭제
                    </button>
                </div>
            )}

            {/* Property Edit Modal (Image-style Popup) */}
            {isPropertyModalOpen && editingAreaId && (
                <div className="fixed inset-0 z-[102] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setIsPropertyModalOpen(false)}
                    />
                    {areas
                        .filter((a) => a.id === editingAreaId)
                        .map((area) => (
                            <div
                                key={area.id}
                                className="relative w-[320px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <div className="flex flex-col gap-0.5 opacity-50">
                                            <div className="w-3 h-0.5 bg-zinc-400 rounded-full" />
                                            <div className="w-3 h-0.5 bg-zinc-400 rounded-full" />
                                            <div className="w-3 h-0.5 bg-zinc-400 rounded-full" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-tight text-zinc-800">
                                            #{areas.indexOf(area) + 1} {area.type.toUpperCase()}{" "}
                                            속성
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsPropertyModalOpen(false)}
                                        className="p-1 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-5 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-zinc-500">
                                            href (링크 URL)
                                        </label>
                                        <input
                                            type="text"
                                            value={area.href}
                                            onChange={(e) =>
                                                updateArea(area.id, { href: e.target.value })
                                            }
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-zinc-800 transition-all placeholder:text-zinc-400"
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-zinc-500">
                                            alt
                                        </label>
                                        <input
                                            type="text"
                                            value={area.alt}
                                            onChange={(e) =>
                                                updateArea(area.id, { alt: e.target.value })
                                            }
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-zinc-800 transition-all placeholder:text-zinc-400"
                                            placeholder="대체 텍스트"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-zinc-500">
                                            title (툴팁)
                                        </label>
                                        <input
                                            type="text"
                                            value={area.title}
                                            onChange={(e) =>
                                                updateArea(area.id, { title: e.target.value })
                                            }
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-zinc-800 transition-all placeholder:text-zinc-400"
                                            placeholder="마우스오버 툴팁"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-zinc-500">
                                            target
                                        </label>
                                        <select
                                            value={area.target}
                                            onChange={(e) =>
                                                updateArea(area.id, {
                                                    target: e.target.value as any,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-zinc-800 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="_self">없음</option>
                                            <option value="_blank">_blank (새 탭)</option>
                                            <option value="_parent">_parent (부모 창)</option>
                                            <option value="_top">_top (최상위 창)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-zinc-500">
                                            coords (좌표)
                                        </label>
                                        <input
                                            type="text"
                                            value={area.coords.join(",")}
                                            onChange={(e) => {
                                                const newCoords = e.target.value
                                                    .split(",")
                                                    .map((v) => parseInt(v.trim()) || 0);
                                                updateArea(area.id, { coords: newCoords });
                                            }}
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm text-zinc-800 transition-all"
                                        />
                                    </div>

                                    {/* Modal Footer Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setIsPropertyModalOpen(false)}
                                            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            ✓ 적용
                                        </button>
                                        <button
                                            onClick={() => {
                                                deleteArea(area.id);
                                                setIsPropertyModalOpen(false);
                                            }}
                                            className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-500/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            🗑 삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </>
    );
}
