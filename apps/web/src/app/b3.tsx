export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#181824] flex flex-col items-center justify-between overflow-hidden">
      {/* Abstract SVG Backgrounds */}
      <svg className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] opacity-30 z-0 blur-sm animate-spin-slow" viewBox="0 0 900 900" fill="none">
        <circle cx="450" cy="450" r="350" stroke="#00FFC6" strokeWidth="32" fill="none" />
        <polygon points="450,120 820,780 80,780" fill="#FF00E0" fillOpacity="0.07" />
        <rect x="250" y="250" width="400" height="400" rx="80" fill="#FFD600" fillOpacity="0.06" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-[350px] h-[350px] opacity-40 z-0 blur-[2px] animate-pulse" viewBox="0 0 350 350" fill="none">
        <ellipse cx="175" cy="175" rx="150" ry="90" fill="#00B2FF" fillOpacity="0.13" />
        <rect x="220" y="220" width="70" height="70" rx="18" fill="#FF005C" fillOpacity="0.15" />
      </svg>

      {/* Glassmorphic Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-20 bg-white/10 backdrop-blur-md rounded-full px-8 py-3 flex gap-10 items-center border border-white/10 shadow-lg">
        <span className="text-2xl font-black tracking-widest text-white">VoidHaus</span>
        <ul className="flex gap-8 text-gray-300 font-medium">
          <li className="hover:text-white transition cursor-pointer">Home</li>
          <li className="hover:text-white transition cursor-pointer">About</li>
          <li className="hover:text-white transition cursor-pointer">Projects</li>
          <li className="hover:text-white transition cursor-pointer">Contact</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 z-10 text-center px-4">
        <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">MonoSchema</h1>
        <p className="text-2xl md:text-3xl text-gray-300 max-w-2xl mb-10 font-light">
          <span className="text-[#00FFC6] font-semibold">Type-safe</span>, <span className="text-[#FFD600] font-semibold">blazing fast</span>, <span className="text-[#FF00E0] font-semibold">extensible</span> TypeScript schema validation.<br />
          Built for modern apps by <span className="text-white font-bold">VoidHaus</span>.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-[#00FFC6] to-[#00B2FF] text-gray-900 font-extrabold text-xl shadow-xl hover:scale-105 transition-transform border-2 border-[#00FFC6]/40 hover:border-[#FFD600]/60"
        >
          <svg width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="12" fill="#fff" />
            <path d="M9 14l3 3L19 11" stroke="#00B2FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Get Started
        </a>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl mx-auto flex gap-6 overflow-x-auto py-12 px-2 z-10 scrollbar-thin scrollbar-thumb-[#23213a] scrollbar-track-transparent">
        <div className="min-w-[280px] bg-[#191726]/80 rounded-2xl p-8 flex flex-col items-center shadow-lg border-2 border-[#00FFC6]/30 hover:border-[#00FFC6] transition relative overflow-hidden group">
          <svg className="absolute -top-6 -right-6 w-16 h-16 opacity-60 group-hover:scale-110 transition" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="16" fill="#00FFC6" fillOpacity="0.15"/></svg>
          <h3 className="text-white text-xl font-bold mb-2">Type-Safe</h3>
          <p className="text-gray-400 text-center">End-to-end type safety for your schemas and data validation, powered by TypeScript.</p>
        </div>
        <div className="min-w-[280px] bg-[#191726]/80 rounded-2xl p-8 flex flex-col items-center shadow-lg border-2 border-[#FFD600]/30 hover:border-[#FFD600] transition relative overflow-hidden group">
          <svg className="absolute -top-6 -right-6 w-16 h-16 opacity-60 group-hover:scale-110 transition" viewBox="0 0 64 64" fill="none"><polygon points="32,8 56,56 8,56" fill="#FFD600" fillOpacity="0.13"/></svg>
          <h3 className="text-white text-xl font-bold mb-2">Extensible</h3>
          <p className="text-gray-400 text-center">Extend MonoSchema with custom rules, plugins, and seamless integrations.</p>
        </div>
        <div className="min-w-[280px] bg-[#191726]/80 rounded-2xl p-8 flex flex-col items-center shadow-lg border-2 border-[#FF00E0]/30 hover:border-[#FF00E0] transition relative overflow-hidden group">
          <svg className="absolute -top-6 -right-6 w-16 h-16 opacity-60 group-hover:scale-110 transition" viewBox="0 0 64 64" fill="none"><ellipse cx="32" cy="32" rx="28" ry="16" fill="#FF00E0" fillOpacity="0.12"/></svg>
          <h3 className="text-white text-xl font-bold mb-2">Lightning Fast</h3>
          <p className="text-gray-400 text-center">MonoSchema validates data at incredible speeds, optimized for performance.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-gray-500 text-sm z-10 border-t border-white/10">
        &copy; {new Date().getFullYear()} VoidHaus. All rights reserved.
      </footer>
    </main>
  );
}
