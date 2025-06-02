

import GradientText from "./GradientText";

export function Leftbar({ pathname }: { pathname: string }) {
  const navigationItems = [
    {
      section: "Getting Started",
      items: [
        { title: "Introduction", href: "/docs" },
        { title: "Installation", href: "/docs/installation" },
        { title: "Quick Start", href: "/docs/quick-start" },
        { title: "Core Concepts", href: "/docs/concepts" },
      ]
    },
    {
      section: "MonoSchema",
      items: [
        { title: "Overview", href: "/docs/monoschema" },
        { title: "Schema Definition", href: "/docs/monoschema/schema" },
        { title: "Validation", href: "/docs/monoschema/validation" },
        { title: "Transformations", href: "/docs/monoschema/transformations" },
        { title: "Type Inference", href: "/docs/monoschema/types" },
      ]
    },
    {
      section: "RPC",
      items: [
        { title: "Overview", href: "/docs/rpc" },
        { title: "Server Setup", href: "/docs/rpc/server" },
        { title: "Client Usage", href: "/docs/rpc/client" },
        { title: "Middleware", href: "/docs/rpc/middleware" },
        { title: "Error Handling", href: "/docs/rpc/errors" },
      ]
    },
    {
      section: "Plugins",
      items: [
        { title: "MonoSchema MongoDB", href: "/docs/plugins/mongo" },
        { title: "MonoSchema Transformer", href: "/docs/plugins/transformer" },
        { title: "RPC Hyper Express", href: "/docs/plugins/hyper-express" },
      ]
    },
    {
      section: "Examples",
      items: [
        { title: "Basic Usage", href: "/docs/examples/basic" },
        { title: "Full Stack App", href: "/docs/examples/fullstack" },
        { title: "Microservices", href: "/docs/examples/microservices" },
        { title: "Database Integration", href: "/docs/examples/database" },
      ]
    },
    {
      section: "API Reference",
      items: [
        { title: "MonoSchema API", href: "/docs/api/monoschema" },
        { title: "RPC API", href: "/docs/api/rpc" },
        { title: "Plugin APIs", href: "/docs/api/plugins" },
        { title: "Type Definitions", href: "/docs/api/types" },
      ]
    },
    {
      section: "Community",
      items: [
        { title: "Contributing", href: "/docs/contributing" },
        { title: "Changelog", href: "/docs/changelog" },
        { title: "Roadmap", href: "/docs/roadmap" },
        { title: "Support", href: "/docs/support" },
      ]
    }
  ];

  return (
    <aside className="md:flex hidden flex-[1] min-w-[280px] sticky top-16 flex-col h-[94.5vh] overflow-y-auto">
      <div className="relative bg-[#181824]/40 backdrop-blur-sm rounded-2xl border border-[#232336]/60 p-6 shadow-2xl">
        {/* Subtle glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-[#00e5ff22] to-transparent rounded-full blur-xl opacity-60" />
        
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-6">
            <GradientText>Documentation</GradientText>
          </h2>
          
          <nav className="space-y-6">
            {navigationItems.map((section) => (
              <div key={section.section}>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                  {section.section}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <a
                        href={item.href}
                        className={`
                          group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${item.href === pathname
                            ? 'bg-gradient-to-r from-[#00e5ff]/20 to-[#7C3AED]/20 text-white border border-[#00e5ff]/30' 
                            : 'text-gray-400 hover:text-white hover:bg-[#232336]/40'
                          }
                        `}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-all duration-200 ${
                          item.href === pathname 
                            ? 'bg-gradient-to-r from-[#00e5ff] to-[#7C3AED]' 
                            : 'bg-gray-600 group-hover:bg-gray-400'
                        }`} />
                        <span className={item.href === pathname ? 'bg-gradient-to-r from-[#00e5ff] to-[#7C3AED] bg-clip-text text-transparent' : ''}>
                          {item.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          
          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-[#232336]/60">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <a 
                href="https://github.com/voidhaus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#232336]/40"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a 
                href="https://npmjs.com/org/voidhaus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#232336]/40"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.327h-2.669v.004zm12.001 0h-1.33v-4h-1.336v4h-1.33v-4h-1.336v4h-1.33V8.667h6.662v5.331zM10.665 10v2.667h1.33V10h-1.33z"/>
                </svg>
                NPM
              </a>
              <a 
                href="#search"
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#232336]/40"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
