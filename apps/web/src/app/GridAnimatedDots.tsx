import React, { useEffect, useState } from "react";

// Utility to get grid lines for current scrollable area
function useGridSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function update() {
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
  return size;
}

// Dots travel along grid lines (vertical and horizontal)
export default function GridAnimatedDots() {
  const { width, height } = useGridSize();
  // Dots per direction (spread out, not every line)
  const vDotIdxs = [2, 6, 10, 15, 20];
  const hDotIdxs = [2, 5, 9, 13];

  // Animation duration and offset for variety
  const duration = 3.5; // seconds

  return (
    <>
      <style>{`
        @keyframes grid-dot-v {
          0% { transform: translateY(0); opacity: 0.7; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(${height - 24}px); opacity: 0.7; }
        }
        @keyframes grid-dot-h {
          0% { transform: translateX(0); opacity: 0.7; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(${width - 24}px); opacity: 0.7; }
        }
      `}</style>
      {/* Vertical dots */}
      {vDotIdxs.map((i, idx) => (
        <div
          key={"vdot"+i}
          className="pointer-events-none absolute z-0"
          style={{
            left: i * 60 - 4,
            top: 0,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 8px 2px #fff",
            opacity: 0.95,
            animation: `grid-dot-v ${duration + idx * 0.3}s linear infinite`,
            animationDelay: `${idx * 0.7}s`,
          }}
        />
      ))}
      {/* Horizontal dots */}
      {hDotIdxs.map((i, idx) => (
        <div
          key={"hdot"+i}
          className="pointer-events-none absolute z-0"
          style={{
            left: 0,
            top: i * 60 - 4,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 8px 2px #fff",
            opacity: 0.95,
            animation: `grid-dot-h ${duration + idx * 0.3}s linear infinite`,
            animationDelay: `${0.4 + idx * 0.7}s`,
          }}
        />
      ))}
    </>
  );
}
