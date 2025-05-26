
import React, { useState, useEffect } from "react";

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

function Dropdown({ label, items, mobile, open, setOpen }: {
  label: string;
  items: { label: string; href: string; external?: boolean }[];
  mobile?: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}) {
  if (mobile) {
    return (
      <div className="w-full">
        <button
          className="w-full flex items-center justify-between py-3 px-4 text-xl font-semibold focus:outline-none group"
          onClick={() => setOpen && setOpen(!open)}
        >
          <span className={open ? "bg-gradient-to-r from-[#00E5FF] via-[#7C3AED] to-[#F59E42] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]" : ""}>
            {label}
          </span>
          <svg className={`w-5 h-5 ml-2 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && (
          <ul className="w-full bg-[#181824] border-t border-[#232336]/60 py-1">
            {items.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="block px-6 py-3 text-base rounded transition-colors hover:bg-gradient-to-r hover:from-[#00E5FF]/10 hover:to-[#7C3AED]/10"
                >
                  <span className="hover:bg-gradient-to-r hover:from-[#00E5FF] hover:via-[#7C3AED] hover:to-[#F59E42] hover:bg-clip-text hover:text-transparent hover:[-webkit-background-clip:text] hover:[-webkit-text-fill-color:transparent]">
                    {item.label}
                  </span>
                  {item.external && (
                    <svg className="inline ml-1 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
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


const Header = () => {
  // Close mobile menu if resizing to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [monoOpen, setMonoOpen] = useState(false);
  const [rpcOpen, setRpcOpen] = useState(false);
  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Clean up in case component unmounts while menu is open
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="z-20 w-full flex items-center justify-between px-4 md:px-8 py-6 bg-transparent">
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
      {/* Desktop nav */}
      <div className="hidden md:flex gap-8 text-white text-base font-medium">
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
      {/* Hamburger for mobile */}
      <button
        className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded focus:outline-none relative z-50"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Open menu"
      >
        <span className={`block w-7 h-0.5 bg-white rounded transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-7 h-0.5 bg-white rounded transition-all duration-300 my-1 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-7 h-0.5 bg-white rounded transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0a0a0fd9] backdrop-blur-sm z-40 flex flex-col items-center justify-start pt-32 px-0 animate-fade-in overflow-y-auto overscroll-contain touch-pan-y">
          <a
            href="/blog"
            className="w-full text-left py-4 text-xl font-semibold transition group px-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="group-hover:bg-gradient-to-r group-hover:from-[#00E5FF] group-hover:via-[#7C3AED] group-hover:to-[#F59E42] group-hover:bg-clip-text group-hover:text-transparent group-hover:[-webkit-background-clip:text] group-hover:[-webkit-text-fill-color:transparent]">
              Blog
            </span>
          </a>
          <Dropdown
            label="MonoSchema"
            items={menuItems}
            mobile
            open={monoOpen}
            setOpen={setMonoOpen}
          />
          <Dropdown
            label="RPC"
            items={rpcMenuItems}
            mobile
            open={rpcOpen}
            setOpen={setRpcOpen}
          />
          <a
            href="#contact"
            className="w-full text-left py-4 text-xl font-semibold transition group px-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="group-hover:bg-gradient-to-r group-hover:from-[#00E5FF] group-hover:via-[#7C3AED] group-hover:to-[#F59E42] group-hover:bg-clip-text group-hover:text-transparent group-hover:[-webkit-background-clip:text] group-hover:[-webkit-text-fill-color:transparent]">
              Contact
            </span>
          </a>
        </div>
      )}
    </nav>
  );
};

export default Header;
