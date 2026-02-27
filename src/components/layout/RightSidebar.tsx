"use client";

import {
    Maximize2,
    MoreHorizontal,
    Paperclip,
    Mic,
    Send,
    Compass,
    Sparkles,
    BookOpen,
    Calendar,
    GraduationCap,
    Clock
} from "lucide-react";

export function RightSidebar() {
    return (
        <aside className="fixed right-0 top-0 h-screen w-[320px] bg-white border-l border-gray-100 p-6 flex flex-col z-50">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-gray-900">You AI Assistance</h3>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-[#1c1c1c] text-white rounded-full text-[10px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        Pro Account
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-[#1c1c1c] transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    How can I Help<br />you, Amir?
                </h2>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    You can ask anything about your academic status, assignments, exams, or courses.
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {[
                        { icon: Compass, label: "Exams" },
                        { icon: BookOpen, label: "Assignments" },
                        { icon: Calendar, label: "Events" },
                        { icon: Clock, label: "Schedule" },
                        { icon: GraduationCap, label: "Classes" }
                    ].map((btn, i) => (
                        <button key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-full text-xs font-medium text-gray-600 border border-gray-100">
                            <btn.icon className="w-3.5 h-3.5" />
                            {btn.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-2 w-full mb-6">
                    {["Generate 10 Math Questions", "Create Exam Study Plan", "Help Me with Homework"].map((txt, i) => (
                        <button key={i} className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] text-gray-500 hover:border-gray-300 transition-all text-left font-medium">
                            {txt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Input */}
            <div className="mt-auto bg-gray-50 rounded-[20px] p-2 border border-gray-100">
                <input
                    type="text"
                    placeholder="How can I help you today?"
                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none text-gray-900 placeholder:text-gray-400"
                />
                <div className="flex items-center justify-between px-2 pb-2 pt-1">
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Mic className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="p-2.5 bg-[#1c1c1c] text-white rounded-full hover:bg-black transition-colors">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
