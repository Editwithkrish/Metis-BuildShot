"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MatrixProps {
    className?: string;
    rows?: number;
    cols?: number;
    color?: string;
}

export function Matrix({
    className,
    rows = 10,
    cols = 14,
    color = "#5C7CFA"
}: MatrixProps) {
    const [activeDots, setActiveDots] = useState<Set<number>>(new Set());

    useEffect(() => {
        const interval = setInterval(() => {
            const newActive = new Set<number>();
            const time = Date.now() / 1000;

            // Scanning line or wave pattern
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = r * cols + c;
                    // Create a moving diagonal wave
                    const intensity = Math.sin(c * 0.5 + r * 0.3 - time * 5);
                    if (intensity > 0.6 || Math.random() > 0.98) {
                        newActive.add(idx);
                    }
                }
            }
            setActiveDots(newActive);
        }, 100);

        return () => clearInterval(interval);
    }, [rows, cols]);

    const cells = useMemo(() => Array.from({ length: rows * cols }), [rows, cols]);

    return (
        <div
            className={cn("grid gap-2 p-4 bg-slate-900/5 rounded-3xl border border-slate-200/50", className)}
            style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
        >
            {cells.map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        backgroundColor: activeDots.has(i) ? color : "rgba(203, 213, 225, 0.2)",
                        scale: activeDots.has(i) ? 1.2 : 1,
                        boxShadow: activeDots.has(i) ? `0 0 10px ${color}44` : "none"
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-2.5 h-2.5 rounded-full"
                />
            ))}
        </div>
    );
}
