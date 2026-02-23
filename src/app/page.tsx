import Link from "next/link";
import { Code, FileText, Palette, Type, Binary, Link as LinkIcon, QrCode, Clock } from "lucide-react";

export default function Home() {
  const tools = [
    { title: "HTML Special Chars", desc: "Easily remove or convert HTML entities.", href: "/tools/html-chars", icon: Code, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "JSON Formatter", desc: "Format, validate, and beautify JSON data.", href: "/tools/json-formatter", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Color Converter", desc: "Convert HEX, RGB, HSL with ease.", href: "/tools/color-converter", icon: Palette, color: "text-pink-400", bg: "bg-pink-500/10" },
    { title: "Text Transformer", desc: "Uppercase, lowercase, replace, and more.", href: "/tools/text-transformer", icon: Type, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { title: "Base64 Converter", desc: "Encode or decode Base64 strings safely.", href: "/tools/base64", icon: Binary, color: "text-orange-400", bg: "bg-orange-500/10" },
    { title: "URL Encoder", desc: "Quickly encode or decode URI components.", href: "/tools/url-encoder", icon: LinkIcon, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { title: "QR Generator", desc: "Create ready-to-use QR codes instantly.", href: "/tools/qr-generator", icon: QrCode, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
    { title: "Timestamp", desc: "Convert Unix epoch times to human-readable.", href: "/tools/timestamp", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">WebTools</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Your one-stop collection of premium, developer-focused utilities. Enhance your workflow with tools that are fast, secure, and beautiful.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col justify-between p-6 glass-card hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/10 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${tool.bg}`}>
              <tool.icon className={`w-6 h-6 ${tool.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-fuchsia-400 transition-colors">{tool.title}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
