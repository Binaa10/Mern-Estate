import React from "react";
import clsx from "clsx";

export function Table({ className, ...props }) {
  return (
    <table
      className={clsx("w-full caption-bottom text-sm", className)}
      {...props}
    />
  );
}
export function THead({ className, ...props }) {
  return (
    <thead
      className={clsx("[&_tr]:border-b bg-slate-50", className)}
      {...props}
    />
  );
}
export function TBody({ className, ...props }) {
  return (
    <tbody
      className={clsx("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}
export function TR({ className, ...props }) {
  return (
    <tr
      className={clsx(
        "border-b transition-colors hover:bg-slate-50",
        className
      )}
      {...props}
    />
  );
}
export function TH({ className, ...props }) {
  return (
    <th
      className={clsx(
        "h-10 px-3 text-left align-middle font-medium text-slate-600",
        className
      )}
      {...props}
    />
  );
}
export function TD({ className, ...props }) {
  return <td className={clsx("p-3 align-middle", className)} {...props} />;
}
