"use client";

import {
    Search,
    Bell,
    MessageSquare,
    Plus,
    ChevronRight,
    Home
} from "lucide-react";

export function TopBar() {
    return (
        <div className="flex items-center justify-between w-full h-16 mb-6">
            {/* Left: User Tabs */}
            <div className="flex items-center gap-2 bg-white/50 p-1 rounded-2xl border border-gray-100">
                <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium border border-gray-100 transition-all">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amir" className="w-5 h-5 rounded-full" alt="" />
                    <span>Amir Baghian</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/50 rounded-xl text-sm font-medium text-gray-400 transition-all">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Leila" className="w-5 h-5 rounded-full grayscale" alt="" />
                    <span>Leila Baghian</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/50 rounded-xl text-sm font-medium text-gray-400 transition-all">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nick" className="w-5 h-5 rounded-full grayscale" alt="" />
                    <span>Nick Baghian</span>
                </button>
                <button className="p-2 hover:bg-white/50 rounded-xl text-gray-400 transition-all">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Right: Breadcrumbs & Actions */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Maham</span>
                    <ChevronRight className="w-4 h-4" />
                    <Home className="w-4 h-4 text-[#1c1c1c]" />
                    <span className="text-[#1c1c1c] font-medium">Overview</span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-[#1c1c1c] shadow-sm transition-all">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-[#1c1c1c] shadow-sm transition-all">
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-[#1c1c1c] shadow-sm transition-all">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
