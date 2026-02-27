"use client";

import Link from "next/link";
import { type LucideIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavigationItem[];
  activePath?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ items, activePath, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "flex-col glass border-zinc-200/50 h-screen sticky top-0 z-[70] transition-all duration-300 lg:translate-x-0 lg:flex lg:border-r lg:w-[72px]",
        isOpen
          ? "w-64 translate-x-0 fixed inset-y-0 right-0 border-l"
          : "translate-x-full fixed inset-y-0 right-0 lg:static lg:translate-x-0 border-l lg:border-l-0"
      )}>
        <div className="py-6 flex flex-col h-full items-center">
          <div className="mb-8 px-4">
            <Link href="/" onClick={onClose} className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-transform">
                <span className="text-white font-black text-xl">W</span>
              </div>
            </Link>
          </div>

          <nav className="flex flex-col gap-4 w-full px-3">
            {items.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "relative flex items-center justify-center w-full aspect-square rounded-xl transition-all duration-300 group",
                    isActive
                      ? "bg-fuchsia-50 text-fuchsia-600 shadow-sm"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                  title={item.title}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-all duration-300 group-hover:scale-110",
                      isActive ? "stroke-[2.5px]" : "stroke-2"
                    )}
                  />
                  
                  {/* Floating Title on Hover */}
                  <div className="absolute left-full ml-3 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50">
                    {item.title}
                    {/* Tooltip Arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-900" />
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -left-3 w-1 h-6 bg-fuchsia-500 rounded-r-full animate-in slide-in-from-left-2 duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
