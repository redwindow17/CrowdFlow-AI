import React, { useEffect, useRef, useState, memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Animated stat card with icon, value counter, and label.
 * Optimized with React.memo to prevent unnecessary re-renders in live data streams.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.icon - The icon element to display.
 * @param {number} props.value - The numeric value to animate to.
 * @param {string} props.label - Descriptive text for the statistic.
 * @param {string} [props.color='blue'] - Color theme for the icon background.
 * @param {string} [props.suffix=''] - Suffix to append to the animated number.
 * @returns {JSX.Element}
 */
const StatCard = memo(({ icon, value, label, color = 'blue', suffix = '' }) => {
    const [display, setDisplay] = useState(0);
    const prevRef = useRef(0);

    useEffect(() => {
        const from = prevRef.current;
        const to = value;
        const duration = 800;
        const start = performance.now();

        let animationFrameId;

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(from + (to - from) * eased));
            
            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        prevRef.current = to;

        return () => cancelAnimationFrame(animationFrameId);
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
});

StatCard.propTypes = {
    icon: PropTypes.node.isRequired,
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string,
    suffix: PropTypes.string,
};

export default StatCard;
