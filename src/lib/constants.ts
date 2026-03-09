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
} from "lucide-react";

export const TOOL_ITEMS = [
    { icon: Home, label: "공구함 홈", href: "/", id: "home" },
    { icon: Code, label: "HTML 특수문자", href: "/tools/html-chars", id: "html-chars" },
    { icon: FileText, label: "JSON 포매터", href: "/tools/json-formatter", id: "json-formatter" },
    { icon: Palette, label: "색상 변환기", href: "/tools/color-converter", id: "color-converter" },
    { icon: Type, label: "텍스트 변환기", href: "/tools/text-transformer", id: "text-transformer" },
    { icon: Binary, label: "Base64 변환기", href: "/tools/base64", id: "base64" },
    { icon: LinkIcon, label: "URL 인코더", href: "/tools/url-encoder", id: "url-encoder" },
    { icon: QrCode, label: "QR 생성기", href: "/tools/qr-generator", id: "qr-generator" },
    { icon: Clock, label: "타임스탬프", href: "/tools/timestamp", id: "timestamp" },
    { icon: Paintbrush, label: "CSS 그라데이션", href: "/tools/css-gradient", id: "css-gradient" },
    { icon: Layers, label: "그라데이션 배경", href: "/tools/gradient-backgrounds", id: "gradient-backgrounds" },
    { icon: MousePointer2, label: "이미지 맵핑", href: "/tools/image-map", id: "image-map" },
];
