export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#181824] flex flex-col items-center justify-between overflow-hidden">
      {/* Animated SVG Background */}
      <svg className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-40 animate-spin-slow z-0" viewBox="0 0 600 600" fill="none">
        <circle cx="300" cy="300" r="250" stroke="#00FFC6" strokeWidth="24" fill="none" />
        <polygon points="300,80 520,520 80,520" fill="#FF00E0" fillOpacity="0.08" />
        <rect x="180" y="180" width="240" height="240" rx="48" fill="#FFD600" fillOpacity="0.07" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-30 z-0" viewBox="0 0 400 400" fill="none">
        <ellipse cx="200" cy="200" rx="180" ry="120" fill="#00B2FF" fillOpacity="0.10" />
        <rect x="260" y="260" width="80" height="80" rx="20" fill="#FF005C" fillOpacity="0.13" />
      </svg>

      {/* NAVBAR */}
      <header className="w-full z-10 flex justify-between items-center px-10 py-8 bg-transparent">
        <span className="text-3xl font-black tracking-widest text-white drop-shadow-lg">VoidHaus</span>
        <nav>
          <ul className="flex gap-10 text-gray-300 font-semibold text-lg">
            <li className="hover:text-white transition-colors cursor-pointer">Home</li>
            <li className="hover:text-white transition-colors cursor-pointer">About</li>
            <li className="hover:text-white transition-colors cursor-pointer">Projects</li>
            <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
          </ul>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center flex-1 z-10 text-center px-4 mt-12 mb-20">
        <div className="relative inline-block mb-6">
          <svg className="absolute -top-8 -left-8 w-24 h-24 opacity-80" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="40" fill="#00FFC6" fillOpacity="0.12" />
            <rect x="24" y="24" width="48" height="48" rx="12" fill="#FF00E0" fillOpacity="0.10" />
          </svg>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight drop-shadow-lg relative">MonoSchema</h1>
        </div>
        <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mb-10 font-light">
          The next-generation TypeScript schema validation library. <span className="text-[#00FFC6] font-semibold">Type-safe</span>, <span className="text-[#FFD600] font-semibold">blazing fast</span>, and <span className="text-[#FF00E0] font-semibold">extensible</span>.<br />
          Built for modern apps by <span className="text-white font-bold">VoidHaus</span>.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-[#00FFC6] to-[#00B2FF] text-gray-900 font-extrabold text-xl shadow-xl hover:scale-105 transition-transform"
        >
          <svg width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="12" fill="#fff" />
            <path d="M9 14l3 3L19 11" stroke="#00B2FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Get Started
        </a>
      </section>

      {/* FEATURES */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 py-16 z-10">
        <div className="bg-[#23213a] rounded-3xl p-10 flex flex-col items-center shadow-2xl border border-[#2e2b4a] relative overflow-hidden">
          <svg className="absolute -top-8 -right-8 w-20 h-20" viewBox="0 0 80 80" fill="none"><rect width="80" height="80" rx="20" fill="#00FFC6" fillOpacity="0.13"/></svg>
          <h3 className="text-white text-2xl font-bold mb-3">Type-Safe</h3>
          <p className="text-gray-400 text-center text-lg">End-to-end type safety for your schemas and data validation, powered by TypeScript.</p>
        </div>
        <div className="bg-[#23213a] rounded-3xl p-10 flex flex-col items-center shadow-2xl border border-[#2e2b4a] relative overflow-hidden">
          <svg className="absolute -top-8 -right-8 w-20 h-20" viewBox="0 0 80 80" fill="none"><polygon points="40,12 72,68 8,68" fill="#FFD600" fillOpacity="0.13"/></svg>
          <h3 className="text-white text-2xl font-bold mb-3">Extensible</h3>
          <p className="text-gray-400 text-center text-lg">Extend MonoSchema with custom rules, plugins, and seamless integrations.</p>
        </div>
        <div className="bg-[#23213a] rounded-3xl p-10 flex flex-col items-center shadow-2xl border border-[#2e2b4a] relative overflow-hidden">
          <svg className="absolute -top-8 -right-8 w-20 h-20" viewBox="0 0 80 80" fill="none"><ellipse cx="40" cy="40" rx="34" ry="20" fill="#FF00E0" fillOpacity="0.12"/></svg>
          <h3 className="text-white text-2xl font-bold mb-3">Lightning Fast</h3>
          <p className="text-gray-400 text-center text-lg">MonoSchema validates data at incredible speeds, optimized for performance.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full text-center py-8 text-gray-500 text-base z-10 bg-transparent">
        &copy; {new Date().getFullYear()} <span className="font-bold text-white">VoidHaus</span>. All rights reserved.
      </footer>
    </main>
  );
}
