"use client";

import React from "react";

export interface UserFilterState {
  roles: string[];
}

export const DEFAULT_USER_FILTERS: UserFilterState = { roles: [] };

const ROLES = [
  { value: "Master", label: "Майстер" },
  { value: "Admin", label: "Адмін" },
  { value: "MainAdmin", label: "Гол. адмін" },
];

interface UsersFiltersProps {
  filters: UserFilterState;
  onChange: (f: UserFilterState) => void;
}

export const UsersFilters: React.FC<UsersFiltersProps> = ({ filters, onChange }) => {
  const toggle = (role: string) => {
    const next = filters.roles.includes(role)
      ? filters.roles.filter((r) => r !== role)
      : [...filters.roles, role];
    onChange({ roles: next });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Фільтри</span>
        {filters.roles.length > 0 && (
          <button
            onClick={() => onChange(DEFAULT_USER_FILTERS)}
            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Скинути
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Роль</p>
        <div className="space-y-1.5">
          {ROLES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.roles.includes(value)}
                onChange={() => toggle(value)}
                className="w-3.5 h-3.5 rounded accent-blue-600"
              />
              <span className="text-xs text-slate-700 group-hover:text-slate-900">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
