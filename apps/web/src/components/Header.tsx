
import React from "react";

const menuItems = [
  { label: "Features", href: "/monoschema#features" },
  { label: "Getting Started", href: "/monoschema#getting-started" },
  { label: "Examples", href: "/monoschema#examples" },
  { label: "Docs", href: "https://docs.void.haus/monoschema", external: true },
  { label: "NPM", href: "https://npmjs.com/package/monoschema", external: true },
  { label: "GitHub", href: "https://github.com/voidhaus/monoschema", external: true },
];
const rpcMenuItems = [
  { label: "Features", href: "/rpc#features" },
  { label: "Getting Started", href: "/rpc#getting-started" },
  { label: "Examples", href: "/rpc#examples" },
  { label: "Docs", href: "https://docs.void.haus/rpc", external: true },
  { label: "NPM", href: "https://npmjs.com/package/@voidhaus/rpc", external: true },
  { label: "GitHub", href: "https://github.com/voidhaus/rpc", external: true },
];

function Dropdown({ label, items }: { label: string; items: { label: string; href: string; external?: boolean }[] }) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 transition-colors focus:outline-none group">
        <span className="group-hover:bg-gradient-to-r group-hover:from-[#00E5FF] group-hover:via-[#7C3AED] group-hover:to-[#F59E42] group-hover:bg-clip-text group-hover:text-transparent group-hover:[-webkit-background-clip:text] group-hover:[-webkit-text-fill-color:transparent]">
          {label}
        </span>
        <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <ul className="absolute left-0 top-full w-48 bg-[#181824] border border-[#232336]/60 rounded-xl shadow-lg py-2 z-50 hidden group-hover:block">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="block px-4 py-2 hover:bg-gradient-to-r hover:from-[#00E5FF]/10 hover:to-[#7C3AED]/10 rounded transition-colors"
            >
              <span className="group-hover/item:bg-gradient-to-r group-hover/item:from-[#00E5FF] group-hover/item:via-[#7C3AED] group-hover/item:to-[#F59E42] group-hover/item:bg-clip-text group-hover/item:text-transparent group-hover/item:[-webkit-background-clip:text] group-hover/item:[-webkit-text-fill-color:transparent]">
                {item.label}
              </span>
              {item.external && (
                <svg className="inline ml-1 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
      <a
        href="/blog"
        className="transition group relative"
      >
        <span className="group-hover:bg-gradient-to-r group-hover:from-[#00E5FF] group-hover:via-[#7C3AED] group-hover:to-[#F59E42] group-hover:bg-clip-text group-hover:text-transparent group-hover:[-webkit-background-clip:text] group-hover:[-webkit-text-fill-color:transparent]">
          Blog
        </span>
      </a>
      <Dropdown label="MonoSchema" items={menuItems} />
      <Dropdown label="RPC" items={rpcMenuItems} />
      <a
        href="#contact"
        className="transition group relative"
      >
        <span className="group-hover:bg-gradient-to-r group-hover:from-[#00E5FF] group-hover:via-[#7C3AED] group-hover:to-[#F59E42] group-hover:bg-clip-text group-hover:text-transparent group-hover:[-webkit-background-clip:text] group-hover:[-webkit-text-fill-color:transparent]">
          Contact
        </span>
      </a>
    </div>
  </nav>
);

export default Header;
