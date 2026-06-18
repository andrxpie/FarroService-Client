"use client";

import React from "react";
import { Specialization } from "@/types";

export interface ServiceFilterState {
  specializationIds: string[];
  minDuration: number | null;
  maxDuration: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  status: "all" | "active" | "inactive";
}

export const DEFAULT_SERVICE_FILTERS: ServiceFilterState = {
  specializationIds: [],
  minDuration: null,
  maxDuration: null,
  minPrice: null,
  maxPrice: null,
  status: "all",
};

interface ServicesFiltersProps {
  specializations: Specialization[];
  filters: ServiceFilterState;
  onChange: (f: ServiceFilterState) => void;
}

const numOrNull = (val: string): number | null => {
  const n = Number(val);
  return val.trim() === "" || isNaN(n) ? null : n;
};

export const ServicesFilters: React.FC<ServicesFiltersProps> = ({ specializations, filters, onChange }) => {
  const toggleSpec = (id: string) => {
    const next = filters.specializationIds.includes(id)
      ? filters.specializationIds.filter((s) => s !== id)
      : [...filters.specializationIds, id];
    onChange({ ...filters, specializationIds: next });
  };

  const hasActive =
    filters.specializationIds.length > 0 ||
    filters.minDuration !== null ||
    filters.maxDuration !== null ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.status !== "all";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Фільтри</span>
        {hasActive && (
          <button
            onClick={() => onChange(DEFAULT_SERVICE_FILTERS)}
            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Скинути
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Спеціалізація</p>
        <div className="space-y-1.5">
          {specializations.map((sp) => (
            <label key={sp.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.specializationIds.includes(sp.id)}
                onChange={() => toggleSpec(sp.id)}
                className="w-3.5 h-3.5 rounded accent-blue-600"
              />
              <span className="text-xs text-slate-700 group-hover:text-slate-900 truncate">{sp.name}</span>
            </label>
          ))}
          {specializations.length === 0 && <p className="text-xs text-slate-400">—</p>}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Тривалість (хв)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="від"
            value={filters.minDuration ?? ""}
            onChange={(e) => onChange({ ...filters, minDuration: numOrNull(e.target.value) })}
            className="w-full border border-slate-200 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="number"
            min={0}
            placeholder="до"
            value={filters.maxDuration ?? ""}
            onChange={(e) => onChange({ ...filters, maxDuration: numOrNull(e.target.value) })}
            className="w-full border border-slate-200 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Ціна (грн)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="від"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ ...filters, minPrice: numOrNull(e.target.value) })}
            className="w-full border border-slate-200 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="number"
            min={0}
            placeholder="до"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: numOrNull(e.target.value) })}
            className="w-full border border-slate-200 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Статус</p>
        <div className="space-y-1.5">
          {(["all", "active", "inactive"] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="service-status"
                checked={filters.status === v}
                onChange={() => onChange({ ...filters, status: v })}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              <span className="text-xs text-slate-700 group-hover:text-slate-900">
                {v === "all" ? "Всі" : v === "active" ? "Активні" : "Неактивні"}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
