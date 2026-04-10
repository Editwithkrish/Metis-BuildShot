"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type AgentState = "connecting" | "initializing" | "listening" | "speaking" | "thinking";

interface BarVisualizerProps {
    state?: AgentState;
    barCount?: number;
    className?: string;
    demo?: boolean;
}

export function BarVisualizer({
    state = "listening",
    barCount = 16,
    className,
    demo = true
}: BarVisualizerProps) {
    const bars = useMemo(() => Array.from({ length: barCount }), [barCount]);

    return (
        <div className={cn("flex items-center justify-center gap-1.5 h-24", className)}>
            {bars.map((_, i) => (
                <Bar key={i} index={i} state={state} totalBars={barCount} />
            ))}
        </div>
    );
}

function Bar({ index, state, totalBars }: { index: number; state: AgentState; totalBars: number }) {
    const [height, setHeight] = useState(20);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === "listening" || state === "speaking") {
            interval = setInterval(() => {
                // Create a wave-like or random movement based on state
                const randomFactor = Math.random() * 60;
                const sinusoid = Math.sin((Date.now() / 200) + (index * 0.5)) * 20;
                setHeight(30 + randomFactor + sinusoid);
            }, 80);
        } else if (state === "thinking") {
            interval = setInterval(() => {
                setHeight(15 + Math.random() * 15);
            }, 150);
        } else {
            setHeight(10);
        }
        return () => clearInterval(interval);
    }, [state, index]);

    return (
        <motion.div
            animate={{
                height: `${height}%`,
                backgroundColor: state === "listening" ? "#5C7CFA" : "#8ED1B2",
                opacity: state === "thinking" ? [0.4, 0.7, 0.4] : 1
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                opacity: { repeat: Infinity, duration: 1.5 }
            }}
            className="w-2 rounded-full shadow-sm"
            style={{ minHeight: "4px" }}
        />
    );
}
