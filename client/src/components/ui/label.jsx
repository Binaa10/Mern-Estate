import React from "react";
import clsx from "clsx";

export function Label({ className, children, ...props }) {
  return (
    <label
      className={clsx(
        "text-sm font-medium leading-none text-slate-700 transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
