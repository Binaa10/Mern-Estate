import React from "react";
import clsx from "clsx";

const variants = {
  default: "bg-slate-800 text-white hover:bg-slate-700",
  outline: "border border-slate-300 hover:bg-slate-100 text-slate-700",
  ghost: "text-slate-700 hover:bg-slate-100",
  destructive: "bg-red-600 text-white hover:bg-red-500",
  success: "bg-green-600 text-white hover:bg-green-500",
  secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
};

export function Button({
  children,
  variant = "default",
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
