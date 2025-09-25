import React from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

export function Dialog({ open, onOpenChange, title, children, footer }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="border-t px-4 py-3 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function useDialogState(initial = false) {
  const [open, setOpen] = React.useState(initial);
  return { open, setOpen };
}
