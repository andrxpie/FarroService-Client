"use client";

import React from "react";
import { Booking, BookingStatus } from "@/types";

export interface BookingFilterState {
  services: string[];
  statuses: BookingStatus[];
}

export const DEFAULT_BOOKING_FILTERS: BookingFilterState = { services: [], statuses: [] };

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "Pending", label: "Очікує" },
  { value: "Confirmed", label: "Підтверджено" },
  { value: "Completed", label: "Виконано" },
  { value: "Cancelled", label: "Скасовано" },
];

interface BookingsFiltersProps {
  bookings: Booking[];
  filters: BookingFilterState;
  onChange: (f: BookingFilterState) => void;
}

const pill = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
    active
      ? "bg-blue-600 text-white border-blue-600"
      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600"
  }`;

export const BookingsFilters: React.FC<BookingsFiltersProps> = ({ bookings, filters, onChange }) => {
  const availableServices = [...new Set(bookings.map((b) => b.serviceTitle))].sort();

  const toggleService = (title: string) => {
    const next = filters.services.includes(title)
      ? filters.services.filter((s) => s !== title)
      : [...filters.services, title];
    onChange({ ...filters, services: next });
  };

  const toggleStatus = (status: BookingStatus) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: next });
  };

  const hasActive = filters.services.length > 0 || filters.statuses.length > 0;

  return (
    <div className="space-y-5">
      {availableServices.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Послуга</p>
          <div className="flex flex-wrap gap-2">
            {availableServices.map((title) => (
              <button key={title} type="button" onClick={() => toggleService(title)} className={pill(filters.services.includes(title))}>
                {title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Статус</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => toggleStatus(value)} className={pill(filters.statuses.includes(value))}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {hasActive && (
        <div className="pt-2 border-t border-slate-100">
          <button onClick={() => onChange(DEFAULT_BOOKING_FILTERS)} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            Скинути фільтри
          </button>
        </div>
      )}
    </div>
  );
};
