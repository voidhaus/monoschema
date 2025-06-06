import GradientText from "@/components/GradientText";
// import { client } from "@/providers/rpc";
// import { headers } from "next/headers";

export default async function DocsPage() {
  // Temporary commented out code for fetching content
  // const headersList = await headers();
  // const contentPath = headersList.get('x-url') || "/";
  // const _content = await client.content.getContentByKey({
  //   key: contentPath,
  //   resolveChildren: true,
  // })
  // TODO: Translate returned content into a React component tree

  return (
    <div className="relative min-h-screen text-white">
      {/* Background similar to other pages */}
      <div className="pointer-events-none absolute z-0 left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-br from-[#00e5ff22] via-[#7C3AED22] to-[#23233600] blur-2xl opacity-60 animate-pulse" />
      
      <div className="relative z-10 max-w-4xl">
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            <GradientText>Documentation</GradientText>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl">
            Comprehensive guides and API references for our Node.js libraries. 
            Build powerful, type-safe applications with our modern toolchain.
          </p>
        </section>

        {/* Library Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* MonoSchema Card */}
          <div className="group relative bg-[#181824]/90 rounded-2xl p-8 border border-[#232336]/60 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-16 bg-gradient-to-br from-[#00e5ff44] to-[#7C3AED44] rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">
                <GradientText>MonoSchema</GradientText>
              </h3>
              <p className="text-gray-400 mb-6">
                Type-safe schema validation and transformation library for TypeScript applications.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] rounded-full text-sm">Validation</span>
                <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded-full text-sm">Type-Safe</span>
                <span className="px-3 py-1 bg-[#F59E42]/20 text-[#F59E42] rounded-full text-sm">Fast</span>
              </div>
              <div className="flex gap-3">
                <a href="/docs/monoschema" className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] to-[#7C3AED] text-white rounded-lg font-medium hover:opacity-90 transition">
                  Get Started
                </a>
                <a href="/docs/monoschema/api" className="px-4 py-2 border border-[#232336] text-gray-300 rounded-lg font-medium hover:border-[#00e5ff]/50 transition">
                  API Reference
                </a>
              </div>
            </div>
          </div>

          {/* RPC Card */}
          <div className="group relative bg-[#181824]/90 rounded-2xl p-8 border border-[#232336]/60 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-16 bg-gradient-to-br from-[#7C3AED44] to-[#F59E4244] rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">
                <GradientText>RPC</GradientText>
              </h3>
              <p className="text-gray-400 mb-6">
                Modern, lightweight RPC framework for building distributed Node.js applications.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded-full text-sm">Distributed</span>
                <span className="px-3 py-1 bg-[#F59E42]/20 text-[#F59E42] rounded-full text-sm">Lightweight</span>
                <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] rounded-full text-sm">Modern</span>
              </div>
              <div className="flex gap-3">
                <a href="/docs/rpc" className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#F59E42] text-white rounded-lg font-medium hover:opacity-90 transition">
                  Get Started
                </a>
                <a href="/docs/rpc/api" className="px-4 py-2 border border-[#232336] text-gray-300 rounded-lg font-medium hover:border-[#7C3AED]/50 transition">
                  API Reference
                </a>
              </div>
            </div>
          </div>

          {/* MonoSchema Plugins */}
          <div className="group relative bg-[#181824]/90 rounded-2xl p-8 border border-[#232336]/60 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-16 bg-gradient-to-br from-[#F59E4244] to-[#00e5ff44] rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">
                <GradientText>MonoSchema Plugins</GradientText>
              </h3>
              <p className="text-gray-400 mb-6">
                Extend MonoSchema with MongoDB integration, transformers, and more.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[#F59E42]/20 text-[#F59E42] rounded-full text-sm">MongoDB</span>
                <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] rounded-full text-sm">Transformers</span>
              </div>
              <div className="flex gap-3">
                <a href="/docs/monoschema/plugins" className="px-4 py-2 bg-gradient-to-r from-[#F59E42] to-[#00e5ff] text-white rounded-lg font-medium hover:opacity-90 transition">
                  Explore Plugins
                </a>
              </div>
            </div>
          </div>

          {/* Examples & Guides */}
          <div className="group relative bg-[#181824]/90 rounded-2xl p-8 border border-[#232336]/60 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-16 bg-gradient-to-br from-[#00e5ff44] via-[#7C3AED44] to-[#F59E4244] rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">
                <GradientText>Examples & Guides</GradientText>
              </h3>
              <p className="text-gray-400 mb-6">
                Real-world examples, tutorials, and best practices for building with our libraries.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] rounded-full text-sm">Tutorials</span>
                <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded-full text-sm">Examples</span>
                <span className="px-3 py-1 bg-[#F59E42]/20 text-[#F59E42] rounded-full text-sm">Best Practices</span>
              </div>
              <div className="flex gap-3">
                <a href="/docs/examples" className="px-4 py-2 bg-gradient-to-r from-[#00e5ff] via-[#7C3AED] to-[#F59E42] text-white rounded-lg font-medium hover:opacity-90 transition">
                  View Examples
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-[#181824]/50 rounded-2xl p-8 border border-[#232336]/60">
          <h2 className="text-2xl font-bold mb-6">
            <GradientText>Quick Links</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#00e5ff]">Getting Started</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/docs/installation" className="hover:text-white transition">Installation</a></li>
                <li><a href="/docs/quick-start" className="hover:text-white transition">Quick Start</a></li>
                <li><a href="/docs/concepts" className="hover:text-white transition">Core Concepts</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#7C3AED]">API Reference</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/docs/api/monoschema" className="hover:text-white transition">MonoSchema API</a></li>
                <li><a href="/docs/api/rpc" className="hover:text-white transition">RPC API</a></li>
                <li><a href="/docs/api/types" className="hover:text-white transition">Type Definitions</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#F59E42]">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://github.com/voidhaus" className="hover:text-white transition">GitHub</a></li>
                <li><a href="/docs/contributing" className="hover:text-white transition">Contributing</a></li>
                <li><a href="/docs/changelog" className="hover:text-white transition">Changelog</a></li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}