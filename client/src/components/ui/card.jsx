import React from "react";
import clsx from "clsx";

export function Card({ className, children }) {
  return (
    <div className={clsx("rounded-lg border bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}
export function CardHeader({ className, children }) {
  return <div className={clsx("p-4 border-b", className)}>{children}</div>;
}
export function CardTitle({ className, children }) {
  return (
    <h3
      className={clsx("font-semibold leading-none tracking-tight", className)}
    >
      {children}
    </h3>
  );
}
export function CardDescription({ className, children }) {
  return (
    <p className={clsx("text-sm text-slate-500", className)}>{children}</p>
  );
}
export function CardContent({ className, children }) {
  return <div className={clsx("p-4 pt-2", className)}>{children}</div>;
}
export function CardFooter({ className, children }) {
  return <div className={clsx("p-4 border-t", className)}>{children}</div>;
}
