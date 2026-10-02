// apps/web/src/context/useConfirm.js
import { useContext } from "react";
import { ConfirmContext } from "./ConfirmContext";

// Usage: if (!(await confirm({ title, message, confirmLabel, danger }))) return;
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
