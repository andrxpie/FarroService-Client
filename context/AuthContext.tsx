"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, LoginDto, RegisterDto } from "@/services/authService";

interface UserContextType {
  email: string;
  role: string;
  fullName: string;
}

interface AuthContextType {
  user: UserContextType | null;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContextType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (dto: LoginDto) => {
    setIsLoading(true);
    try {
      const res = await authService.login(dto);
      setUser({ email: res.email, role: res.role, fullName: res.fullName });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: RegisterDto) => {
    setIsLoading(true);
    try {
      const res = await authService.register(dto);
      setUser({ email: res.email, role: res.role, fullName: res.fullName });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
