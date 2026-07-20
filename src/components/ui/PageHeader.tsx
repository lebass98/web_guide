"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
    title: string;
    description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="mb-10 overflow-hidden">
            <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2"
            >
                {title}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
                className="text-[15px] text-gray-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed"
            >
                {description}
            </motion.p>
        </div>
    );
}
