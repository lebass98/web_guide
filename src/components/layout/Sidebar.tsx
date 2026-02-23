import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavigationItem[];
  activePath?: string;
}

export function Sidebar({ items, activePath }: SidebarProps) {
  return (
    <aside className="w-64 flex-col hidden lg:flex glass border-r border-white/10 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500 mb-8">
          WebTools UI
        </h1>
        <nav className="flex flex-col gap-2">
          {items.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out",
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-black/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-fuchsia-400" : "text-zinc-500"
                  )}
                />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
