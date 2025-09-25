import React from "react";
import clsx from "clsx";

export function Avatar({ src, alt = "", size = 40, className }) {
  return (
    <div
      className={clsx(
        "rounded-full bg-slate-200 overflow-hidden flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-slate-500 text-xs">N/A</span>
      )}
    </div>
  );
}
