import React from "react";

const Header = () => (
  <nav className="z-20 w-full flex items-center justify-between px-8 py-6 bg-transparent">
    <div className="flex items-center gap-3">
      <span className="inline-block">
        {/* MonoSchema Portal Logo - Larger */}
        <svg
          width="56" height="56" viewBox="0 0 120 60" fill="none"
          style={{ filter: 'drop-shadow(0 0 12px #00E5FF88) drop-shadow(0 0 24px #7C3AED44)' }}
          aria-hidden="true"
        >
          {/* Outer glowing ring */}
          <ellipse
            cx="60" cy="30" rx="28" ry="28"
            stroke="url(#divider-gradient)"
            strokeWidth="4"
            fill="none"
            opacity="0.8"
          />
          {/* Inner ring for depth */}
          <ellipse
            cx="60" cy="30" rx="18" ry="18"
            stroke="url(#divider-gradient2)"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          {/* Central spark */}
          <circle
            cx="60" cy="30" r="4"
            fill="#fff"
            opacity="0.95"
          />
          <circle
            cx="60" cy="30" r="10"
            fill="#00E5FF"
            opacity="0.22"
          />
          <defs>
            <radialGradient id="divider-gradient2" cx="0" cy="0" r="1" gradientTransform="translate(60 30) scale(18)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C3AED" stopOpacity="0.7" />
              <stop offset="1" stopColor="#00E5FF" stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id="divider-gradient" x1="32" y1="2" x2="88" y2="58" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5FF" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#7C3AED" stopOpacity="0.7" />
              <stop offset="1" stopColor="#F59E42" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="text-2xl font-bold text-white tracking-wide">VoidHaus</span>
    </div>
    <div className="flex gap-8 text-white text-base font-medium">
      <a href="#features" className="hover:text-[#00E5FF] transition">Features</a>
      <a href="#monoschema" className="hover:text-[#7C3AED] transition">MonoSchema</a>
      <a href="#contact" className="hover:text-[#F59E42] transition">Contact</a>
    </div>
  </nav>
);

export default Header;
