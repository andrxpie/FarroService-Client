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

const pill = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
    active
      ? "bg-blue-600 text-white border-blue-600"
      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600"
  }`;

const rangeInput =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

const STATUS_OPTIONS = [
  { value: "all" as const, label: "Всі" },
  { value: "active" as const, label: "Активні" },
  { value: "inactive" as const, label: "Неактивні" },
];

export const ServicesFilters: React.FC<ServicesFiltersProps> = ({ specializations, filters, onChange }) => {
  const hasActive =
    filters.specializationIds.length > 0 ||
    filters.status !== "all" ||
    filters.minDuration !== null ||
    filters.maxDuration !== null ||
    filters.minPrice !== null ||
    filters.maxPrice !== null;

  const toggleSpec = (id: string) => {
    const next = filters.specializationIds.includes(id)
      ? filters.specializationIds.filter((s) => s !== id)
      : [...filters.specializationIds, id];
    onChange({ ...filters, specializationIds: next });
  };

  return (
    <div className="space-y-5">
      {specializations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Спеціалізація</p>
          <div className="flex flex-wrap gap-2">
            {specializations.map((sp) => (
              <button key={sp.id} type="button" onClick={() => toggleSpec(sp.id)} className={pill(filters.specializationIds.includes(sp.id))}>
                {sp.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Статус</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => onChange({ ...filters, status: value })} className={pill(filters.status === value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Тривалість (хв)</p>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} placeholder="від"
            value={filters.minDuration ?? ""}
            onChange={(e) => onChange({ ...filters, minDuration: numOrNull(e.target.value) })}
            className={rangeInput}
          />
          <span className="text-slate-400 text-sm flex-shrink-0">—</span>
          <input
            type="number" min={0} placeholder="до"
            value={filters.maxDuration ?? ""}
            onChange={(e) => onChange({ ...filters, maxDuration: numOrNull(e.target.value) })}
            className={rangeInput}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Ціна (грн)</p>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} placeholder="від"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ ...filters, minPrice: numOrNull(e.target.value) })}
            className={rangeInput}
          />
          <span className="text-slate-400 text-sm flex-shrink-0">—</span>
          <input
            type="number" min={0} placeholder="до"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: numOrNull(e.target.value) })}
            className={rangeInput}
          />
        </div>
      </div>

      {hasActive && (
        <div className="pt-2 border-t border-slate-100">
          <button onClick={() => onChange(DEFAULT_SERVICE_FILTERS)} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            Скинути фільтри
          </button>
        </div>
      )}
    </div>
  );
};
