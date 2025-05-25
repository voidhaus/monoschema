"use client";

import Image from "next/image";

import { useState } from "react";

export default function Home() {
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#101014] text-white flex flex-col font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
      {/* Decorative Backgrounds */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-radial from-[#7c3aed55] via-[#6ee7b755] to-transparent opacity-60 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#6ee7b755] via-[#7c3aed55] to-transparent opacity-40 blur-2xl" />
      </div>

      {/* Navigation Bar */}
      <nav className="z-10 sticky top-0 w-full bg-[#101014]/80 backdrop-blur border-b border-[#232336]/60 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#4ade80] to-[#7c3aed] bg-clip-text text-transparent">Voidhaus</span>
          </div>
          <ul className="flex items-center gap-6 text-base font-medium relative">
            <li>
              <a href="#about" className="hover:text-[#4ade80] transition-colors">About</a>
            </li>
            <li className="relative" onMouseEnter={() => setProductsOpen(true)} onMouseLeave={() => setProductsOpen(false)}>
              <button className="flex items-center gap-1 hover:text-[#4ade80] transition-colors focus:outline-none">
                Products
                <svg className={`w-4 h-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {productsOpen && (
                <ul className="absolute left-0 mt-2 w-44 bg-[#181824] border border-[#232336]/60 rounded-xl shadow-lg py-2 z-20 animate-fade-in">
                  <li><a href="#product1" className="block px-4 py-2 hover:bg-gradient-to-r hover:from-[#7c3aed] hover:to-[#6ee7b7] rounded transition-colors">SaaS Platform</a></li>
                  <li><a href="#product2" className="block px-4 py-2 hover:bg-gradient-to-r hover:from-[#6ee7b7] hover:to-[#7c3aed] rounded transition-colors">API Suite</a></li>
                  <li><a href="#product3" className="block px-4 py-2 hover:bg-gradient-to-r hover:from-[#7c3aed] hover:to-[#6ee7b7] rounded transition-colors">Consulting</a></li>
                </ul>
              )}
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
          {/* Subtle Geometric SVG */}
          <svg width="700" height="320" viewBox="0 0 700 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0 w-full h-full opacity-30">
            <defs>
              <linearGradient id="geoGradient1" x1="0" y1="0" x2="700" y2="320" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" stopOpacity="0.5" />
                <stop offset="1" stopColor="#4ade80" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <polygon points="0,160 175,0 525,0 700,160 525,320 175,320" fill="url(#geoGradient1)" />
            <polyline points="0,160 700,160" stroke="#7c3aed" strokeWidth="1.5" opacity="0.15" />
            <polyline points="175,0 175,320" stroke="#4ade80" strokeWidth="1.5" opacity="0.12" />
            <polyline points="525,0 525,320" stroke="#4ade80" strokeWidth="1.5" opacity="0.12" />
            <polyline points="0,80 700,80" stroke="#7c3aed" strokeWidth="1" opacity="0.08" />
            <polyline points="0,240 700,240" stroke="#4ade80" strokeWidth="1" opacity="0.08" />
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

      {/* Features Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10">
        <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 py-16">
          <div className="relative group bg-[#181824] rounded-2xl p-8 flex flex-col items-center shadow-xl border border-[#232336]/60 overflow-hidden hover:scale-[1.03] transition-transform">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-[#7c3aed55] to-[#6ee7b755] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
            <Image src="/file.svg" alt="Custom Software" width={40} height={40} className="mb-5 dark:invert" />
            <h2 className="text-2xl font-semibold mb-2">Custom Software</h2>
            <p className="text-gray-400 text-center text-base">
              Tailored web, mobile, and cloud solutions built for your unique business needs.
            </p>
          </div>
          <div className="relative group bg-[#181824] rounded-2xl p-8 flex flex-col items-center shadow-xl border border-[#232336]/60 overflow-hidden hover:scale-[1.03] transition-transform">
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tl from-[#6ee7b755] to-[#7c3aed55] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
            <Image src="/window.svg" alt="UI/UX Design" width={40} height={40} className="mb-5 dark:invert" />
            <h2 className="text-2xl font-semibold mb-2">UI/UX Design</h2>
            <p className="text-gray-400 text-center text-base">
              Intuitive, beautiful interfaces that delight users and drive engagement.
            </p>
          </div>
          <div className="relative group bg-[#181824] rounded-2xl p-8 flex flex-col items-center shadow-xl border border-[#232336]/60 overflow-hidden hover:scale-[1.03] transition-transform">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-20 bg-gradient-to-br from-[#7c3aed33] to-[#6ee7b733] rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <Image src="/vercel.svg" alt="Cloud & DevOps" width={40} height={40} className="mb-5 dark:invert" />
            <h2 className="text-2xl font-semibold mb-2">Cloud & DevOps</h2>
            <p className="text-gray-400 text-center text-base">
              Modern infrastructure, CI/CD, and scalable deployments for fast-moving teams.
            </p>
          </div>
        </section>
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
