import React from "react";
import { BookingStatus } from "@/types";

export const Badge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const styles: Record<BookingStatus, string> = {
    confirmed: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  };

  const labels: Record<BookingStatus, string> = {
    confirmed: "Підтверджено",
    pending: "Очікує",
    completed: "Виконано",
    cancelled: "Скасовано",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};
