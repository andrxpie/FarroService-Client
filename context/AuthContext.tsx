"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { authService } from "@/services/authService";
import type { AuthUser, AuthContextType, LoginDto, RegisterDto } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      setUser(authService.getCurrentUser());
    })();
  }, []);

  const login = async (dto: LoginDto) => {
    setIsLoading(true);
    try {
      const res = await authService.login(dto);
      setUser({ id: res.userId, email: res.email, role: res.role, fullName: res.fullName });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: RegisterDto) => {
    setIsLoading(true);
    try {
      const res = await authService.register(dto);
      setUser({ id: res.userId, email: res.email, role: res.role, fullName: res.fullName });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = (fullName: string, email: string) => {
    if (!user) return;
    const updated = { ...user, fullName, email };
    setUser(updated);
    localStorage.setItem("farro_user", JSON.stringify(updated));
  };

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateProfile }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
