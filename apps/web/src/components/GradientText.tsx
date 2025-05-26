import React from "react";

/**
 * GradientText - renders its children with the brand gradient as text fill.
 * Usage: <GradientText>MonoSchema</GradientText>
 */
export default function GradientText({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <span
      className={`bg-gradient-to-r from-[#00E5FF] via-[#7C3AED] to-[#F59E42] bg-clip-text text-transparent ${className}`}
      style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
    >
      {children}
    </span>
  );
}
