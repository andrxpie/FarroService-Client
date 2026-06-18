import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Booking, BookingStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface BookingsTableProps {
  bookings: Booking[];
  onAction: (id: string, status: BookingStatus) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, onAction }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Клієнт / Телефон</th>
            <th className="px-6 py-4">Послуга</th>
            <th className="px-6 py-4">Майстер</th>
            <th className="px-6 py-4">Дата і Час</th>
            <th className="px-6 py-4">Статус</th>
            <th className="px-6 py-4 text-right">Дії</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4 font-mono text-xs text-slate-400">{b.id.slice(0, 8).toUpperCase()}</td>
              <td className="px-6 py-4">
                <div className="font-medium text-slate-900">{b.clientName}</div>
                <div className="text-xs text-slate-400 mt-0.5">{b.clientPhone || "-"}</div>
              </td>
              <td className="px-6 py-4 text-slate-900">{b.serviceTitle}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {b.masterFullName.charAt(0)}
                  </div>
                  {b.masterFullName}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium">{b.bookingDate.split("T")[0]}</span>
                  <span className="text-slate-400">{b.startTime.slice(0, 5)}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge status={b.status} />
              </td>
              <td className="px-6 py-4 text-right">
                {b.status === "Pending" && (
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onAction(b.id, "Confirmed")}
                      className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                      title="Підтвердити"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onAction(b.id, "Cancelled")}
                      className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      title="Скасувати"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {bookings.length === 0 && <div className="p-12 text-center text-slate-400">Записів не знайдено</div>}
  </div>
);
