import * as React from "react";

export type ButtonProps = React.PropsWithChildren<{
  as?: "a" | "button";
  href?: string;
  className?: string;
  variant?: "primary";
  size?: "lg" | "md";
  [key: string]: unknown;
}>;

const base =
  "inline-block border-2 border-[#00E5FF] text-gray-300 font-normal shadow-lg hover:scale-105 transition-transform bg-transparent hover:bg-[#00E5FF]/10";
const sizes = {
  lg: "px-8 py-3 rounded-xl text-lg",
  md: "px-6 py-2 rounded-lg text-base",
};

export default function Button({
  as = "a",
  href,
  className = "",
  size = "lg",
  children,
  ...props
}: ButtonProps) {
  const classes = [base, sizes[size], className].join(" ");
  if (as === "a") {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
