import { Menu, Github } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 w-full glass border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
          WebTools
        </span>
      </div>
      <div className="hidden lg:flex" />
      
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Github className="w-5 h-5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
}
