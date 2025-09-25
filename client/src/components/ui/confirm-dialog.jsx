import React from "react";
import { Dialog } from "./dialog";
import { Button } from "./button";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  loading = false,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "default" : "default"}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : ""
            }
            disabled={loading}
            onClick={async () => {
              await onConfirm?.();
            }}
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{description}</p>
    </Dialog>
  );
}
