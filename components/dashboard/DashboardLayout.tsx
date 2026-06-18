import React from "react";

interface DashboardLayoutProps {
  title: string;
  role: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children, role }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between pb-6 border-b border-slate-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">Панель керування: {role}</p>
      </div>
    </div>
    {children}
  </div>
);
