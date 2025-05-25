"use client";

import Image from "next/image";


export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#101014] text-white flex flex-col font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
      {/* Decorative Backgrounds */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-radial from-[#7c3aed55] via-[#6ee7b755] to-transparent opacity-60 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#6ee7b755] via-[#7c3aed55] to-transparent opacity-40 blur-2xl" />
      </div>

      {/* Navigation Bar */}
      <nav className="z-50 sticky top-0 w-full bg-[#101014]/40 backdrop-blur border-b border-[#232336]/60 shadow-sm bg-opacity-60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#4ade80] to-[#7c3aed] bg-clip-text text-transparent">Voidhaus</span>
          </div>
          <ul className="flex items-center gap-6 text-base font-medium relative">
            <li>
              <a href="#about" className="hover:text-[#4ade80] transition-colors">About</a>
            </li>
            <li className="relative group z-20">
              <button
                className="flex items-center gap-1 hover:text-[#4ade80] transition-colors focus:outline-none"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Products
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <ul className="absolute left-0 top-full w-44 bg-[#181824] border border-[#232336]/60 rounded-xl shadow-lg py-2 z-50 hidden group-hover:block animate-fade-in">
                <li><a href="#product1" className="block px-4 py-2 hover:bg-gradient-to-r hover:from-[#7c3aed] hover:to-[#6ee7b7] rounded transition-colors">SaaS Platform</a></li>
                <li><a href="#product2" className="block px-4 py-2 hover:bg-gradient-to-r hover:from-[#6ee7b7] hover:to-[#7c3aed] rounded transition-colors">API Suite</a></li>
                <li><a href="#product3" className="block px-4 py-2 hover:bg-gradient-to-r hover:from-[#7c3aed] hover:to-[#6ee7b7] rounded transition-colors">Consulting</a></li>
              </ul>
            </li>
            <li>
              <a href="#contact" className="hover:text-[#4ade80] transition-colors">Contact Us</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative flex flex-col items-center justify-center py-28 px-4 sm:px-0 z-10 overflow-visible">
        {/* Layered Animated Glows */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[320px] -z-10">
          {/* Subtle Geometric SVG Polygon (centered) */}
          <svg width="700" height="320" viewBox="0 0 700 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0 w-full h-full opacity-30">
            <defs>
              <linearGradient id="geoGradient1" x1="0" y1="0" x2="700" y2="320" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" stopOpacity="0.5" />
                <stop offset="1" stopColor="#4ade80" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <polygon points="0,160 175,0 525,0 700,160 525,320 175,320" fill="url(#geoGradient1)" />
          </svg>
          {/* Full-width grid lines with fade-out */}
          <svg width="100%" height="320" viewBox="0 0 1000 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-screen h-full opacity-40 z-0">
            <defs>
              <linearGradient id="fadeH" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" stopOpacity="0" />
                <stop offset="0.15" stopColor="#7c3aed" stopOpacity="0.15" />
                <stop offset="0.5" stopColor="#7c3aed" stopOpacity="0.18" />
                <stop offset="0.85" stopColor="#4ade80" stopOpacity="0.15" />
                <stop offset="1" stopColor="#4ade80" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fadeV" x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4ade80" stopOpacity="0" />
                <stop offset="0.15" stopColor="#4ade80" stopOpacity="0.12" />
                <stop offset="0.5" stopColor="#4ade80" stopOpacity="0.15" />
                <stop offset="0.85" stopColor="#7c3aed" stopOpacity="0.12" />
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Horizontal lines */}
            <line x1="0" y1="80" x2="1000" y2="80" stroke="url(#fadeH)" strokeWidth="1.5" />
            <line x1="0" y1="160" x2="1000" y2="160" stroke="url(#fadeH)" strokeWidth="2" />
            <line x1="0" y1="240" x2="1000" y2="240" stroke="url(#fadeH)" strokeWidth="1.5" />
            {/* Vertical lines */}
            <line x1="175" y1="0" x2="175" y2="320" stroke="url(#fadeV)" strokeWidth="1.2" />
            <line x1="525" y1="0" x2="525" y2="320" stroke="url(#fadeV)" strokeWidth="1.2" />
          </svg>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-r from-[#7c3aed99] via-[#6ee7b799] to-transparent opacity-70 blur-2xl animate-pulse-slow" />
          <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[400px] h-[120px] bg-gradient-to-r from-[#4ade8099] via-transparent to-[#7c3aed99] opacity-60 blur-2xl animate-pulse" />
          <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[300px] h-[80px] bg-gradient-to-r from-[#7c3aed88] via-[#4ade8088] to-transparent opacity-50 blur-2xl animate-pulse-fast" />
        </div>
        {/* Animated Floating Orbs */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
          <div className="absolute animate-float-slow left-[20%] top-[30%] w-24 h-24 bg-gradient-radial from-[#7c3aed88] to-transparent rounded-full blur-2xl opacity-60" />
          <div className="absolute animate-float-fast right-[18%] top-[40%] w-16 h-16 bg-gradient-radial from-[#4ade8088] to-transparent rounded-full blur-2xl opacity-50" />
          <div className="absolute animate-float-mid left-[60%] top-[60%] w-20 h-20 bg-gradient-radial from-[#6ee7b788] to-transparent rounded-full blur-2xl opacity-40" />
        </div>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#4ade80] to-[#7c3aed] bg-clip-text text-transparent drop-shadow-lg text-center">
            Building Tomorrow&apos;s Software
          </h1>
          <p className="max-w-2xl text-center text-xl sm:text-2xl text-gray-300 mb-2">
            We craft scalable, robust, and beautiful digital solutions for ambitious teams and startups.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              href="#contact"
              className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6ee7b7] px-8 py-3 text-base font-semibold text-white shadow-lg hover:from-[#6ee7b7] hover:to-[#7c3aed] transition-colors"
            >
              Get in touch
            </a>
            <a
              href="#about"
              className="rounded-full border border-[#7c3aed] px-8 py-3 text-base font-semibold text-[#4ade80] bg-[#181824]/60 hover:bg-gradient-to-r hover:from-[#7c3aed] hover:to-[#6ee7b7] transition-colors"
            >
              Learn more
            </a>
          </div>
        </div>
        {/* Custom Animations */}
        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-24px); }
          }
          @keyframes float-fast {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-40px); }
          }
          @keyframes float-mid {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-32px); }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          @keyframes pulse-fast {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
          }
          .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
          .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
          .animate-float-mid { animation: float-mid 5.5s ease-in-out infinite; }
          .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
          .animate-pulse-fast { animation: pulse-fast 2.5s ease-in-out infinite; }
        `}</style>
      </header>

      {/* SVG Diagonal Divider */}
      <div className="relative w-full -mt-8 z-[5]">
        <svg viewBox="0 0 1440 90" width="100%" height="90" className="block w-full h-[90px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dividerGradient" x1="0" y1="0" x2="1440" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c3aed" stopOpacity="0.12" />
              <stop offset="0.5" stopColor="#4ade80" stopOpacity="0.18" />
              <stop offset="1" stopColor="#101014" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points="0,0 1440,0 1440,90" fill="url(#dividerGradient)" />
        </svg>
      </div>

      {/* Features Section */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 z-10">
        {/* Animated/Geometric Backgrounds */}
        <div className="pointer-events-none absolute inset-0 w-full h-full -z-10">
          {/* SVG mesh grid with parallax */}
          <svg width="100%" height="100%" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-full opacity-25 animate-parallax-mesh">
            <defs>
              <linearGradient id="featureGridH" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" stopOpacity="0" />
                <stop offset="0.2" stopColor="#7c3aed" stopOpacity="0.10" />
                <stop offset="0.5" stopColor="#4ade80" stopOpacity="0.13" />
                <stop offset="0.8" stopColor="#4ade80" stopOpacity="0.10" />
                <stop offset="1" stopColor="#4ade80" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="featureGridV" x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4ade80" stopOpacity="0" />
                <stop offset="0.2" stopColor="#4ade80" stopOpacity="0.08" />
                <stop offset="0.5" stopColor="#7c3aed" stopOpacity="0.10" />
                <stop offset="0.8" stopColor="#7c3aed" stopOpacity="0.08" />
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Horizontal lines */}
            <line x1="0" y1="120" x2="1440" y2="120" stroke="url(#featureGridH)" strokeWidth="1.2" />
            <line x1="0" y1="240" x2="1440" y2="240" stroke="url(#featureGridH)" strokeWidth="1.2" />
            <line x1="0" y1="360" x2="1440" y2="360" stroke="url(#featureGridH)" strokeWidth="1.2" />
            <line x1="0" y1="480" x2="1440" y2="480" stroke="url(#featureGridH)" strokeWidth="1.2" />
            {/* Vertical lines */}
            <line x1="480" y1="0" x2="480" y2="600" stroke="url(#featureGridV)" strokeWidth="1.2" />
            <line x1="960" y1="0" x2="960" y2="600" stroke="url(#featureGridV)" strokeWidth="1.2" />
            {/* Geometric accent polygon */}
            <polygon points="200,100 1240,80 1100,500 340,520" fill="#7c3aed0d" stroke="#4ade8033" strokeWidth="2" className="animate-float-mid" />
          </svg>
          {/* Animated blur glows */}
          <div className="absolute left-[10%] top-[20%] w-72 h-72 bg-gradient-radial from-[#7c3aed55] to-transparent rounded-full blur-3xl animate-float-slow opacity-40" />
          <div className="absolute right-[12%] top-[40%] w-60 h-60 bg-gradient-radial from-[#4ade8055] to-transparent rounded-full blur-2xl animate-float-mid opacity-30" />
          {/* Accent lines */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[60vw] h-0.5 bg-gradient-to-r from-transparent via-[#7c3aed55] to-transparent opacity-60" style={{top: '8%'}} />
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[50vw] h-0.5 bg-gradient-to-r from-transparent via-[#4ade8055] to-transparent opacity-50" style={{bottom: '10%'}} />
          {/* Floating accent orb */}
          <div className="absolute left-[45%] top-[60%] w-24 h-24 bg-gradient-radial from-[#7c3aed44] to-transparent rounded-full blur-2xl animate-float-fast opacity-30" />
        </div>

        {/* Section Heading with Geometric Accent */}
        <div className="relative flex flex-col items-center mb-12">
          <span className="block mb-2 text-sm uppercase tracking-widest text-[#4ade80] font-semibold">Our Capabilities</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-[#7c3aed] via-[#4ade80] to-[#7c3aed] bg-clip-text text-transparent drop-shadow-lg">
            Features & Expertise
          </h2>
          {/* Animated geometric underline */}
          <svg width="120" height="16" viewBox="0 0 120 16" fill="none" className="mt-2 animate-underline-wiggle">
            <polyline points="10,12 40,4 80,14 110,6" stroke="#4ade80" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <section className="relative w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 py-20">
          {/* Feature Card 1 */}
            <div className="feature-card group relative bg-[#181824]/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-[#232336]/60 overflow-visible hover:scale-[1.07] transition-none animate-fade-in-up delay-[100ms]">
            {/* Animated orb */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-[#7c3aed77] to-[#6ee7b777] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-none animate-float-fast" />
            {/* Animated accent line */}
            <svg width="60" height="12" viewBox="0 0 60 12" fill="none" className="absolute left-1/2 -bottom-4 -translate-x-1/2 animate-underline-wiggle">
              <polyline points="5,10 20,2 40,10 55,4" stroke="#7c3aed" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Animated shadow */}
            <div className="absolute left-1/2 bottom-2 -translate-x-1/2 w-24 h-6 bg-gradient-radial from-[#7c3aed33] to-transparent rounded-full blur-xl opacity-40 animate-pulse-slow" />
            <Image src="/file.svg" alt="Custom Software" width={44} height={44} className="mb-5 dark:invert drop-shadow-[0_2px_8px_rgba(124,58,237,0.25)]" />
            <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[#7c3aed] to-[#4ade80] bg-clip-text text-transparent">Custom Software</h2>
            <p className="text-gray-400 text-center text-base">
              Tailored web, mobile, and cloud solutions built for your unique business needs.
            </p>
          </div>
          {/* Feature Card 2 */}
            <div className="feature-card group relative bg-[#181824]/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-[#232336]/60 overflow-visible hover:scale-[1.07] transition-none animate-fade-in-up delay-[300ms]">
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-tl from-[#6ee7b777] to-[#7c3aed77] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-none animate-float-mid" />
            {/* Animated accent polygon */}
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none" className="absolute right-6 -top-6 animate-float-mid">
              <polygon points="16,2 30,10 16,18 2,10" fill="#4ade8033" stroke="#7c3aed" strokeWidth="1.5" />
            </svg>
            {/* Animated shadow */}
            <div className="absolute left-1/2 bottom-2 -translate-x-1/2 w-24 h-6 bg-gradient-radial from-[#4ade8033] to-transparent rounded-full blur-xl opacity-40 animate-pulse-slow" />
            <Image src="/window.svg" alt="UI/UX Design" width={44} height={44} className="mb-5 dark:invert drop-shadow-[0_2px_8px_rgba(110,231,183,0.22)]" />
            <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[#4ade80] to-[#7c3aed] bg-clip-text text-transparent">UI/UX Design</h2>
            <p className="text-gray-400 text-center text-base">
              Intuitive, beautiful interfaces that delight users and drive engagement.
            </p>
          </div>
          {/* Feature Card 3 */}
            <div className="feature-card group relative bg-[#181824]/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-[#232336]/60 overflow-visible hover:scale-[1.07] transition-none animate-fade-in-up delay-[500ms]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-16 bg-gradient-to-br from-[#7c3aed44] to-[#4ade8044] rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-none animate-float-slow" />
            {/* Animated accent line */}
            <svg width="48" height="12" viewBox="0 0 48 12" fill="none" className="absolute left-1/2 -bottom-4 -translate-x-1/2 animate-underline-wiggle">
              <polyline points="4,10 16,2 32,10 44,4" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Animated shadow */}
            <div className="absolute left-1/2 bottom-2 -translate-x-1/2 w-24 h-6 bg-gradient-radial from-[#4ade8033] to-transparent rounded-full blur-xl opacity-40 animate-pulse-slow" />
            <Image src="/vercel.svg" alt="Cloud & DevOps" width={44} height={44} className="mb-5 dark:invert drop-shadow-[0_2px_8px_rgba(76,222,128,0.18)]" />
            <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[#7c3aed] via-[#4ade80] to-[#7c3aed] bg-clip-text text-transparent">Cloud & DevOps</h2>
            <p className="text-gray-400 text-center text-base">
              Modern infrastructure, CI/CD, and scalable deployments for fast-moving teams.
            </p>
          </div>
        </section>
        {/* Custom Animations for Features */}
        <style jsx>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .delay-\[100ms\] { animation-delay: 0.1s; }
          .delay-\[300ms\] { animation-delay: 0.3s; }
          .delay-\[500ms\] { animation-delay: 0.5s; }
          @keyframes underline-wiggle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px) scaleX(1.04); }
          }
          .animate-underline-wiggle {
            animation: underline-wiggle 2.2s cubic-bezier(0.65,0,0.35,1) infinite;
          }
          @keyframes parallax-mesh {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(18px); }
          }
          .animate-parallax-mesh {
            animation: parallax-mesh 12s ease-in-out infinite;
          }
        `}</style>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 flex flex-col items-center border-t border-[#232336]/60 bg-[#101014] z-10">
        <div className="flex gap-8 mb-3">
          <a
            href="https://github.com/voidhaus"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-[#4ade80] transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:hello@voidhaus.com"
            className="hover:underline hover:text-[#4ade80] transition-colors"
          >
            Contact
          </a>
        </div>
        <span className="text-xs text-gray-500">© {new Date().getFullYear()} Voidhaus. All rights reserved.</span>
      </footer>
    </div>
  );
}
