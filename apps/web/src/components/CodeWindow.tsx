import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeWindow({
  children,
  language = "typescript",
}: {
  children: string;
  language?: "typescript" | "bash" | "json";
}) {
  return (
    <div className="relative bg-[#181825] rounded-xl shadow-lg border border-[#232336] overflow-hidden w-full max-w-xl min-w-[18rem] mx-auto my-8">
      {/* Toolbar */}
      <div className="flex items-center h-8 px-4 bg-[#232336] border-b border-[#232336]">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#13a10e]" />
        </span>
      </div>
      {/* Code content */}
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          background: "transparent",
          minHeight: 180,
          maxHeight: 260,
          margin: 0,
          padding: 24,
          fontSize: "1rem",
        }}
        showLineNumbers={false}
        wrapLongLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
