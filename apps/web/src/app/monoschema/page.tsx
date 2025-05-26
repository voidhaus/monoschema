"use client";// Simple glowing gradient divider between sections

function SectionDivider() {
  return (
    <div className="relative flex justify-center items-center">
      <svg
        width="120"
        height="60"
        viewBox="0 0 120 60"
        fill="none"
        className="animate-pulse-slow"
        style={{ filter: 'drop-shadow(0 0 24px #00E5FF88) drop-shadow(0 0 48px #7C3AED44)' }}
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
          cx="60" cy="30" r="8"
          fill="#00E5FF"
          opacity="0.25"
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
    </div>
  );
}


import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CodeWindow from "@/components/CodeWindow";
import ResponsiveGridBackground from "@/components/ResponsiveGridBackground";
import GridAnimatedDots from "@/components/GridAnimatedDots";
import GradientText from "@/components/GradientText";

export default function MonoSchemaFeaturesPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#181825] flex flex-col overflow-hidden">
      {/* Subtle animated grid background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ResponsiveGridBackground />
        <GridAnimatedDots dotSize={2} />
      </div>
      <Header />

      {/* --- DYNAMIC, LAYERED, INTERESTING BACKGROUND --- */}
      {/* Animated radial gradient glow behind hero */}
      <div className="pointer-events-none absolute z-0 left-1/2 top-40 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-br from-[#fff2] via-[#00e5ff22] to-[#23233600] blur-3xl opacity-40 animate-pulse" />
      {/* Large blurred ellipse top left */}
      <div className="absolute top-[-120px] left-[-160px] w-[420px] h-[260px] bg-gradient-to-br from-[#232336] to-[#44454a] rounded-full blur-3xl opacity-30 rotate-[-18deg]" />
      {/* Animated spinning polygon top right */}
      <svg className="absolute top-[-60px] right-[-60px] w-[180px] h-[180px] opacity-20 blur animate-spin-slow" style={{animationDuration:'18s'}} viewBox="0 0 100 100" fill="none"><polygon points="50,10 90,40 75,90 25,90 10,40" stroke="#7c7c8a" strokeWidth="8" fill="none" /></svg>
      {/* Large blurred circle bottom right */}
      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-gradient-to-tr from-[#232336] to-[#393a40] rounded-full blur-2xl opacity-30" />
      {/* Animated pulsing ring center left */}
      <svg className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] opacity-20 animate-pulse" style={{animationDuration:'4s'}} viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="50" stroke="#7c7c8a" strokeWidth="10" fill="none" /></svg>
      {/* Subtle polygon bottom left */}
      <svg className="absolute bottom-10 left-[-40px] w-[100px] h-[80px] opacity-10" viewBox="0 0 100 80" fill="none"><polygon points="10,70 50,10 90,70" stroke="#44454a" strokeWidth="8" fill="none" /></svg>
      {/* Thin diagonal line mid right */}
      <svg className="absolute top-1/3 right-0 w-[180px] h-[40px] opacity-10" viewBox="0 0 180 40" fill="none"><line x1="10" y1="30" x2="170" y2="10" stroke="#393a40" strokeWidth="6" strokeLinecap="round" /></svg>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-[#00e5ff33] via-[#7C3AED22] to-[#23233600] rounded-full blur-2xl opacity-60 animate-pulse" />
        <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-6 tracking-tight">
          <GradientText>MonoSchema</GradientText> Features
        </h1>
        <p className="text-lg md:text-2xl text-gray-300 font-light mb-10 max-w-2xl">
          A blazing-fast, type-safe schema library for TypeScript. Effortless validation, transformation, and more—built for modern monorepos.
        </p>
      </section>

      {/* Feature 1 */}
      <section className="relative flex flex-col md:flex-row items-center justify-center min-h-screen px-6 py-24 overflow-hidden">
        {/* Feature-specific background */}
        <div className="pointer-events-none absolute z-0 left-1/3 top-1/4 w-[400px] h-[300px] rounded-full bg-gradient-to-br from-[#00e5ff33] to-[#23233600] blur-2xl opacity-60 animate-pulse" />
        <div className="flex-1 flex flex-col items-center md:items-end md:pr-16 z-10">
          <h2 className="text-5xl font-extrabold text-white mb-4 text-center md:text-right drop-shadow-lg">Type-safe Validation</h2>
          <p className="text-[#00E5FF] text-xl font-semibold mb-4 tracking-wide">No more runtime surprises.</p>
          <p className="text-gray-300 font-light mb-8 text-center md:text-right max-w-md text-xl">Validate your data with full TypeScript type inference and zero runtime overhead.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-start w-full z-10">
          <CodeWindow>{String.raw`
import { schema, validate } from 'monoschema';

const User = schema({
  id: 'number',
  name: 'string',
  email: 'string?'
});

type User = typeof User.type;

const result = validate(User, { id: 1, name: 'Tom' });
// result.valid === true
`}</CodeWindow>
        </div>
      </section>

      <SectionDivider />
      {/* Feature 2 */}
      <section className="relative flex flex-col md:flex-row-reverse items-center justify-center min-h-screen px-6 py-24 overflow-hidden">
        <div className="pointer-events-none absolute z-0 right-1/3 top-1/4 w-[400px] h-[300px] rounded-full bg-gradient-to-br from-[#7C3AED33] to-[#23233600] blur-2xl opacity-60 animate-pulse" />
        <div className="flex-1 flex flex-col items-center md:items-start md:pl-16 z-10">
          <h2 className="text-5xl font-extrabold text-white mb-4 text-center md:text-left drop-shadow-lg">Powerful Transformations</h2>
          <p className="text-[#7C3AED] text-xl font-semibold mb-4 tracking-wide">Shape your data, your way.</p>
          <p className="text-gray-300 font-light mb-8 text-center md:text-left max-w-md text-xl">Transform and sanitize data as you validate, with built-in and custom transformers.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-end w-full z-10">
          <CodeWindow>{String.raw`
import { schema, transform } from 'monoschema';

const User = schema({
  id: 'number',
  name: 'string',
  email: 'string?'
}).transform({
  name: (n) => n.trim()
});

const user = transform(User, { id: 1, name: '  Tom  ' });
// user.name === 'Tom'
`}</CodeWindow>
        </div>
      </section>

      <SectionDivider />
      {/* Feature 3 */}
      <section className="relative flex flex-col md:flex-row items-center justify-center min-h-screen px-6 py-24 overflow-hidden">
        <div className="pointer-events-none absolute z-0 left-1/3 bottom-1/4 w-[400px] h-[300px] rounded-full bg-gradient-to-br from-[#00e5ff33] to-[#23233600] blur-2xl opacity-60 animate-pulse" />
        <div className="flex-1 flex flex-col items-center md:items-end md:pr-16 z-10">
          <h2 className="text-5xl font-extrabold text-white mb-4 text-center md:text-right drop-shadow-lg">Composable Schemas</h2>
          <p className="text-[#00E5FF] text-xl font-semibold mb-4 tracking-wide">Build complex types, simply.</p>
          <p className="text-gray-300 font-light mb-8 text-center md:text-right max-w-md text-xl">Compose schemas for complex data structures and reuse them across your codebase.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-start w-full z-10">
          <CodeWindow>{String.raw`
import { schema } from 'monoschema';

const Address = schema({
  street: 'string',
  city: 'string',
});

const User = schema({
  id: 'number',
  address: Address,
});
`}</CodeWindow>
        </div>
      </section>

      <SectionDivider />
      {/* Feature 4 */}
      <section className="relative flex flex-col md:flex-row-reverse items-center justify-center min-h-screen px-6 py-24 overflow-hidden">
        <div className="pointer-events-none absolute z-0 right-1/3 bottom-1/4 w-[400px] h-[300px] rounded-full bg-gradient-to-br from-[#7C3AED33] to-[#23233600] blur-2xl opacity-60 animate-pulse" />
        <div className="flex-1 flex flex-col items-center md:items-start md:pl-16 z-10">
          <h2 className="text-5xl font-extrabold text-white mb-4 text-center md:text-left drop-shadow-lg">Monorepo Ready</h2>
          <p className="text-[#F59E42] text-xl font-semibold mb-4 tracking-wide">One source of truth, everywhere.</p>
          <p className="text-gray-300 font-light mb-8 text-center md:text-left max-w-md text-xl">Share schemas and types across packages for a single source of truth in your monorepo.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-end w-full z-10">
          <CodeWindow>{String.raw`
// packages/shared/schemas.ts
import { schema } from 'monoschema';

export const User = schema({
  id: 'number',
  name: 'string',
});

// packages/api/handlers.ts
import { User } from 'shared/schemas';

// Use User schema for validation in your API
`}</CodeWindow>
        </div>
      </section>

      <Footer />
    </main>
  );
}