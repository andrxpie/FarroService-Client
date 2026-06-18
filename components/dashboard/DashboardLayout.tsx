import React from "react";

interface DashboardLayoutProps {
  title: string;
  role?: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, role, children }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between pb-4 sm:pb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
        {role && <p className="text-sm text-slate-500 mt-1">{role}</p>}
      </div>
    </div>
    {children}
  </div>
);
