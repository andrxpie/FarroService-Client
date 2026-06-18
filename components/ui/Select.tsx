"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

const ITEM_HEIGHT = 41; // приблизна висота одного пункту (px)
const MAX_VISIBLE = 6; // скільки пунктів показувати без прокрутки

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "— Обрати —",
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [openUp, setOpenUp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const selected = options.find((o) => o.value === value);

  const close = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 150);
  };

  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const gap = 6;
      // максимальна бажана висота списку (6 пунктів + трохи на placeholder)
      const desiredHeight = ITEM_HEIGHT * MAX_VISIBLE;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      // відкриваємо вгору, якщо знизу не вистачає місця, а зверху його більше
      const up = spaceBelow < desiredHeight && spaceAbove > spaceBelow;
      const available = up ? spaceAbove : spaceBelow;
      const maxHeight = Math.min(desiredHeight, available);

      setOpenUp(up);
      setDropdownStyle({
        position: "fixed",
        ...(up
          ? { bottom: window.innerHeight - rect.top + gap }
          : { top: rect.bottom + gap }),
        left: rect.left,
        width: rect.width,
        maxHeight,
        zIndex: 9999,
      });
    }
    setIsOpen(true);
  };

  const toggle = () => (isOpen ? close() : openDropdown());

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setIsClosing(false);
  };

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      if (isOpen) close();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  const triggerBase =
    "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm bg-white outline-none transition-all cursor-pointer border focus:ring-2";
  const triggerColor = error
    ? "border-red-400 focus:ring-red-300"
    : isOpen
    ? "border-blue-500 ring-2 ring-blue-500"
    : "border-slate-300 hover:border-slate-400 focus:ring-blue-500";

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className={`bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto ${
        isClosing
          ? `animate-out fade-out zoom-out-95 duration-150 ${
              openUp ? "slide-out-to-bottom-2" : "slide-out-to-top-2"
            }`
          : `animate-in fade-in zoom-in-95 duration-150 ${
              openUp ? "slide-in-from-bottom-2" : "slide-in-from-top-2"
            }`
      }`}
    >
      {placeholder && (
        <button
          type="button"
          onClick={() => handleSelect("")}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors cursor-pointer ${
            !value
              ? "bg-slate-50 text-slate-500 font-medium"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
        >
          {placeholder}
          {!value && <Check className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </button>
      )}
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleSelect(opt.value)}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors cursor-pointer ${
            opt.value === value
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {opt.label}
          {opt.value === value && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className={`${triggerBase} ${triggerColor}`}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {mounted && dropdown && ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
};
