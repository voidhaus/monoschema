import * as React from "react";

export type CardProps = React.PropsWithChildren<{
  className?: string;
  [key: string]: unknown;
}>;

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "feature-card group relative bg-[#181824]/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-[#232336]/60 overflow-visible hover:scale-[1.07] transition-none",
        className
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
