import React from "react";
import { BookingStatus } from "@/types";

export const Badge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const styles: Record<BookingStatus, string> = {
    Confirmed: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Completed: "bg-slate-100 text-slate-600 border-slate-200",
    Cancelled: "bg-red-50 text-red-600 border-red-100",
  };

  const labels: Record<BookingStatus, string> = {
    Confirmed: "Підтверджено",
    Pending: "Очікує",
    Completed: "Виконано",
    Cancelled: "Скасовано",
  };

  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>{labels[status]}</span>;
};
