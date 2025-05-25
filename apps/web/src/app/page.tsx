"use client";

import ResponsiveGridBackground from "./ResponsiveGridBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#181825] flex flex-col overflow-hidden">
      {/* NAVIGATION */}
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

      {/* --- DYNAMIC, LAYERED, INTERESTING BACKGROUND --- */}
      {/* Animated radial gradient glow behind hero */}
      <div className="pointer-events-none absolute z-0 left-1/2 top-40 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-br from-[#fff2] via-[#00e5ff22] to-[#23233600] blur-3xl opacity-40 animate-pulse" />

      {/* Large blurred ellipse top left */}
      <div className="absolute top-[-120px] left-[-160px] w-[420px] h-[260px] bg-gradient-to-br from-[#232336] to-[#44454a] rounded-full blur-3xl opacity-30 rotate-[-18deg]" />

      {/* Animated spinning polygon top right */}
      <svg className="absolute top-[-60px] right-[-60px] w-[180px] h-[180px] opacity-20 blur animate-spin-slow" style={{animationDuration:'18s'}} viewBox="0 0 100 100" fill="none"><polygon points="50,10 90,40 75,90 25,90 10,40" stroke="#7c7c8a" strokeWidth="8" fill="none" /></svg>

      {/* Responsive grid lines background (vertical and horizontal, 60px cells) */}
      <ResponsiveGridBackground />

      {/* Large blurred circle bottom right */}
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-gradient-to-tr from-[#232336] to-[#393a40] rounded-full blur-2xl opacity-30" />

      {/* Animated pulsing ring center left */}
      <svg className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] opacity-20 animate-pulse" style={{animationDuration:'4s'}} viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="50" stroke="#7c7c8a" strokeWidth="10" fill="none" /></svg>

      {/* Subtle polygon bottom left */}
      <svg className="absolute bottom-10 left-[-40px] w-[100px] h-[80px] opacity-10" viewBox="0 0 100 80" fill="none"><polygon points="10,70 50,10 90,70" stroke="#44454a" strokeWidth="8" fill="none" /></svg>

      {/* Thin diagonal line mid right */}
      <svg className="absolute top-1/3 right-0 w-[180px] h-[40px] opacity-10" viewBox="0 0 180 40" fill="none"><line x1="10" y1="30" x2="170" y2="10" stroke="#393a40" strokeWidth="6" strokeLinecap="round" /></svg>

      {/* HERO SECTION */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-32">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-6">
          Build. Validate. Ship.<br />With <span className="text-[#00E5FF]">VoidHaus</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-400 font-light mb-10 max-w-2xl">
          The software house for next-gen TypeScript tools. We craft blazing-fast, type-safe solutions for ambitious teams and monorepos.
        </p>
        <a
          href="#monoschema"
          className="inline-block px-8 py-3 rounded-xl border-2 border-[#00E5FF] text-gray-300 font-normal shadow-lg hover:scale-105 transition-transform text-lg bg-transparent hover:bg-[#00E5FF]/10"
        >
          Discover MonoSchema
        </a>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 pb-24">
        <div className="bg-[#181825]/80 border border-[#232336] rounded-2xl p-8 flex flex-col items-center text-center shadow-lg backdrop-blur-md">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4">
            <circle cx="24" cy="24" r="22" stroke="#fff" strokeOpacity="0.15" strokeWidth="3" fill="none" />
            <rect x="14" y="14" width="20" height="20" rx="6" stroke="#00E5FF" strokeWidth="2" fill="none" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Type-Safe by Design</h3>
          <p className="text-gray-400 font-light">All our tools are built with TypeScript-first principles for maximum safety and DX.</p>
        </div>
        <div className="bg-[#181825]/80 border border-[#232336] rounded-2xl p-8 flex flex-col items-center text-center shadow-lg backdrop-blur-md">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4">
            <polygon points="24,8 40,40 8,40" stroke="#fff" strokeOpacity="0.15" strokeWidth="3" fill="none" />
            <polygon points="24,14 36,38 12,38" stroke="#F59E42" strokeWidth="2" fill="none" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Monorepo Ready</h3>
          <p className="text-gray-400 font-light">Seamless integration for large codebases and modern monorepo workflows.</p>
        </div>
        <div className="bg-[#181825]/80 border border-[#232336] rounded-2xl p-8 flex flex-col items-center text-center shadow-lg backdrop-blur-md">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4">
            <rect x="8" y="8" width="32" height="32" rx="10" stroke="#fff" strokeOpacity="0.15" strokeWidth="3" fill="none" />
            <circle cx="24" cy="24" r="10" stroke="#7C3AED" strokeWidth="2" fill="none" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Performance Obsessed</h3>
          <p className="text-gray-400 font-light">Lightning-fast validation and transformation, even at scale.</p>
        </div>
      </section>

      {/* MONOSCHEMA SECTION */}
      <section id="monoschema" className="relative z-10 flex flex-col items-center text-center px-6 py-24">
        <div className="flex flex-col items-center bg-[#181825]/90 border border-[#232336] rounded-2xl shadow-2xl p-10 max-w-2xl w-full backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#00E5FF" strokeWidth="2" fill="none" />
              <rect x="10" y="10" width="20" height="20" rx="5" stroke="#7C3AED" strokeWidth="2" fill="none" />
              <polygon points="20,13 27,27 13,27" stroke="#F59E42" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-2xl font-bold text-white tracking-wide">MonoSchema</span>
          </div>
          <p className="text-gray-400 font-light text-base md:text-lg mb-6">
            A blazing-fast, type-safe schema library for TypeScript. Effortless validation, transformation, and more—built for modern monorepos.
          </p>
          <a
            href="https://github.com/voidhaus/monoschema"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 rounded-lg border-2 border-[#00E5FF] text-gray-300 font-normal shadow-lg hover:scale-105 transition-transform bg-transparent hover:bg-[#00E5FF]/10"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="relative z-10 flex flex-col items-center text-center px-6 pb-24">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Contact</h2>
        <p className="text-gray-400 font-light mb-6">Want to work with us or have questions? Email <a href="mailto:hello@void.haus" className="text-[#00E5FF] underline">hello@void.haus</a></p>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full text-center py-6 text-gray-500 text-sm font-light opacity-80 border-t border-[#232336]">
        © {new Date().getFullYear()} VoidHaus. All rights reserved.
      </footer>
    </main>
  );
}
