import React from "react";
import { Wrench, User, Briefcase, Shield } from "lucide-react";
import { ViewState } from "@/types";

interface NavbarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
}) => (
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onViewChange("guest")}
        >
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Farro<span className="text-blue-600">Service</span>
          </span>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
            Режим перегляду:
          </span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => onViewChange("guest")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                ["guest", "guest-booking"].includes(currentView)
                  ? "bg-white shadow text-blue-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" /> Гість
            </button>
            <button
              onClick={() => onViewChange("master")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                currentView === "master"
                  ? "bg-white shadow text-blue-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Майстер
            </button>
            <button
              onClick={() => onViewChange("admin")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                currentView === "admin"
                  ? "bg-white shadow text-blue-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Shield className="w-4 h-4" /> Адмін
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
);
