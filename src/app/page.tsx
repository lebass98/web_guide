import Link from "next/link";
import { Code, FileText, Palette, Type, Binary, Link as LinkIcon, QrCode, Clock, Paintbrush, Layers } from "lucide-react";

export default function Home() {
  const tools = [
    { title: "HTML 특수문자 변환", desc: "HTML 엔티티를 쉽게 제거하거나 변환하세요.", href: "/tools/html-chars", icon: Code, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "JSON 포매터", desc: "JSON 데이터를 포맷, 검증 및 정렬하세요.", href: "/tools/json-formatter", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "색상 변환기", desc: "HEX, RGB, HSL 형식을 쉽게 변환하세요.", href: "/tools/color-converter", icon: Palette, color: "text-pink-400", bg: "bg-pink-500/10" },
    { title: "텍스트 변환기", desc: "대문자, 소문자, 텍스트 치환 등 다양한 변환을 지원합니다.", href: "/tools/text-transformer", icon: Type, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { title: "Base64 변환기", desc: "Base64 문자열을 안전하게 인코딩 또는 디코딩하세요.", href: "/tools/base64", icon: Binary, color: "text-orange-400", bg: "bg-orange-500/10" },
    { title: "URL 인코더", desc: "URI 구성요소를 빠르게 인코딩 또는 디코딩하세요.", href: "/tools/url-encoder", icon: LinkIcon, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { title: "QR 코드 생성기", desc: "즉시 사용 가능한 QR 코드를 생성하세요.", href: "/tools/qr-generator", icon: QrCode, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
    { title: "타임스탬프 변환기", desc: "Unix 에포크 시간을 읽기 쉬운 형식으로 변환하세요.", href: "/tools/timestamp", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { title: "CSS 그라데이션", desc: "사용자 지정 CSS 그라데이션을 쉽게 시각화하고 코드를 복사하세요.", href: "/tools/css-gradient", icon: Paintbrush, color: "text-teal-400", bg: "bg-teal-500/10" },
    { title: "CSS 그라데이션 배경", desc: "영감을 주는 아름다운 CSS 그라데이션 프리셋들을 모아놓은 갤러리입니다.", href: "/tools/gradient-backgrounds", icon: Layers, color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8 lg:gap-10 pb-10">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          환영합니다, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">WebTools</span>
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl">
          웹퍼블리셔 및 웹개발자들을 위한 프리미엄 유틸리티의 모든 것. 빠르고 안전하며 아름다운 도구들로 작업 효율을 높이세요.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col justify-between p-6 glass-card hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/20 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${tool.bg}`}>
              <tool.icon className={`w-6 h-6 ${tool.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-fuchsia-400 transition-colors">{tool.title}</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
