import React, { useEffect, useRef, useState } from 'react';

/**
 * Animated stat card with icon, value counter, and label
 * @param {{ icon: React.ReactNode, value: number, label: string, color: string, suffix?: string }} props
 */
export default function StatCard({ icon, value, label, color = 'blue', suffix = '' }) {
    const [display, setDisplay] = useState(0);
    const prevRef = useRef(0);

    useEffect(() => {
        const from = prevRef.current;
        const to = value;
        const duration = 800;
        const start = performance.now();

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(from + (to - from) * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        prevRef.current = to;
    }, [value]);

    return (
        <div className="stat-card">
            <div className={`stat-icon ${color}`}>
                {icon}
            </div>
            <div>
                <div className="stat-value">
                    {display.toLocaleString()}{suffix}
                </div>
                <div className="stat-label">{label}</div>
            </div>
        </div>
    );
}
