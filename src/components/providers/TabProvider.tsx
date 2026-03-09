"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TOOL_ITEMS } from "@/lib/constants";

interface Tab {
    id: string;
    label: string;
    path: string;
}

interface TabContextType {
    tabs: Tab[];
    activeTabPath: string;
    addTab: (path: string) => void;
    removeTab: (path: string) => void;
    toolStates: Record<string, any>;
    setToolState: (path: string, state: any) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: React.ReactNode }) {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [toolStates, setToolStates] = useState<Record<string, any>>({});
    const pathname = usePathname();
    const router = useRouter();

    // Add tab when navigating to a new tool
    useEffect(() => {
        const item = TOOL_ITEMS.find((t) => t.href === pathname);
        if (item) {
            setTabs((prev) => {
                if (prev.find((t) => t.path === pathname)) return prev;
                return [...prev, { id: item.id, label: item.label, path: item.href }];
            });
        }
    }, [pathname]);

    const addTab = (path: string) => {
        const item = TOOL_ITEMS.find((t) => t.href === path);
        if (item && !tabs.find((t) => t.path === path)) {
            setTabs((prev) => [...prev, { id: item.id, label: item.label, path: item.href }]);
        }
        router.push(path);
    };

    const removeTab = (path: string) => {
        setTabs((prev) => {
            const nextTabs = prev.filter((t) => t.path !== path);
            // If we closed the active tab, navigate to the last remaining tab or home
            if (pathname === path) {
                const lastTab = nextTabs[nextTabs.length - 1];
                router.push(lastTab ? lastTab.path : "/");
            }
            return nextTabs;
        });
    };

    const setToolState = (path: string, state: any) => {
        setToolStates((prev) => {
            const current = prev[path];
            const next = typeof state === 'function' ? state(current) : state;
            return { ...prev, [path]: next };
        });
    };

    return (
        <TabContext.Provider
            value={{
                tabs,
                activeTabPath: pathname,
                addTab,
                removeTab,
                toolStates,
                setToolState,
            }}
        >
            {children}
        </TabContext.Provider>
    );
}

export function useTabs() {
    const context = useContext(TabContext);
    if (!context) throw new Error("useTabs must be used within a TabProvider");
    return context;
}

export function useToolState<T>(path: string, initialState: T): [T, (state: T | ((prev: T) => T)) => void] {
    const { toolStates, setToolState } = useTabs();

    // Helper to merge state with initial template
    const getMergedState = (saved: any): T => {
        if (typeof initialState === 'object' && initialState !== null) {
            if (saved !== null && typeof saved === 'object') {
                return { ...initialState, ...saved } as T;
            }
        }
        return (saved as T ?? initialState);
    };

    const state = getMergedState(toolStates[path]);

    const setState = (newState: T | ((prev: T) => T)) => {
        setToolState(path, (rawSaved: any) => {
            const currentMerged = getMergedState(rawSaved);
            const next = typeof newState === 'function'
                ? (newState as (p: T) => T)(currentMerged)
                : newState;

            // If we're setting an object, ensure we're not losing other keys 
            // from the initial state or current state
            if (typeof next === 'object' && next !== null && typeof currentMerged === 'object' && currentMerged !== null) {
                return { ...currentMerged, ...next };
            }
            return next;
        });
    };

    return [state, setState];
}
