import React from 'react';

interface SaraLogoProps {
    size?: number;
    className?: string;
}

/**
 * Sara AI logo — neon eye / vesica piscis geometry
 * on deep cosmic purple background.
 */
export const SaraLogo: React.FC<SaraLogoProps> = ({ size = 40, className = '' }) => {
    const s = size;
    const cx = s / 2;
    const cy = s / 2;
    // Outer radius ≈ 45% of size
    const R = s * 0.44;
    // Offset for the two overlapping main circles
    const offset = R * 0.42;
    // Inner (pupil) circle
    const ri = R * 0.28;

    const stroke = '#C4B5FD'; // lavender-300 neon
    const sw = s * 0.025;    // stroke-width proportional

    return (
        <svg
            width={s}
            height={s}
            viewBox={`0 0 ${s} ${s}`}
            className={className}
            aria-label="Sara AI Logo"
        >
            {/* Deep purple background */}
            <rect width={s} height={s} rx={s * 0.22} fill="#1E0A3D" />

            {/* Glow filter */}
            <defs>
                <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation={s * 0.025} result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g filter="url(#neon-glow)" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round">
                {/* Large outer circle */}
                <circle cx={cx} cy={cy} r={R} />

                {/* Upper arc circle (offset up) */}
                <circle cx={cx} cy={cy - offset} r={R} />

                {/* Lower arc circle (offset down) */}
                <circle cx={cx} cy={cy + offset} r={R} />

                {/* Pupil / inner circle */}
                <circle cx={cx} cy={cy} r={ri} />
            </g>
        </svg>
    );
};

export default SaraLogo;
