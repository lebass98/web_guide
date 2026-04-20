"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";
import {
    Play, Download, Copy, Check, RefreshCw, Monitor, Tablet, Smartphone,
    ChevronDown, RotateCcw, Braces, Code2, Paintbrush, AlertCircle,
    Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
    List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link, Link2Off, Image, Table, Minus, Smile, Undo2, Redo2,
    Scissors, FileText, Eraser, Maximize2, Minimize2, Code, Printer,
    FilePlus, Search, Quote, Indent, Outdent, AppWindow,
} from "lucide-react";

// ─── Code Editor Templates ──────────────────────────────────────────────────────

interface Template { label: string; html: string; css: string; js: string; }

const TEMPLATES: Record<string, Template> = {
    blank: {
        label: "빈 파일",
        html: `<h1>안녕하세요! 👋</h1>\n<p>HTML을 여기에 작성하세요.</p>`,
        css: `body {\n  margin: 0;\n  padding: 24px;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n  background: #f8f9fa;\n  color: #212529;\n}\nh1 { color: #4f46e5; }`,
        js: `// JavaScript를 여기에 작성하세요\nconsole.log('Hello, World!');`,
    },
    card: {
        label: "카드 UI",
        html: `<div class="card">\n  <div class="badge">NEW</div>\n  <h2 class="title">멋진 카드 컴포넌트</h2>\n  <p class="desc">CSS와 HTML로 만든 카드 예시입니다. 버튼을 클릭해 보세요!</p>\n  <button class="btn" id="btn">클릭해보세요 🎉</button>\n  <div class="counter" id="counter">0번 클릭됨</div>\n</div>`,
        css: `* { box-sizing: border-box; }\nbody {\n  margin: 0;\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n}\n.card {\n  background: white;\n  border-radius: 20px;\n  padding: 36px;\n  max-width: 360px;\n  width: 90%;\n  box-shadow: 0 20px 60px rgba(0,0,0,0.2);\n  text-align: center;\n}\n.badge {\n  display: inline-block;\n  background: #eef2ff;\n  color: #4f46e5;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 1px;\n  padding: 4px 12px;\n  border-radius: 99px;\n  margin-bottom: 16px;\n}\n.title { margin: 0 0 12px; color: #111; font-size: 22px; }\n.desc  { margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.6; }\n.btn {\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  color: white;\n  border: none;\n  padding: 12px 28px;\n  border-radius: 99px;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: transform 0.15s, box-shadow 0.15s;\n}\n.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102,126,234,0.5); }\n.btn:active { transform: scale(0.97); }\n.counter { margin-top: 16px; font-size: 13px; color: #9ca3af; }`,
        js: `let count = 0;\nconst btn = document.getElementById('btn');\nconst counter = document.getElementById('counter');\nbtn.addEventListener('click', () => {\n  count++;\n  counter.textContent = count + '번 클릭됨';\n  btn.style.background = \`hsl(\${count * 30}, 70%, 55%)\`;\n});`,
    },
    animation: {
        label: "CSS 애니메이션",
        html: `<div class="scene">\n  <div class="ring ring1"></div>\n  <div class="ring ring2"></div>\n  <div class="ring ring3"></div>\n  <div class="dot"></div>\n  <p class="label">Loading...</p>\n</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }\nbody {\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #0f0c29;\n}\n.scene {\n  position: relative;\n  width: 120px;\n  height: 120px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.ring {\n  position: absolute;\n  border-radius: 50%;\n  border: 3px solid transparent;\n  animation: spin 1.5s linear infinite;\n}\n.ring1 { width: 100%; height: 100%; border-top-color: #a855f7; animation-duration: 1.2s; }\n.ring2 { width: 70%; height: 70%; border-right-color: #6366f1; animation-direction: reverse; animation-duration: 1.8s; }\n.ring3 { width: 40%; height: 40%; border-bottom-color: #ec4899; animation-duration: 1s; }\n.dot { width: 10px; height: 10px; background: white; border-radius: 50%; animation: pulse 1.2s ease-in-out infinite; }\n.label { position: absolute; bottom: -32px; color: rgba(255,255,255,0.5); font-family: monospace; font-size: 13px; letter-spacing: 2px; animation: blink 1.2s ease-in-out infinite; }\n@keyframes spin  { to { transform: rotate(360deg); } }\n@keyframes pulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.5); opacity:0.5; } }\n@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`,
        js: `document.querySelector('.scene').addEventListener('click', () => {\n  const hue = Math.floor(Math.random() * 360);\n  document.querySelector('.ring1').style.borderTopColor   = \`hsl(\${hue}, 70%, 65%)\`;\n  document.querySelector('.ring2').style.borderRightColor = \`hsl(\${(hue+120)%360}, 70%, 65%)\`;\n  document.querySelector('.ring3').style.borderBottomColor= \`hsl(\${(hue+240)%360}, 70%, 65%)\`;\n});`,
    },
    table: {
        label: "반응형 테이블",
        html: `<div class="wrap">\n  <div class="header">\n    <h2>사용자 목록</h2>\n    <input type="text" id="search" placeholder="검색..." />\n  </div>\n  <div class="table-wrap">\n    <table id="table">\n      <thead><tr><th>#</th><th>이름</th><th>이메일</th><th>역할</th><th>상태</th></tr></thead>\n      <tbody id="tbody"></tbody>\n    </table>\n  </div>\n</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }\nbody { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f1f5f9; color: #1e293b; }\n.wrap { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }\n.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }\nh2 { margin: 0; font-size: 18px; color: #0f172a; }\ninput { padding: 8px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; outline: none; transition: border-color .2s; width: 200px; }\ninput:focus { border-color: #6366f1; }\n.table-wrap { overflow-x: auto; }\ntable { width: 100%; border-collapse: collapse; font-size: 13px; }\nth { text-align: left; padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #64748b; font-size: 11px; letter-spacing: .5px; text-transform: uppercase; border-bottom: 1.5px solid #e2e8f0; }\ntd { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }\ntr:last-child td { border-bottom: none; }\ntr:hover td { background: #f8fafc; }\n.badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }\n.badge.admin { background:#eef2ff; color:#4f46e5; }\n.badge.user  { background:#f0fdf4; color:#16a34a; }\n.badge.guest { background:#fefce8; color:#ca8a04; }\n.status { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }\n.on  { background: #22c55e; }\n.off { background: #d1d5db; }`,
        js: `const DATA = [\n  { name:'김민준', email:'minjun@example.com', role:'admin', active:true },\n  { name:'이서연', email:'seoyeon@example.com', role:'user', active:true },\n  { name:'박도윤', email:'doyun@example.com', role:'user', active:false },\n  { name:'최아윤', email:'ayoon@example.com', role:'guest', active:true },\n  { name:'정시우', email:'siwoo@example.com', role:'user', active:true },\n  { name:'강하은', email:'haeun@example.com', role:'guest', active:false },\n];\nfunction render(data) {\n  document.getElementById('tbody').innerHTML = data.map((d,i) => \`<tr><td>\${i+1}</td><td><strong>\${d.name}</strong></td><td style="color:#6b7280">\${d.email}</td><td><span class="badge \${d.role}">\${d.role.toUpperCase()}</span></td><td><span class="status \${d.active?'on':'off'}"></span>\${d.active?'활성':'비활성'}</td></tr>\`).join('');\n}\nrender(DATA);\ndocument.getElementById('search').addEventListener('input', e => {\n  const q = e.target.value.toLowerCase();\n  render(DATA.filter(d => d.name.includes(q) || d.email.includes(q) || d.role.includes(q)));\n});`,
    },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildSrcdoc(html: string, css: string, js: string) {
    const safeJs = js.trim() ? `try {\n${js}\n} catch(e) { console.error('[WebEditor]', e); }` : "";
    return `<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<style>\n${css}\n</style>\n</head>\n<body>\n${html}\n<script>\n${safeJs}\n</script>\n</body>\n</html>`;
}

function buildFullSource(html: string, css: string, js: string) {
    return `<!DOCTYPE html>\n<html lang="ko">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>내 페이지</title>\n    <style>\n${css.split("\n").map(l => "        " + l).join("\n")}\n    </style>\n</head>\n<body>\n${html.split("\n").map(l => "    " + l).join("\n")}\n    <script>\n${js.split("\n").map(l => "        " + l).join("\n")}\n    </script>\n</body>\n</html>`;
}

type EditorTab = "html" | "css" | "js";
type PreviewSize = "desktop" | "tablet" | "mobile";
type PageMode = "code" | "wysiwyg";

const PREVIEW_SIZES: { id: PreviewSize; label: string; width: string; Icon: React.ElementType }[] = [
    { id: "desktop", label: "데스크탑", width: "100%",  Icon: Monitor },
    { id: "tablet",  label: "태블릿",   width: "768px", Icon: Tablet },
    { id: "mobile",  label: "모바일",   width: "375px", Icon: Smartphone },
];

const EDITOR_TABS: { id: EditorTab; label: string; lang: string; Icon: React.ElementType; color: string }[] = [
    { id: "html", label: "HTML", lang: "html",       Icon: Code2,      color: "text-orange-500" },
    { id: "css",  label: "CSS",  lang: "css",        Icon: Paintbrush, color: "text-blue-500" },
    { id: "js",   label: "JS",   lang: "javascript", Icon: Braces,     color: "text-yellow-500" },
];

const COMMON_MONOCO_OPTS = {
    fontSize: 13,
    fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: "on" as const,
    tabSize: 2,
    padding: { top: 12 },
    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function WebEditorPage() {
    const [pageMode, setPageMode] = useState<PageMode>("code");

    return (
        <div className="space-y-4">
            <PageHeader
                title="웹 에디터"
                description="HTML·CSS·JS 코드 에디터와 WYSIWYG 비주얼 에디터를 모두 제공합니다. 실시간 미리보기와 소스 코드 복사·다운로드 기능을 지원합니다."
            />

            {/* Top-level Mode Toggle */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl w-fit">
                <button onClick={() => setPageMode("code")}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                        pageMode === "code"
                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    )}>
                    <Code className="w-4 h-4" /> 코드 에디터
                </button>
                <button onClick={() => setPageMode("wysiwyg")}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                        pageMode === "wysiwyg"
                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    )}>
                    <AppWindow className="w-4 h-4" /> 비주얼 에디터
                </button>
            </div>

            {pageMode === "code" ? <CodeEditorSection /> : <WysiwygSection />}
        </div>
    );
}

// ─── Code Editor Section ────────────────────────────────────────────────────────

function CodeEditorSection() {
    const { resolvedTheme } = useTheme();
    const { toast } = useToast();
    const dark = resolvedTheme === "dark";
    const monacoTheme = dark ? "vs-dark" : "vs";

    const [activeTab, setActiveTab] = useState<EditorTab>("html");
    const [html, setHtml] = useState(TEMPLATES.card.html);
    const [css,  setCss]  = useState(TEMPLATES.card.css);
    const [js,   setJs]   = useState(TEMPLATES.card.js);
    const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
    const [autoRun, setAutoRun] = useState(true);
    const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(TEMPLATES.card.html, TEMPLATES.card.css, TEMPLATES.card.js));
    const [copied, setCopied] = useState(false);
    const [template, setTemplate] = useState("card");
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const [sourceTab, setSourceTab] = useState<"source" | "console">("source");
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fullSource = useMemo(() => buildFullSource(html, css, js), [html, css, js]);

    const run = useCallback(() => {
        setConsoleOutput([]);
        setSrcdoc(buildSrcdoc(html, css, js));
    }, [html, css, js]);

    useEffect(() => {
        if (!autoRun) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(run, 600);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [html, css, js, autoRun, run]);

    const applyTemplate = useCallback((key: string) => {
        const t = TEMPLATES[key];
        setHtml(t.html); setCss(t.css); setJs(t.js);
        setTemplate(key);
        setShowTemplateMenu(false);
        setSrcdoc(buildSrcdoc(t.html, t.css, t.js));
    }, []);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(fullSource);
        setCopied(true);
        toast("소스 코드가 클립보드에 복사되었습니다.");
        setTimeout(() => setCopied(false), 2000);
    }, [fullSource, toast]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([fullSource], { type: "text/html" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = "index.html"; a.click();
        URL.revokeObjectURL(url);
    }, [fullSource]);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 glass-card rounded-xl px-3 py-2">
                <div className="relative">
                    <button onClick={() => setShowTemplateMenu(o => !o)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        템플릿: {TEMPLATES[template].label} <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {showTemplateMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowTemplateMenu(false)} />
                            <div className="absolute top-full mt-1 left-0 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                                {Object.entries(TEMPLATES).map(([key, t]) => (
                                    <button key={key} onClick={() => applyTemplate(key)}
                                        className={cn("w-full text-left px-4 py-2.5 text-xs font-medium transition-colors",
                                            key === template
                                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                        )}>{t.label}</button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
                <button onClick={() => setAutoRun(o => !o)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        autoRun ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    )}>
                    <span className={cn("w-2 h-2 rounded-full", autoRun ? "bg-emerald-500 animate-pulse" : "bg-zinc-400")} />
                    자동 실행
                </button>
                {!autoRun && (
                    <button onClick={run}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors active:scale-95">
                        <Play className="w-3.5 h-3.5 fill-white" /> 실행
                    </button>
                )}
                <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                    {PREVIEW_SIZES.map(({ id, label, Icon }) => (
                        <button key={id} onClick={() => setPreviewSize(id)} title={label}
                            className={cn("p-1.5 rounded-md transition-colors",
                                previewSize === id
                                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            )}>
                            <Icon className="w-3.5 h-3.5" />
                        </button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => applyTemplate(template)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> 초기화
                    </button>
                    <button onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-xs font-bold transition-colors active:scale-95">
                        <Download className="w-3.5 h-3.5" /> 다운로드
                    </button>
                </div>
            </div>

            {/* Editor + Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Monaco Editors */}
                <div className="glass-card rounded-2xl overflow-hidden flex flex-col min-h-[520px]">
                    <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-2 pt-1 gap-0.5">
                        {EDITOR_TABS.map(({ id, label, Icon, color }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={cn("flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold rounded-t-lg transition-colors border-b-2",
                                    activeTab === id
                                        ? "border-indigo-500 text-zinc-900 dark:text-white bg-white/50 dark:bg-zinc-800/50"
                                        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                )}>
                                <Icon className={cn("w-3.5 h-3.5", activeTab === id && color)} />
                                {label}
                            </button>
                        ))}
                        <span className="ml-auto pr-2 text-[10px] text-zinc-400 font-mono">
                            {(activeTab === "html" ? html : activeTab === "css" ? css : js).split("\n").length} lines
                        </span>
                    </div>
                    <div className="flex-1 min-h-0">
                        {activeTab === "html" && <Editor height="100%" language="html" value={html} theme={monacoTheme} options={COMMON_MONOCO_OPTS} onChange={v => setHtml(v ?? "")} />}
                        {activeTab === "css"  && <Editor height="100%" language="css"  value={css}  theme={monacoTheme} options={COMMON_MONOCO_OPTS} onChange={v => setCss(v ?? "")} />}
                        {activeTab === "js"   && <Editor height="100%" language="javascript" value={js} theme={monacoTheme} options={COMMON_MONOCO_OPTS} onChange={v => setJs(v ?? "")} />}
                    </div>
                </div>

                {/* Preview */}
                <div className="glass-card rounded-2xl overflow-hidden flex flex-col min-h-[520px]">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">미리보기</span>
                            {previewSize !== "desktop" && <span className="text-[10px] font-mono text-zinc-400">{PREVIEW_SIZES.find(s => s.id === previewSize)?.width}</span>}
                        </div>
                        <button onClick={run} title="새로고침" className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 flex justify-center p-2">
                        <div className="relative bg-white shadow-sm transition-all duration-300" style={{ width: PREVIEW_SIZES.find(s => s.id === previewSize)?.width, minHeight: "100%" }}>
                            <iframe srcDoc={srcdoc} sandbox="allow-scripts allow-modals" className="w-full h-full min-h-[440px] block border-0" title="미리보기" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Source Output */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg gap-0.5">
                            {(["source", "console"] as const).map(t => (
                                <button key={t} onClick={() => setSourceTab(t)}
                                    className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all",
                                        sourceTab === t
                                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
                                    )}>
                                    {t === "source" ? "소스 코드" : `콘솔 ${consoleOutput.length > 0 ? `(${consoleOutput.length})` : ""}`}
                                </button>
                            ))}
                        </div>
                        {sourceTab === "source" && <span className="text-[10px] font-mono text-zinc-400">{fullSource.split("\n").length} lines · {new Blob([fullSource]).size.toLocaleString()} bytes</span>}
                    </div>
                    {sourceTab === "source" && (
                        <div className="flex items-center gap-2">
                            <button onClick={handleCopy}
                                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                                    copied ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-indigo-600 text-white hover:bg-indigo-500"
                                )}>
                                {copied ? <><Check className="w-3 h-3" /> 복사됨</> : <><Copy className="w-3 h-3" /> 복사</>}
                            </button>
                            <button onClick={handleDownload}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 transition-colors">
                                <Download className="w-3 h-3" /> HTML 저장
                            </button>
                        </div>
                    )}
                </div>
                {sourceTab === "source" ? (
                    <Editor height="300px" language="html" value={fullSource} theme={monacoTheme} options={{ ...COMMON_MONOCO_OPTS, readOnly: true, domReadOnly: true }} />
                ) : (
                    <div className="min-h-[200px] max-h-[300px] overflow-y-auto bg-zinc-950 p-4 font-mono text-xs">
                        {consoleOutput.length === 0
                            ? <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-600"><AlertCircle className="w-5 h-5" /><span>콘솔 출력이 없습니다.</span></div>
                            : consoleOutput.map((line, i) => <div key={i} className="py-1 border-b border-zinc-800 text-emerald-400">{line}</div>)
                        }
                    </div>
                )}
                <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <p className="text-[10px] text-zinc-400">💡 HTML · CSS · JS 패널을 편집하면 미리보기가 자동으로 갱신됩니다. 소스 코드는 세 패널을 합쳐 완성된 HTML 파일로 생성됩니다.</p>
                </div>
            </div>
        </div>
    );
}

// ─── WYSIWYG Section ────────────────────────────────────────────────────────────

const WYSIWYG_INITIAL = `<h2>제목을 여기에 입력하세요</h2><p>본문 내용을 여기에 입력하세요. <strong>굵게</strong>, <em>기울임</em>, <u>밑줄</u> 등 다양한 서식을 적용할 수 있습니다.</p><p>툴바의 버튼을 눌러 다양한 서식을 적용해 보세요!</p>`;

const BLOCK_OPTIONS = [
    { value: "p",           label: "본문" },
    { value: "h1",          label: "제목 1" },
    { value: "h2",          label: "제목 2" },
    { value: "h3",          label: "제목 3" },
    { value: "h4",          label: "제목 4" },
    { value: "h5",          label: "제목 5" },
    { value: "h6",          label: "제목 6" },
    { value: "pre",         label: "코드 블록" },
    { value: "blockquote",  label: "인용문" },
];

const FONT_OPTIONS = [
    { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", label: "기본 폰트" },
    { value: "Arial, sans-serif",               label: "Arial" },
    { value: "'Times New Roman', serif",        label: "Times New Roman" },
    { value: "Georgia, serif",                  label: "Georgia" },
    { value: "Verdana, sans-serif",             label: "Verdana" },
    { value: "'Courier New', Courier, monospace", label: "Courier New" },
    { value: "'Trebuchet MS', sans-serif",      label: "Trebuchet MS" },
    { value: "Impact, Charcoal, sans-serif",    label: "Impact" },
];

const SIZE_OPTIONS = [
    { value: "1", label: "8px (극소)" },
    { value: "2", label: "10px (소)" },
    { value: "3", label: "12px (기본)" },
    { value: "4", label: "14px (중)" },
    { value: "5", label: "18px (대)" },
    { value: "6", label: "24px (특대)" },
    { value: "7", label: "36px (최대)" },
];

const EMOJIS = [
    "😀","😂","😍","🥰","😎","🤔","😊","😢","😡","😱",
    "👍","👎","👋","🤝","💪","🙌","👏","🤞","✌️","🤙",
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❣️",
    "🔥","⭐","🌟","💫","✨","🎉","🎊","🎈","🎁","🎯",
    "💡","💻","📱","⌨️","🖥️","🖨️","📷","📹","🎥","📺",
    "🌍","🌞","🌙","⛅","🌈","❄️","🌊","🌸","🌺","🍀",
    "🍎","🍊","🍋","🍇","🍓","🍔","🍕","☕","🍺","🎂",
    "🚀","✈️","🚗","🚢","🏠","🏆","📌","🔗","📝","🔍",
];

function WysiwygSection() {
    const { resolvedTheme } = useTheme();
    const { toast } = useToast();
    const dark = resolvedTheme === "dark";
    const monacoTheme = dark ? "vs-dark" : "vs";

    const editorRef  = useRef<HTMLDivElement>(null);
    const savedRange = useRef<Range | null>(null);
    const wrapRef    = useRef<HTMLDivElement>(null);

    const [htmlOutput,       setHtmlOutput]       = useState(WYSIWYG_INITIAL);
    const [copied,           setCopied]           = useState(false);
    const [isFullscreen,     setIsFullscreen]     = useState(false);
    const [sourceMode,       setSourceMode]       = useState(false);
    const [sourceDraft,      setSourceDraft]      = useState(WYSIWYG_INITIAL);
    const [showEmojiPicker,  setShowEmojiPicker]  = useState(false);
    const [showTablePicker,  setShowTablePicker]  = useState(false);
    const [tableHover,       setTableHover]       = useState<[number, number]>([0, 0]);
    const [showLinkDialog,   setShowLinkDialog]   = useState(false);
    const [linkUrl,          setLinkUrl]          = useState("https://");
    const [showImageDialog,  setShowImageDialog]  = useState(false);
    const [imageUrl,         setImageUrl]         = useState("https://");
    const [showFindBar,      setShowFindBar]      = useState(false);
    const [findText,         setFindText]         = useState("");
    const [activeFormats,    setActiveFormats]    = useState<Record<string, boolean>>({});
    const [currentBlock,     setCurrentBlock]     = useState("p");
    const [currentFont,      setCurrentFont]      = useState(FONT_OPTIONS[0].value);
    const [currentSize,      setCurrentSize]      = useState("3");
    const [textColor,        setTextColor]        = useState("#e11d48");
    const [bgColor,          setBgColor]          = useState("#fef08a");
    const [statusPath,       setStatusPath]       = useState("body");
    const [sourceOutputTab,  setSourceOutputTab]  = useState<"body" | "full">("body");

    // Initialize content
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = WYSIWYG_INITIAL;
        }
    }, []);

    function saveSelection() {
        const sel = window.getSelection();
        if (sel?.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange();
    }

    function restoreSelection() {
        const sel = window.getSelection();
        if (sel && savedRange.current) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
    }

    function exec(cmd: string, value?: string) {
        if (!editorRef.current) return;
        editorRef.current.focus();
        restoreSelection();
        document.execCommand(cmd, false, value ?? undefined);
        updateState();
    }

    function updateState() {
        const content = editorRef.current?.innerHTML ?? "";
        setHtmlOutput(content);
        setSourceDraft(content);
        checkFormats();
        updateStatusPath();
    }

    function checkFormats() {
        const cmds = ["bold","italic","underline","strikeThrough","subscript","superscript",
                      "justifyLeft","justifyCenter","justifyRight","justifyFull",
                      "insertOrderedList","insertUnorderedList"];
        const formats: Record<string, boolean> = {};
        cmds.forEach(cmd => { try { formats[cmd] = document.queryCommandState(cmd); } catch {} });
        setActiveFormats(formats);
        try { const b = document.queryCommandValue("formatBlock"); setCurrentBlock(b || "p"); } catch {}
    }

    function updateStatusPath() {
        const sel = window.getSelection();
        if (!sel?.rangeCount || !editorRef.current) return;
        const node = sel.getRangeAt(0).commonAncestorContainer;
        const el = node.nodeType === 3 ? node.parentElement : node as Element;
        const parts: string[] = [];
        let cur: Element | null = el as Element;
        while (cur && cur !== editorRef.current) {
            parts.unshift(cur.tagName.toLowerCase());
            cur = cur.parentElement;
        }
        setStatusPath("body" + (parts.length ? " › " + parts.join(" › ") : ""));
    }

    const handleInput = useCallback(() => updateState(), []);
    const handleKeyUp = useCallback(() => { saveSelection(); checkFormats(); updateState(); }, []);
    const handleMouseUp = useCallback(() => { saveSelection(); checkFormats(); updateStatusPath(); }, []);

    const fullHtml = useMemo(() => `<!DOCTYPE html>\n<html lang="ko">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <style>\n        body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; color: #1e293b; }\n        img { max-width: 100%; height: auto; }\n        table { border-collapse: collapse; width: 100%; }\n        td, th { border: 1px solid #d1d5db; padding: 8px 12px; }\n        blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; color: #6b7280; }\n        pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; }\n    </style>\n</head>\n<body>\n${htmlOutput}\n</body>\n</html>`, [htmlOutput]);

    async function handleCopy() {
        const text = sourceOutputTab === "body" ? htmlOutput : fullHtml;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast("소스 코드가 클립보드에 복사되었습니다.");
        setTimeout(() => setCopied(false), 2000);
    }

    function handleDownload() {
        const blob = new Blob([fullHtml], { type: "text/html" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = "document.html"; a.click();
        URL.revokeObjectURL(url);
    }

    function handleNewDoc() {
        if (!editorRef.current) return;
        editorRef.current.innerHTML = "<p>새 문서를 작성하세요.</p>";
        updateState();
    }

    function handlePrint() {
        const win = window.open("", "_blank");
        if (win) { win.document.write(fullHtml); win.document.close(); win.print(); }
    }

    function insertLink() {
        if (linkUrl && linkUrl !== "https://") exec("createLink", linkUrl);
        setShowLinkDialog(false); setLinkUrl("https://");
    }

    function insertImage() {
        if (imageUrl && imageUrl !== "https://") exec("insertImage", imageUrl);
        setShowImageDialog(false); setImageUrl("https://");
    }

    function insertTable(rows: number, cols: number) {
        let html = `<table style="border-collapse:collapse;width:100%;margin:8px 0">`;
        for (let r = 0; r < rows; r++) {
            html += "<tr>";
            for (let c = 0; c < cols; c++) {
                html += r === 0
                    ? `<th style="border:1px solid #d1d5db;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left">&nbsp;</th>`
                    : `<td style="border:1px solid #d1d5db;padding:8px 12px">&nbsp;</td>`;
            }
            html += "</tr>";
        }
        html += "</table><p><br></p>";
        exec("insertHTML", html);
        setShowTablePicker(false);
    }

    function toggleSourceMode() {
        if (!sourceMode) {
            setSourceDraft(htmlOutput);
            setSourceMode(true);
        } else {
            if (editorRef.current) {
                editorRef.current.innerHTML = sourceDraft;
                setHtmlOutput(sourceDraft);
            }
            setSourceMode(false);
        }
    }

    function handleFind() {
        if (!findText.trim()) return;
        const sel = window.getSelection();
        if (!sel) return;
        const text = editorRef.current?.innerText ?? "";
        const idx = text.toLowerCase().indexOf(findText.toLowerCase());
        if (idx === -1) { toast("검색 결과가 없습니다."); return; }
        exec("unselectable", undefined);
    }

    function applyTextColor(color: string) { setTextColor(color); exec("foreColor", color); }
    function applyBgColor(color: string)   { setBgColor(color);   exec("hiliteColor", color); }
    function applyFont(font: string)       { setCurrentFont(font); exec("fontName", font); }
    function applySize(size: string)       { setCurrentSize(size); exec("fontSize", size); }
    function applyBlock(block: string)     { exec("formatBlock", block); }

    // Toolbar button helper
    const Btn = ({ cmd, value, active, title, children, onClick }: {
        cmd?: string; value?: string; active?: boolean; title: string;
        children: React.ReactNode; onClick?: () => void;
    }) => (
        <button
            title={title}
            onMouseDown={e => { e.preventDefault(); saveSelection(); }}
            onClick={onClick ?? (() => cmd && exec(cmd, value))}
            className={cn(
                "w-7 h-7 flex items-center justify-center rounded text-xs transition-colors",
                active
                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            )}
        >{children}</button>
    );

    const Divider = () => <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />;

    return (
        <div ref={wrapRef} className={cn("space-y-4", isFullscreen && "fixed inset-0 z-50 bg-white dark:bg-zinc-900 overflow-auto p-4")}>
            <div className={cn("glass-card rounded-2xl overflow-hidden", isFullscreen && "flex flex-col h-[calc(100vh-120px)]")}>

                {/* ── Toolbar Row 1: File / Edit / History ── */}
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                    <Btn title="새 문서" onClick={handleNewDoc}><FilePlus className="w-3.5 h-3.5" /></Btn>
                    <Btn title="HTML로 저장" onClick={handleDownload}><Download className="w-3.5 h-3.5" /></Btn>
                    <Btn title="인쇄" onClick={handlePrint}><Printer className="w-3.5 h-3.5" /></Btn>
                    <Divider />
                    <Btn cmd="cut"   title="잘라내기"><Scissors className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="copy"  title="복사하기"><Copy className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="paste" title="붙여넣기"><FileText className="w-3.5 h-3.5" /></Btn>
                    <Divider />
                    <Btn cmd="undo" title="실행 취소"><Undo2 className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="redo" title="다시 실행"><Redo2 className="w-3.5 h-3.5" /></Btn>
                    <Divider />
                    <Btn cmd="selectAll" title="전체 선택"><span className="text-[10px] font-bold">All</span></Btn>
                    <Btn title="찾기" active={showFindBar} onClick={() => setShowFindBar(o => !o)}><Search className="w-3.5 h-3.5" /></Btn>
                    {showFindBar && (
                        <div className="flex items-center gap-1 ml-1">
                            <input value={findText} onChange={e => setFindText(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleFind()}
                                placeholder="텍스트 검색..."
                                className="h-6 px-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 outline-none focus:border-indigo-400" />
                            <button onClick={handleFind} className="text-xs px-2 h-6 bg-indigo-600 text-white rounded hover:bg-indigo-500">찾기</button>
                        </div>
                    )}
                    <div className="ml-auto flex items-center gap-0.5">
                        <Btn title={isFullscreen ? "전체화면 닫기" : "전체화면"} active={isFullscreen} onClick={() => setIsFullscreen(o => !o)}>
                            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        </Btn>
                        <Btn title="소스 편집" active={sourceMode} onClick={toggleSourceMode}><Code className="w-3.5 h-3.5" /></Btn>
                    </div>
                </div>

                {/* ── Toolbar Row 2: Format / Lists / Align / Links ── */}
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                    <Btn cmd="bold"          active={activeFormats["bold"]}          title="굵게 (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="italic"        active={activeFormats["italic"]}        title="기울임 (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="underline"     active={activeFormats["underline"]}     title="밑줄 (Ctrl+U)"><Underline className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="strikeThrough" active={activeFormats["strikeThrough"]} title="취소선"><Strikethrough className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="subscript"    active={activeFormats["subscript"]}     title="아래 첨자"><Subscript className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="superscript"  active={activeFormats["superscript"]}   title="위 첨자"><Superscript className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="removeFormat"  title="서식 제거"><Eraser className="w-3.5 h-3.5" /></Btn>
                    <Divider />
                    <Btn cmd="insertOrderedList"   active={activeFormats["insertOrderedList"]}   title="번호 목록"><ListOrdered className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="insertUnorderedList" active={activeFormats["insertUnorderedList"]} title="글머리 목록"><List className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="outdent" title="내어쓰기"><Outdent className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="indent"  title="들여쓰기"><Indent className="w-3.5 h-3.5" /></Btn>
                    <Divider />
                    <Btn cmd="formatBlock" value="blockquote" title="인용문 (Blockquote)"><Quote className="w-3.5 h-3.5" /></Btn>
                    <Divider />
                    <Btn cmd="justifyLeft"   active={activeFormats["justifyLeft"]}   title="왼쪽 정렬"><AlignLeft className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="justifyCenter" active={activeFormats["justifyCenter"]} title="가운데 정렬"><AlignCenter className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="justifyRight"  active={activeFormats["justifyRight"]}  title="오른쪽 정렬"><AlignRight className="w-3.5 h-3.5" /></Btn>
                    <Btn cmd="justifyFull"   active={activeFormats["justifyFull"]}   title="양쪽 정렬"><AlignJustify className="w-3.5 h-3.5" /></Btn>
                    <Divider />
                    <Btn title="링크 삽입" active={showLinkDialog} onClick={() => { saveSelection(); setShowLinkDialog(o => !o); setShowImageDialog(false); }}>
                        <Link className="w-3.5 h-3.5" />
                    </Btn>
                    <Btn cmd="unlink" title="링크 제거"><Link2Off className="w-3.5 h-3.5" /></Btn>
                </div>

                {/* ── Toolbar Row 3: Media / Style / Color ── */}
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20">
                    <Btn title="이미지 삽입" active={showImageDialog} onClick={() => { saveSelection(); setShowImageDialog(o => !o); setShowLinkDialog(false); }}>
                        <Image className="w-3.5 h-3.5" />
                    </Btn>

                    {/* Table picker */}
                    <div className="relative">
                        <Btn title="표 삽입" active={showTablePicker} onClick={() => { saveSelection(); setShowTablePicker(o => !o); }}>
                            <Table className="w-3.5 h-3.5" />
                        </Btn>
                        {showTablePicker && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowTablePicker(false)} />
                                <div className="absolute top-full mt-1 left-0 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-3">
                                    <p className="text-[10px] text-zinc-500 mb-2 font-semibold">
                                        {tableHover[0] > 0 ? `${tableHover[0]} × ${tableHover[1]} 표` : "크기 선택"}
                                    </p>
                                    <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(8, 20px)" }}>
                                        {Array.from({ length: 64 }, (_, i) => {
                                            const r = Math.floor(i / 8) + 1;
                                            const c = (i % 8) + 1;
                                            return (
                                                <div key={i}
                                                    onMouseEnter={() => setTableHover([r, c])}
                                                    onMouseLeave={() => setTableHover([0, 0])}
                                                    onClick={() => insertTable(r, c)}
                                                    className={cn("w-5 h-5 border rounded-sm cursor-pointer transition-colors",
                                                        r <= tableHover[0] && c <= tableHover[1]
                                                            ? "bg-indigo-400 border-indigo-500"
                                                            : "bg-zinc-100 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600"
                                                    )} />
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <Btn cmd="insertHorizontalRule" title="수평선 삽입"><Minus className="w-3.5 h-3.5" /></Btn>

                    {/* Emoji picker */}
                    <div className="relative">
                        <Btn title="이모지 삽입" active={showEmojiPicker} onClick={() => { saveSelection(); setShowEmojiPicker(o => !o); }}>
                            <Smile className="w-3.5 h-3.5" />
                        </Btn>
                        {showEmojiPicker && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                                <div className="absolute top-full mt-1 left-0 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-3 w-[260px]">
                                    <div className="grid grid-cols-10 gap-0.5">
                                        {EMOJIS.map(emoji => (
                                            <button key={emoji} onClick={() => { exec("insertText", emoji); setShowEmojiPicker(false); }}
                                                className="w-6 h-6 flex items-center justify-center text-base hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors">
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <Divider />

                    {/* Block format */}
                    <select value={currentBlock} onChange={e => applyBlock(e.target.value)}
                        onMouseDown={saveSelection}
                        className="h-7 px-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400 cursor-pointer">
                        {BLOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {/* Font family */}
                    <select value={currentFont} onChange={e => applyFont(e.target.value)}
                        onMouseDown={saveSelection}
                        className="h-7 px-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400 cursor-pointer max-w-[120px]">
                        {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {/* Font size */}
                    <select value={currentSize} onChange={e => applySize(e.target.value)}
                        onMouseDown={saveSelection}
                        className="h-7 px-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-400 cursor-pointer">
                        {SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    <Divider />

                    {/* Text color */}
                    <div className="relative" title="글자 색상">
                        <label className="w-7 h-7 flex flex-col items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors gap-0.5">
                            <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-200 leading-none" style={{ textDecoration: `underline 2px solid ${textColor}` }}>A</span>
                            <span className="text-[9px] text-zinc-400">색상</span>
                            <input type="color" value={textColor}
                                onMouseDown={saveSelection}
                                onChange={e => applyTextColor(e.target.value)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                        </label>
                    </div>

                    {/* Background color */}
                    <div className="relative" title="배경 색상">
                        <label className="w-7 h-7 flex flex-col items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors gap-0.5">
                            <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-200 leading-none px-0.5 rounded-sm" style={{ backgroundColor: bgColor }}>A</span>
                            <span className="text-[9px] text-zinc-400">배경</span>
                            <input type="color" value={bgColor}
                                onMouseDown={saveSelection}
                                onChange={e => applyBgColor(e.target.value)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                        </label>
                    </div>
                </div>

                {/* Link dialog inline */}
                {showLinkDialog && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-500/20">
                        <Link className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && insertLink()}
                            placeholder="URL 입력 (예: https://example.com)"
                            className="flex-1 h-7 px-2 text-xs border border-indigo-200 dark:border-indigo-500/40 rounded bg-white dark:bg-zinc-800 outline-none focus:border-indigo-400" />
                        <button onClick={insertLink} className="px-3 h-7 text-xs font-bold bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors">삽입</button>
                        <button onClick={() => setShowLinkDialog(false)} className="px-2 h-7 text-xs text-zinc-500 hover:text-zinc-700 transition-colors">취소</button>
                    </div>
                )}

                {/* Image dialog inline */}
                {showImageDialog && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-100 dark:border-emerald-500/20">
                        <Image className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && insertImage()}
                            placeholder="이미지 URL 입력 (예: https://example.com/image.png)"
                            className="flex-1 h-7 px-2 text-xs border border-emerald-200 dark:border-emerald-500/40 rounded bg-white dark:bg-zinc-800 outline-none focus:border-emerald-400" />
                        <button onClick={insertImage} className="px-3 h-7 text-xs font-bold bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors">삽입</button>
                        <button onClick={() => setShowImageDialog(false)} className="px-2 h-7 text-xs text-zinc-500 hover:text-zinc-700 transition-colors">취소</button>
                    </div>
                )}

                {/* Editor Area */}
                {sourceMode ? (
                    <textarea
                        value={sourceDraft}
                        onChange={e => setSourceDraft(e.target.value)}
                        className="w-full flex-1 min-h-[400px] p-6 font-mono text-xs text-emerald-300 bg-zinc-950 outline-none resize-none border-0"
                        spellCheck={false}
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        onKeyUp={handleKeyUp}
                        onMouseUp={handleMouseUp}
                        onFocus={saveSelection}
                        onBlur={saveSelection}
                        className={cn(
                            "outline-none p-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
                            "min-h-[400px]",
                            isFullscreen ? "flex-1 overflow-y-auto" : "",
                            "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-2",
                            "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-2",
                            "[&_h3]:text-xl  [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-2",
                            "[&_h4]:text-lg  [&_h4]:font-semibold [&_h4]:mb-2",
                            "[&_p]:mb-3 [&_p]:leading-relaxed",
                            "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3",
                            "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3",
                            "[&_li]:mb-1",
                            "[&_blockquote]:border-l-4 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-3 [&_blockquote]:text-zinc-500 [&_blockquote]:italic",
                            "[&_pre]:bg-zinc-900 [&_pre]:text-emerald-300 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-3 [&_pre]:text-sm [&_pre]:font-mono [&_pre]:overflow-x-auto",
                            "[&_table]:w-full [&_table]:border-collapse [&_table]:my-3",
                            "[&_td]:border [&_td]:border-zinc-200 dark:[&_td]:border-zinc-700 [&_td]:p-2",
                            "[&_th]:border [&_th]:border-zinc-200 dark:[&_th]:border-zinc-700 [&_th]:p-2 [&_th]:bg-zinc-50 dark:[&_th]:bg-zinc-800 [&_th]:font-semibold",
                            "[&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer",
                            "[&_img]:max-w-full [&_img]:h-auto [&_img]:my-2 [&_img]:rounded",
                            "[&_hr]:border-zinc-200 dark:[&_hr]:border-zinc-700 [&_hr]:my-4"
                        )}
                    />
                )}

                {/* Status bar */}
                <div className="flex items-center px-3 py-1 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 gap-4">
                    <span className="text-[10px] font-mono text-zinc-400">{statusPath}</span>
                    <span className="text-[10px] text-zinc-400 ml-auto">
                        {htmlOutput.replace(/<[^>]+>/g, "").length} 자
                    </span>
                </div>
            </div>

            {/* Source Code Output */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg gap-0.5">
                            <button onClick={() => setSourceOutputTab("body")}
                                className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all",
                                    sourceOutputTab === "body"
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
                                )}>본문 HTML</button>
                            <button onClick={() => setSourceOutputTab("full")}
                                className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all",
                                    sourceOutputTab === "full"
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
                                )}>전체 HTML</button>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                            {(sourceOutputTab === "body" ? htmlOutput : fullHtml).split("\n").length} lines
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopy}
                            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                                copied ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-indigo-600 text-white hover:bg-indigo-500"
                            )}>
                            {copied ? <><Check className="w-3 h-3" /> 복사됨</> : <><Copy className="w-3 h-3" /> 복사</>}
                        </button>
                        <button onClick={handleDownload}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 transition-colors">
                            <Download className="w-3 h-3" /> HTML 저장
                        </button>
                    </div>
                </div>
                <Editor
                    height="280px"
                    language="html"
                    value={sourceOutputTab === "body" ? htmlOutput : fullHtml}
                    theme={monacoTheme}
                    options={{ ...COMMON_MONOCO_OPTS, readOnly: true, domReadOnly: true }}
                />
                <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <p className="text-[10px] text-zinc-400">💡 본문 HTML은 에디터 내용만, 전체 HTML은 DOCTYPE과 스타일이 포함된 완성 파일입니다. 복사 또는 HTML 저장으로 바로 사용하세요.</p>
                </div>
            </div>
        </div>
    );
}
