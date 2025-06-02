"use client";

import ResponsiveGridBackground from "./ResponsiveGridBackground";
import GridAnimatedDots from "./GridAnimatedDots";

export default function DocsBackground() {
  return (
    <>
      {/* Subtle animated grid background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ResponsiveGridBackground />
        <GridAnimatedDots dotSize={2} />
      </div>
      
      {/* Background elements similar to other pages */}
      <div className="pointer-events-none absolute z-0 left-1/2 top-40 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-br from-[#fff2] via-[#00e5ff22] to-[#23233600] blur-3xl opacity-40 animate-pulse" />
      <div className="absolute top-[-120px] left-[-160px] w-[420px] h-[260px] bg-gradient-to-br from-[#232336] to-[#44454a] rounded-full blur-3xl opacity-30 rotate-[-18deg]" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-gradient-to-tr from-[#232336] to-[#393a40] rounded-full blur-2xl opacity-30" />
    </>
  );
}
