"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-lg",
}) => (
  <div
    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
    onClick={onClose}
  >
    <div
      className={`bg-white rounded-2xl shadow-xl border border-slate-100 w-full ${maxWidth} overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-slate-900 text-white p-6 relative flex-shrink-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-0.5">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
      </div>
      <div className="p-6 overflow-y-auto">{children}</div>
    </div>
  </div>
);
