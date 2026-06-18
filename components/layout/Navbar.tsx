"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench, User, Briefcase, Shield, LogOut, Settings,
  Loader2, AlertCircle, CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/utils/apiClient";
import type { UpdateProfilePayload } from "@/types";
import { Modal } from "@/components/ui/Modal";

const ROLE_LABELS: Record<string, string> = {
  MainAdmin: "Головний адмін",
  Admin: "Адмін",
  Master: "Майстер",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  MainAdmin: <Shield className="w-4 h-4" />,
  Admin: <Shield className="w-4 h-4" />,
  Master: <Briefcase className="w-4 h-4" />,
};

export const Navbar: React.FC = () => {
  const { user, logout, updateProfile, login } = useAuth();
  const router = useRouter();

  // Profile modal
  const [showProfile, setShowProfile] = useState(false);
  const [form, setForm] = useState<UpdateProfilePayload>({ fullName: "", email: "", currentPassword: "", newPassword: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Login modal
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const openProfile = () => {
    if (!user) return;
    setForm({ fullName: user.fullName, email: user.email, currentPassword: "", newPassword: "" });
    setProfileError("");
    setProfileSuccess(false);
    setShowProfile(true);
  };

  const openLogin = () => {
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setShowLogin(true);
  };

  const handleLoginSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      setShowLogin(false);
      router.push("/dashboard");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Невірний email або пароль.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setIsSaving(true);

    if (form.newPassword && form.newPassword.length < 6) {
      setProfileError("Новий пароль має містити щонайменше 6 символів.");
      setIsSaving(false);
      return;
    }
    if (form.newPassword && !form.currentPassword) {
      setProfileError("Вкажіть поточний пароль.");
      setIsSaving(false);
      return;
    }

    try {
      const payload: UpdateProfilePayload = { fullName: form.fullName, email: form.email };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await apiClient<{ fullName: string; email: string }>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      updateProfile(res.fullName, res.email);
      setProfileSuccess(true);
      setTimeout(() => setShowProfile(false), 1200);
    } catch (err) {
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message) as { message?: string };
          setProfileError(parsed.message ?? err.message);
        } catch {
          setProfileError(err.message);
        }
      } else {
        setProfileError("Помилка збереження.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
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

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">{user.fullName}</span>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-white shadow text-blue-600 flex items-center gap-2">
                      {ROLE_ICONS[user.role] ?? <User className="w-4 h-4" />}
                      {ROLE_LABELS[user.role] ?? user.role}
                    </div>
                    <button
                      onClick={openProfile}
                      title="Налаштування профілю"
                      className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
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
                    onClick={openLogin}
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

      {/* Login modal */}
      <Modal
        isOpen={showLogin}
        title="Авторизація"
        subtitle="Вхід до системи для співробітників"
        onClose={() => setShowLogin(false)}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {loginError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {loginError}
            </div>
          )}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="login-email"
              required
              type="email"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-slate-900"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="admin@farro.ua"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
            <input
              id="login-password"
              required
              type="password"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-slate-900"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              Увійти до панелі
            </button>
          </div>
        </form>
      </Modal>

      {/* Profile settings modal */}
      <Modal
        isOpen={showProfile}
        title="Профіль"
        subtitle="Редагування особистих даних"
        onClose={() => setShowProfile(false)}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {profileError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> Збережено успішно!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Повне ім&apos;я</label>
            <input
              required
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              required
              type="email"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-3">Залиште порожнім, якщо не змінюєте пароль</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Поточний пароль</label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Новий пароль</label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Зберегти
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
