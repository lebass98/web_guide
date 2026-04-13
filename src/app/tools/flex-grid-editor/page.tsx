"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function FlexGridEditorPage() {
    const [mode, setMode] = useState<"flex" | "grid">("flex");

    const [flexDirection, setFlexDirection] = useState("row");
    const [justifyContent, setJustifyContent] = useState("center");
    const [alignItems, setAlignItems] = useState("center");
    const [flexWrap, setFlexWrap] = useState("nowrap");
    const [gap, setGap] = useState(12);

    const [columns, setColumns] = useState(3);
    const [rowHeight, setRowHeight] = useState(72);
    const [gridGap, setGridGap] = useState(12);
    const [justifyItems, setJustifyItems] = useState("stretch");
    const [alignContent, setAlignContent] = useState("start");

    const containerStyle = useMemo(() => {
        if (mode === "flex") {
            return {
                display: "flex",
                flexDirection,
                justifyContent,
                alignItems,
                flexWrap,
                gap: `${gap}px`,
            };
        }

        return {
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridAutoRows: `${rowHeight}px`,
            gap: `${gridGap}px`,
            justifyItems,
            alignContent,
        };
    }, [
        mode,
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        gap,
        columns,
        rowHeight,
        gridGap,
        justifyItems,
        alignContent,
    ]);

    const cssCode = useMemo(() => {
        if (mode === "flex") {
            return `.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}`;
        }

        return `.container {
  display: grid;
  grid-template-columns: repeat(${columns}, minmax(0, 1fr));
  grid-auto-rows: ${rowHeight}px;
  gap: ${gridGap}px;
  justify-items: ${justifyItems};
  align-content: ${alignContent};
}`;
    }, [
        mode,
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        gap,
        columns,
        rowHeight,
        gridGap,
        justifyItems,
        alignContent,
    ]);

    const htmlCode = `<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>`;

    const copyAllCode = async () => {
        await navigator.clipboard.writeText(`${cssCode}\n\n${htmlCode}`);
    };

    return (
        <div className="space-y-10">
            <PageHeader
                title="Flexbox·Grid 시각 에디터"
                description="레이아웃 속성을 클릭으로 조정하고, 결과 CSS/HTML 코드를 바로 복사하세요."
            />

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setMode("flex")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        mode === "flex"
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                >
                    Flexbox
                </button>
                <button
                    onClick={() => setMode("grid")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        mode === "grid"
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                >
                    Grid
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section className="glass-card p-6 md:p-8 rounded-3xl space-y-5 order-2 xl:order-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">속성 설정</h2>

                    {mode === "flex" ? (
                        <div className="space-y-4">
                            <SelectField
                                label="flex-direction"
                                value={flexDirection}
                                onChange={setFlexDirection}
                                options={[
                                    { value: "row", label: "row (가로 정방향)" },
                                    { value: "row-reverse", label: "row-reverse (가로 역방향)" },
                                    { value: "column", label: "column (세로 정방향)" },
                                    { value: "column-reverse", label: "column-reverse (세로 역방향)" },
                                ]}
                            />
                            <SelectField
                                label="justify-content"
                                value={justifyContent}
                                onChange={setJustifyContent}
                                options={[
                                    { value: "flex-start", label: "flex-start (시작 정렬)" },
                                    { value: "center", label: "center (가운데 정렬)" },
                                    { value: "flex-end", label: "flex-end (끝 정렬)" },
                                    { value: "space-between", label: "space-between (양끝 기준 균등)" },
                                    { value: "space-around", label: "space-around (주변 여백 균등)" },
                                    { value: "space-evenly", label: "space-evenly (간격 완전 균등)" },
                                ]}
                            />
                            <SelectField
                                label="align-items"
                                value={alignItems}
                                onChange={setAlignItems}
                                options={[
                                    { value: "stretch", label: "stretch (높이/너비 채움)" },
                                    { value: "flex-start", label: "flex-start (교차축 시작)" },
                                    { value: "center", label: "center (교차축 가운데)" },
                                    { value: "flex-end", label: "flex-end (교차축 끝)" },
                                    { value: "baseline", label: "baseline (텍스트 기준선)" },
                                ]}
                            />
                            <SelectField
                                label="flex-wrap"
                                value={flexWrap}
                                onChange={setFlexWrap}
                                options={[
                                    { value: "nowrap", label: "nowrap (줄바꿈 없음)" },
                                    { value: "wrap", label: "wrap (다음 줄로 줄바꿈)" },
                                    { value: "wrap-reverse", label: "wrap-reverse (역방향 줄바꿈)" },
                                ]}
                            />
                            <RangeField
                                label="gap"
                                value={gap}
                                min={0}
                                max={48}
                                onChange={setGap}
                                unit="px"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <RangeField
                                label="grid-template-columns"
                                value={columns}
                                min={1}
                                max={6}
                                onChange={setColumns}
                                unit="col"
                            />
                            <RangeField
                                label="grid-auto-rows"
                                value={rowHeight}
                                min={48}
                                max={140}
                                onChange={setRowHeight}
                                unit="px"
                            />
                            <RangeField
                                label="gap"
                                value={gridGap}
                                min={0}
                                max={48}
                                onChange={setGridGap}
                                unit="px"
                            />
                            <SelectField
                                label="justify-items"
                                value={justifyItems}
                                onChange={setJustifyItems}
                                options={[
                                    { value: "stretch", label: "stretch (셀 가로 채움)" },
                                    { value: "start", label: "start (셀 시작 정렬)" },
                                    { value: "center", label: "center (셀 중앙 정렬)" },
                                    { value: "end", label: "end (셀 끝 정렬)" },
                                ]}
                            />
                            <SelectField
                                label="align-content"
                                value={alignContent}
                                onChange={setAlignContent}
                                options={[
                                    { value: "start", label: "start (콘텐츠 시작)" },
                                    { value: "center", label: "center (콘텐츠 중앙)" },
                                    { value: "end", label: "end (콘텐츠 끝)" },
                                    { value: "space-between", label: "space-between (행 간격 균등)" },
                                    { value: "space-around", label: "space-around (행 주변 균등)" },
                                    { value: "space-evenly", label: "space-evenly (행 완전 균등)" },
                                ]}
                            />
                        </div>
                    )}
                </section>

                <section className="space-y-6 order-1 xl:order-2">
                    <div className="glass-card p-5 rounded-2xl">
                        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">실시간 미리보기</p>
                        <div
                            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-4 min-h-[320px]"
                            style={containerStyle}
                        >
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-lg bg-indigo-500/15 dark:bg-indigo-500/25 border border-indigo-500/30 text-indigo-700 dark:text-indigo-200 font-bold flex items-center justify-center min-h-[56px]"
                                >
                                    Item {idx + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="order-3 xl:order-3 xl:col-span-2">
                    <div className="glass-card p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">생성 코드</p>
                            <button
                                onClick={copyAllCode}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-indigo-500 transition-colors"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                CSS+HTML 복사
                            </button>
                        </div>
                        <pre className="bg-zinc-900 text-zinc-200 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto">{cssCode}</pre>
                        <pre className="bg-zinc-900 text-zinc-200 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto mt-3">{htmlCode}</pre>
                    </div>
                </section>
            </div>
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <label className="block">
            <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function RangeField({
    label,
    value,
    min,
    max,
    onChange,
    unit,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    unit: string;
}) {
    return (
        <label className="block">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">{label}</span>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    {value}
                    {unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-600"
            />
        </label>
    );
}
