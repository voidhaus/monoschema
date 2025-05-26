import React from "react";

const Header = () => (
  <nav className="z-20 w-full flex items-center justify-between px-8 py-6 bg-transparent">
    <div className="flex items-center gap-3">
      <span className="inline-block">
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" fill="none" />
          <rect x="10" y="10" width="20" height="20" rx="5" stroke="#00E5FF" strokeWidth="2" fill="none" />
          <polygon points="20,13 27,27 13,27" stroke="#F59E42" strokeWidth="2" fill="none" />
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
