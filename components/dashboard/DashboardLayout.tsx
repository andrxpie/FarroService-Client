import React from "react";

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between pb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
    </div>
    {children}
  </div>
);
