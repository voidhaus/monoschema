"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GradientDivider from "@/components/GradientDivider";
import GradientText from "@/components/GradientText";
import CodeWindow from "@/components/CodeWindow";
import Card from "@/components/card";
import ResponsiveGridBackground from "@/components/ResponsiveGridBackground";
import GridAnimatedDots from "@/components/GridAnimatedDots";

export default function GettingStartedPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#181825] flex flex-col text-white overflow-hidden">
      {/* Subtle animated grid background and dots, always behind content */}
      {/* Locally boost grid visibility for this page only */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ResponsiveGridBackground />
        <GridAnimatedDots dotSize={2} />
      </div>
      <Header />
      {/* --- DYNAMIC, LAYERED, INTERESTING BACKGROUND GLOWS --- */}
      {/* Animated radial gradient glow behind hero */}
      <div className="pointer-events-none absolute z-0 left-1/2 top-40 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-br from-[#fff2] via-[#00e5ff22] to-[#23233600] blur-3xl opacity-40 animate-pulse" />
      {/* Large blurred ellipse top left */}
      <div className="pointer-events-none absolute z-0 top-[-120px] left-[-160px] w-[420px] h-[260px] bg-gradient-to-br from-[#232336] to-[#44454a] rounded-full blur-3xl opacity-30 rotate-[-18deg]" />
      {/* Animated spinning polygon top right */}
      <svg className="pointer-events-none absolute z-0 top-[-60px] right-[-60px] w-[180px] h-[180px] opacity-20 blur animate-spin-slow" style={{animationDuration:'18s'}} viewBox="0 0 100 100" fill="none"><polygon points="50,10 90,40 75,90 25,90 10,40" stroke="#7c7c8a" strokeWidth="8" fill="none" /></svg>
      {/* Large blurred circle bottom right */}
      <div className="pointer-events-none absolute z-0 bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-gradient-to-tr from-[#232336] to-[#393a40] rounded-full blur-2xl opacity-30" />
      {/* Animated pulsing ring center left */}
      <svg className="pointer-events-none absolute z-0 left-[-60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] opacity-20 animate-pulse" style={{animationDuration:'4s'}} viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="50" stroke="#7c7c8a" strokeWidth="10" fill="none" /></svg>
      {/* Subtle polygon bottom left */}
      <svg className="pointer-events-none absolute z-0 bottom-10 left-[-40px] w-[100px] h-[80px] opacity-10" viewBox="0 0 100 80" fill="none"><polygon points="10,70 50,10 90,70" stroke="#44454a" strokeWidth="8" fill="none" /></svg>
      {/* Thin diagonal line mid right */}
      <svg className="pointer-events-none absolute z-0 top-1/3 right-0 w-[180px] h-[40px] opacity-10" viewBox="0 0 180 40" fill="none"><line x1="10" y1="30" x2="170" y2="10" stroke="#393a40" strokeWidth="6" strokeLinecap="round" /></svg>
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pb-24 pt-12 md:pt-20">
        <section className="max-w-3xl w-full text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Getting Started with&nbsp;
            <GradientText>
              MonoSchema
            </GradientText>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-6">
            The creative, type-safe, and extensible schema library for
            TypeScript. Build, validate, and transform data with style.
          </p>
        </section>
        {/* No direct GridAnimatedDots here; handled in background above */}
        <section className="w-full max-w-4xl mb-16">
          <Card disablehover className="mb-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Install MonoSchema</h2>
            <p className="mb-4 text-gray-400">
              Add MonoSchema to your project with your favorite package manager:
            </p>
            <CodeWindow>
              {`pnpm add @voidhaus/monoschema
# or
yarn add @voidhaus/monoschema
# or
npm install @voidhaus/monoschema`}
            </CodeWindow>
          </Card>
          <div className="my-8"><GradientDivider /></div>
          <Card disablehover className="mb-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Your First Schema</h2>
            <p className="mb-4 text-gray-400">
              Define a type-safe schema in seconds:
            </p>
            <CodeWindow>
{`import { schema, string, number } from '@voidhaus/monoschema';

const User = schema({
  username: string().min(3).max(32),
  age: number().int().min(0),
});

// TypeScript type inference
// type User = Infer<typeof User>`}
</CodeWindow>
          </Card>
          <div className="my-8"><GradientDivider /></div>
          <Card disablehover className="mb-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Validation</h2>
            <p className="mb-4 text-gray-400">
              Validate data with expressive error reporting:
            </p>
            <CodeWindow>
{`const result = User.validate({ username: 'alice', age: 42 });

if (result.ok) {
  // result.value is typed!
} else {
  console.error(result.error);
}`}
</CodeWindow>
          </Card>
          <div className="my-8"><GradientDivider /></div>
          <Card disablehover className="mb-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Ecosystem & Plugins</h2>
            <p className="mb-4 text-gray-400">
              Supercharge MonoSchema with official plugins and framework
              integrations:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Card disablehover className="bg-[#23234b] border border-[#35357a]">
                <h3 className="font-semibold text-lg mb-1">MonoSchema-Mongo</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Seamless MongoDB schema mapping and query validation.
                </p>
                <CodeWindow>
{`import { mongoPlugin } from '@voidhaus/monoschema-mongo';
User.plugin(mongoPlugin());`}
</CodeWindow>
              </Card>
              <Card disablehover className="bg-[#23234b] border border-[#35357a]">
                <h3 className="font-semibold text-lg mb-1">
                  MonoSchema-Transformer
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  Transform and sanitize data with powerful pipelines.
                </p>
                <CodeWindow>
{`import { transformerPlugin } from '@voidhaus/monoschema-transformer';
User.plugin(transformerPlugin());`}
</CodeWindow>
              </Card>
              <Card disablehover className="bg-[#23234b] border border-[#35357a]">
                <h3 className="font-semibold text-lg mb-1">MonoSchema-RPC</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Type-safe RPC for your API endpoints and microservices.
                </p>
                <CodeWindow>
{`import { createRpc } from '@voidhaus/rpc';
const rpc = createRpc({ schemas: { User } });`}
</CodeWindow>
              </Card>
            </div>
          </Card>
          <div className="my-8"><GradientDivider /></div>
          <Card disablehover className="mb-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Ready to Dive Deeper?</h2>
            <p className="mb-4 text-gray-400">
              Explore the full MonoSchema documentation for advanced features,
              guides, and API reference.
            </p>
            <a
              href="https://monoschema.voidhaus.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            >
              View Full Documentation
            </a>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
