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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 flex-col glass border-white/10 h-screen sticky top-0 overflow-y-auto z-[70] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex lg:border-r",
        isOpen
          ? "translate-x-0 fixed inset-y-0 right-0 border-l"
          : "translate-x-full fixed inset-y-0 right-0 lg:static lg:translate-x-0 border-l lg:border-l-0"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={onClose}>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500 cursor-pointer hover:opacity-80 transition-opacity">
                WebTools UI
              </h1>
            </Link>
            <button
              className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {items.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
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
    </>
  );
}
