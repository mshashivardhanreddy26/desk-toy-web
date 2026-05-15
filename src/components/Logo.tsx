import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Ring / Aura */}
      <circle
        cx="50"
        cy="50"
        r="48"
        stroke="#00ff88"
        strokeWidth="2"
        strokeDasharray="10 5"
        className="opacity-20 animate-[spin_20s_linear_infinite]"
      />
      
      {/* Hexagonal Brain Shell */}
      <path
        d="M50 15L80.3 32.5V67.5L50 85L19.7 67.5V32.5L50 15Z"
        stroke="#00ff88"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Inner "Core" - Neural Node */}
      <circle
        cx="50"
        cy="50"
        r="12"
        fill="#00ff88"
        className="animate-pulse"
      />
      
      {/* Connecting "Circuits" */}
      <path
        d="M50 30V15M50 85V70M80.3 32.5L65 41M19.7 32.5L35 41M80.3 67.5L65 59M19.7 67.5L35 59"
        stroke="#00ff88"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
