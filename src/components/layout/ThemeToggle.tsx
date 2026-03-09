"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 text-gray-400 w-10 h-10 shadow-sm" />
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 text-gray-400 hover:text-[#1c1c1c] dark:hover:text-white shadow-sm transition-all relative overflow-hidden group"
            aria-label="Toggle theme"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-2.5 left-2.5" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
