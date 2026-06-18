import React, { useState } from "react";
import { CheckCircle2, XCircle, Search, Trash2 } from "lucide-react";
import { Booking, BookingStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { BookingsFilters, BookingFilterState, DEFAULT_BOOKING_FILTERS } from "./BookingsFilters";

interface BookingsTableProps {
  bookings: Booking[];
  onAction: (id: string, status: BookingStatus) => void;
  onDelete?: (id: string) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, onAction, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BookingFilterState>(DEFAULT_BOOKING_FILTERS);

  const q = searchQuery.toLowerCase().trim();

  const filtered = bookings.filter((b) => {
    // Text search: client name and phone only
    if (q && !b.clientName.toLowerCase().includes(q) && !(b.clientPhone ?? "").toLowerCase().includes(q)) {
      return false;
    }
    // Service filter
    if (filters.services.length > 0 && !filters.services.includes(b.serviceTitle)) return false;
    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(b.status)) return false;
    return true;
  });

  return (
    <div className="flex gap-6 items-start">
      {/* Left sidebar: search + filters */}
      <aside className="w-56 flex-shrink-0 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Пошук клієнта..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
          />
        </div>
        <BookingsFilters bookings={bookings} filters={filters} onChange={setFilters} />
      </aside>

      {/* Right: table */}
      <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-auto max-h-[520px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Клієнт / Телефон</th>
                <th className="px-6 py-4">Послуга</th>
                <th className="px-6 py-4">Майстер</th>
                <th className="px-6 py-4">Дата і Час</th>
                <th className="px-6 py-4">Адреса</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{b.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{b.clientName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{b.clientPhone || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{b.serviceTitle}</td>
                  <td className="px-6 py-4">{b.masterFullName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{b.bookingDate.split("T")[0]}</span>
                      <span className="text-slate-400">{b.startTime.slice(0, 5)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="block max-w-[160px] truncate text-slate-500" title={b.address}>
                      {b.address || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={b.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {b.status === "Pending" && (
                        <>
                          <button
                            onClick={() => onAction(b.id, "Confirmed")}
                            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 cursor-pointer"
                            title="Підтвердити"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onAction(b.id, "Cancelled")}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 cursor-pointer"
                            title="Скасувати"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {b.status === "Cancelled" && onDelete && (
                        <button
                          onClick={() => onDelete(b.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 cursor-pointer"
                          title="Видалити"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            {searchQuery || filters.services.length > 0 || filters.statuses.length > 0
              ? "За вашим запитом нічого не знайдено"
              : "Записів не знайдено"}
          </div>
        )}
      </div>
    </div>
  );
};
