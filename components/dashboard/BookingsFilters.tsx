"use client";

import React from "react";
import { Booking, BookingStatus } from "@/types";

export interface BookingFilterState {
  services: string[];
  statuses: BookingStatus[];
}

export const DEFAULT_BOOKING_FILTERS: BookingFilterState = { services: [], statuses: [] };

const STATUS_LABELS: Record<BookingStatus, string> = {
  Pending: "Очікує",
  Confirmed: "Підтверджено",
  Completed: "Виконано",
  Cancelled: "Скасовано",
};

const ALL_STATUSES: BookingStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled"];

interface BookingsFiltersProps {
  bookings: Booking[];
  filters: BookingFilterState;
  onChange: (f: BookingFilterState) => void;
}

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Фільтри</span>
        {hasActive && (
          <button
            onClick={() => onChange(DEFAULT_BOOKING_FILTERS)}
            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Скинути
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Послуга</p>
        <div className="space-y-1.5">
          {availableServices.map((title) => (
            <label key={title} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.services.includes(title)}
                onChange={() => toggleService(title)}
                className="w-3.5 h-3.5 rounded accent-blue-600"
              />
              <span className="text-xs text-slate-700 group-hover:text-slate-900 truncate">{title}</span>
            </label>
          ))}
          {availableServices.length === 0 && <p className="text-xs text-slate-400">—</p>}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Статус</p>
        <div className="space-y-1.5">
          {ALL_STATUSES.map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.statuses.includes(status)}
                onChange={() => toggleStatus(status)}
                className="w-3.5 h-3.5 rounded accent-blue-600"
              />
              <span className="text-xs text-slate-700 group-hover:text-slate-900">{STATUS_LABELS[status]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
