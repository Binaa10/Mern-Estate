import React from "react";
import clsx from "clsx";

const variants = {
  default: "bg-slate-800 text-white",
  success: "bg-green-600 text-white",
  warning: "bg-amber-500 text-white",
  danger: "bg-red-600 text-white",
  outline: "border border-slate-300 text-slate-700",
};

export function Badge({ children, variant = "default", className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
