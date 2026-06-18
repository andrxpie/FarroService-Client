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

const pill = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
    active
      ? "bg-blue-600 text-white border-blue-600"
      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600"
  }`;

export const UsersFilters: React.FC<UsersFiltersProps> = ({ filters, onChange }) => {
  const toggle = (role: string) => {
    const next = filters.roles.includes(role)
      ? filters.roles.filter((r) => r !== role)
      : [...filters.roles, role];
    onChange({ roles: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Роль</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => toggle(value)} className={pill(filters.roles.includes(value))}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {filters.roles.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <button onClick={() => onChange(DEFAULT_USER_FILTERS)} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            Скинути фільтри
          </button>
        </div>
      )}
    </div>
  );
};
