import React from "react";

interface DashboardLayoutProps {
  title: string;
  role: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  children,
  role,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between pb-6 border-b border-slate-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">Панель керування: {role}</p>
      </div>
      <div className="flex gap-2">
        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          Експорт
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Налаштування
        </button>
      </div>
    </div>
    {children}
  </div>
);
