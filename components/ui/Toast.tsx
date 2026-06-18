"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

const BG: Record<string, string> = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  info: "bg-blue-50 border-blue-200",
};

function ToastIcon({ type }: { type: string }) {
  if (type === "success") return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (type === "error") return <XCircle className="w-5 h-5 text-red-500" />;
  return <Info className="w-5 h-5 text-blue-500" />;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const timer = setTimeout(handleClose, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${BG[type]} ${
        isExiting
          ? "animate-out slide-out-to-right-4 fade-out duration-300"
          : "animate-in slide-in-from-bottom-4 fade-in duration-300"
      }`}
    >
      <ToastIcon type={type} />
      <span className="text-sm font-medium text-slate-800">{message}</span>
      <button onClick={handleClose} className="ml-2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
