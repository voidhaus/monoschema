import React, { useEffect, useState } from "react";

export default function ResponsiveGridBackground() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function update() {
      // Use the full scrollable height for the grid
      const width = document.documentElement.clientWidth;
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      setSize({ width, height });
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, []);

  // Always use exact pixel size for grid, so 60x60px is always square
  const vCount = Math.ceil(size.width / 60) + 1;
  const hCount = Math.ceil(size.height / 60) + 1;

  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0"
      width={size.width}
      height={size.height}
      style={{ minHeight: "100vh", minWidth: "100vw", display: "block" }}
      viewBox={`0 0 ${size.width} ${size.height}`}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Vertical lines */}
      {Array.from({ length: vCount }).map((_, i) => (
        <line key={"v" + i} x1={i * 60} y1="0" x2={i * 60} y2={size.height} stroke="#393a40" strokeWidth="2" />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: hCount }).map((_, i) => (
        <line key={"h" + i} x1="0" y1={i * 60} x2={size.width} y2={i * 60} stroke="#393a40" strokeWidth="2" />
      ))}
    </svg>
  );
}
