import React, { useState } from "react";
import { CheckCircle2, XCircle, Search, Trash2, Pencil, SlidersHorizontal } from "lucide-react";
import { Booking, BookingStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { BookingsFilters, BookingFilterState, DEFAULT_BOOKING_FILTERS } from "./BookingsFilters";

interface BookingsTableProps {
  bookings: Booking[];
  onAction: (id: string, status: BookingStatus) => void;
  onDelete?: (id: string) => void;
  onEdit?: (booking: Booking) => void;
  showId?: boolean;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, onAction, onDelete, onEdit, showId = true }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BookingFilterState>(DEFAULT_BOOKING_FILTERS);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const q = searchQuery.toLowerCase().trim();

  const filtered = bookings.filter((b) => {
    if (q && !b.clientName.toLowerCase().includes(q) && !(b.clientPhone ?? "").toLowerCase().includes(q)) {
      return false;
    }
    if (filters.services.length > 0 && !filters.services.includes(b.serviceTitle)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(b.status)) return false;
    return true;
  });

  const activeFilterCount = filters.services.length + filters.statuses.length;

  const renderActions = (b: Booking) => (
    <>
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
      {onEdit && (
        <button
          onClick={() => onEdit(b)}
          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 cursor-pointer"
          title="Редагувати"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(b.id)}
          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 cursor-pointer"
          title="Видалити"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </>
  );

  const emptyState = (
    <div className="p-12 text-center text-slate-400">
      {searchQuery || activeFilterCount > 0 ? "За вашим запитом нічого не знайдено" : "Записів не знайдено"}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук клієнта..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFiltersModal(true)}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer flex-shrink-0 ${
              activeFilterCount > 0
                ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Фільтри
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold leading-none">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Table — desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                <tr>
                  {showId && <th className="px-6 py-4">ID</th>}
                  <th className="px-6 py-4">Клієнт / Телефон</th>
                  <th className="px-6 py-4">{showId && " / Майстер"}Послуга</th>
                  <th className="px-6 py-4">Дата і Час</th>
                  <th className="px-6 py-4">Адреса</th>
                  <th className="px-6 py-4">Статус</th>
                  {showId && <th className="px-6 py-4 text-right">Дії</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                    {showId && <td className="px-6 py-4 font-mono text-xs text-slate-400">{b.id.slice(0, 8).toUpperCase()}</td>}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{b.clientName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{b.clientPhone || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-900">{b.serviceTitle}</div>
                      {showId && <div className="text-xs text-slate-400 mt-0.5">{b.masterFullName}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{b.bookingDate.split("T")[0]}</span>
                        <span className="text-slate-400">{b.startTime.slice(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{b.address || "—"}</td>
                    <td className="px-6 py-4">
                      <Badge status={b.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderActions(b)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && emptyState}
        </div>

        {/* Cards — mobile */}
        <div className="md:hidden space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">{b.clientName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{b.clientPhone || "-"}</div>
                </div>
                <Badge status={b.status} />
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-900">{b.serviceTitle}</div>
                <div className="text-xs text-slate-400 mt-0.5">{b.masterFullName}</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium">{b.bookingDate.split("T")[0]}</span>
                <span className="text-slate-400">{b.startTime.slice(0, 5)}</span>
              </div>
              {b.address && <div className="text-sm text-slate-500">{b.address}</div>}
              {showId && <div className="font-mono text-xs text-slate-400">{b.id.slice(0, 8).toUpperCase()}</div>}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">{renderActions(b)}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">{emptyState}</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        title="Фільтри"
        subtitle="Звужте список записів"
        maxWidth="max-w-sm"
      >
        <BookingsFilters bookings={bookings} filters={filters} onChange={setFilters} />
      </Modal>
    </>
  );
};
