import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const baseClass = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden";

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  if (onClick !== undefined) {
    return (
      <button type="button" onClick={onClick} className={`${baseClass} w-full text-left cursor-pointer ${className}`}>
        {children}
      </button>
    );
  }
  return <div className={`${baseClass} ${className}`}>{children}</div>;
};
