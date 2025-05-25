import * as React from "react";

export type CardProps = React.PropsWithChildren<{
  className?: string;
  disablehover?: boolean;
  [key: string]: unknown;
}>;

export default function Card({ children, className = "", disablehover = false, ...props }: CardProps) {
  const base = [
    "feature-card group relative bg-[#181824]/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-[#232336]/60 overflow-visible transition-none",
    !disablehover && "hover:scale-[1.07]",
    className
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={base} {...props}>
      {children}
    </div>
  );
}
