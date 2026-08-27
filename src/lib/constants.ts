import {
    Home,
    Code,
    FileText,
    Palette,
    Type,
    Binary,
    Link as LinkIcon,
    QrCode,
    Clock,
    Paintbrush,
    Layers,
    MousePointer2,
    BoxSelect,
    Clapperboard,
    SwatchBook,
    FileCode2,
    Ruler,
    Image,
    Globe,
    Languages,
    FileDiff,
    Share2,
    MonitorCog,
    Tags,
    FileImage,
    Hash,
    AppWindow,
    Table2,
    LayoutTemplate,
} from "lucide-react";

export interface ToolItem {
    icon: any;
    label: string;
    href: string;
    id: string;
    category?: "tools" | "ui";
}

export const TOOL_ITEMS: ToolItem[] = [
    { icon: Home, label: "공구함 홈", href: "/", id: "home", category: "tools" },
    // ── UI 요소 ──
    { icon: LayoutTemplate, label: "박스", href: "/tools/box", id: "box", category: "ui" },
    // ── 영문 ──
    { icon: Binary, label: "Base64 변환기", href: "/tools/base64", id: "base64", category: "tools" },
    { icon: Paintbrush, label: "CSS 그라데이션", href: "/tools/css-gradient", id: "css-gradient", category: "tools" },
    { icon: BoxSelect, label: "CSS 박스 섀도우", href: "/tools/css-shadow", id: "css-shadow", category: "tools" },
    { icon: Clapperboard, label: "CSS 애니메이션", href: "/tools/css-animation", id: "css-animation", category: "tools" },
    { icon: Image, label: "Favicon 생성기", href: "/tools/favicon-generator", id: "favicon-generator", category: "tools" },
    { icon: Code, label: "HTML 특수문자", href: "/tools/html-chars", id: "html-chars", category: "tools" },
    { icon: Table2, label: "HTML 테이블 에디터", href: "/tools/html-table-editor", id: "html-table-editor", category: "tools" },
    { icon: FileText, label: "JSON 포매터", href: "/tools/json-formatter", id: "json-formatter", category: "tools" },
    { icon: Tags, label: "Meta Tags 생성기", href: "/tools/meta-tags-generator", id: "meta-tags-generator", category: "tools" },
    { icon: Share2, label: "OG 카드 미리보기", href: "/tools/og-card-preview", id: "og-card-preview", category: "tools" },
    { icon: QrCode, label: "QR 생성기", href: "/tools/qr-generator", id: "qr-generator", category: "tools" },
    { icon: FileCode2, label: "SVG 최적화", href: "/tools/svg-optimizer", id: "svg-optimizer", category: "tools" },
    { icon: LinkIcon, label: "URL 인코더", href: "/tools/url-encoder", id: "url-encoder", category: "tools" },
    { icon: AppWindow, label: "웹 에디터", href: "/tools/web-editor", id: "web-editor", category: "tools" },
    // ── 한글 ──
    { icon: Layers, label: "그라데이션 배경", href: "/tools/gradient-backgrounds", id: "gradient-backgrounds", category: "tools" },
    { icon: Globe, label: "내 IP 확인하기", href: "/tools/my-ip", id: "my-ip", category: "tools" },
    { icon: Ruler, label: "단위 계산기", href: "/tools/unit-calculator", id: "unit-calculator", category: "tools" },
    { icon: MonitorCog, label: "반응형 이미지 헬퍼", href: "/tools/responsive-image-helper", id: "responsive-image-helper", category: "tools" },
    { icon: Languages, label: "번역기", href: "/tools/translator", id: "translator", category: "tools" },
    { icon: Palette, label: "색상 변환기", href: "/tools/color-converter", id: "color-converter", category: "tools" },
    { icon: SwatchBook, label: "색상 팔레트", href: "/tools/color-palette", id: "color-palette", category: "tools" },
    { icon: MousePointer2, label: "이미지 맵핑", href: "/tools/image-map", id: "image-map", category: "tools" },
    { icon: FileImage, label: "이미지 포맷 변환기", href: "/tools/image-converter", id: "image-converter", category: "tools" },
    { icon: FileDiff, label: "코드 비교", href: "/tools/code-diff", id: "code-diff", category: "tools" },
    { icon: Clock, label: "타임스탬프", href: "/tools/timestamp", id: "timestamp", category: "tools" },
    { icon: Type, label: "텍스트 변환기", href: "/tools/text-transformer", id: "text-transformer", category: "tools" },
    { icon: Hash, label: "특수문자 모음", href: "/tools/special-chars", id: "special-chars", category: "tools" },
];
