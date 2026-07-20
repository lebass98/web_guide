"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function InteractiveBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const mouseXInverse = useMotionValue(0);
    const mouseYInverse = useMotionValue(0);

    // 부드러운 모션을 위한 Spring 설정
    const springConfig = { damping: 60, stiffness: 120, mass: 0.8 };
    
    const blob1X = useSpring(mouseX, springConfig);
    const blob1Y = useSpring(mouseY, springConfig);
    const blob2X = useSpring(mouseXInverse, springConfig);
    const blob2Y = useSpring(mouseYInverse, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const halfWidth = window.innerWidth / 2;
            const halfHeight = window.innerHeight / 2;

            // 화면 중심 기준 좌표 (-1 ~ 1 비율로 정규화 후 이동량 계산)
            const x = (clientX - halfWidth) / halfWidth;
            const y = (clientY - halfHeight) / halfHeight;

            // Blob 1은 마우스 방향으로 반응
            mouseX.set(x * 60);
            mouseY.set(y * 60);

            // Blob 2는 마우스 역방향으로 반응 (더 미세하게)
            mouseXInverse.set(-x * 40);
            mouseYInverse.set(-y * 40);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY, mouseXInverse, mouseYInverse]);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20 bg-slate-50/20 dark:bg-zinc-950/20 transition-colors duration-500">
            {/* Blob 1: Indigo & Purple (화면 좌상단 기본 배치) */}
            <motion.div
                style={{
                    x: blob1X,
                    y: blob1Y,
                }}
                className="absolute top-[10%] left-[10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-500/10 dark:from-indigo-500/15 dark:to-violet-500/5 blur-[80px] md:blur-[120px]"
            />
            {/* Blob 2: Rose & Amber (화면 우하단 기본 배치) */}
            <motion.div
                style={{
                    x: blob2X,
                    y: blob2Y,
                }}
                className="absolute bottom-[10%] right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-gradient-to-br from-rose-500/20 to-amber-500/10 dark:from-rose-500/15 dark:to-amber-500/5 blur-[80px] md:blur-[120px]"
            />
        </div>
    );
}
