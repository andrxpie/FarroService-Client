import React from "react";
import Link from "next/link";
import { Wrench, User, Briefcase, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Farro<span className="text-blue-600">Service</span>
            </span>
          </Link>

          {/* User Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">{user.fullName}</span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {/* Індикатор поточної ролі (застосовуємо твої стилі активної кнопки) */}
                  <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-white shadow text-blue-600 flex items-center gap-2">
                    {user.role === "Admin" ? <Shield className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                    {user.role === "Admin" ? "Адмін" : "Майстер"}
                  </div>

                  <button
                    onClick={logout}
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Вийти
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={onLoginClick}
                  className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" /> Вхід для персоналу
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
