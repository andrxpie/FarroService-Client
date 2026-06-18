import { apiClient } from "@/utils/apiClient";
import type { LoginDto, RegisterDto, AuthResponse } from "@/types";

function saveSession(data: AuthResponse): void {
  localStorage.setItem("farro_token", data.token);
  localStorage.setItem(
    "farro_user",
    JSON.stringify({
      email: data.email,
      role: data.role,
      fullName: data.fullName,
    }),
  );
}

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    saveSession(data);
    return data;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    saveSession(data);
    return data;
  },

  logout(): void {
    localStorage.removeItem("farro_token");
    localStorage.removeItem("farro_user");
  },

  getCurrentUser() {
    if (globalThis.window === undefined) return null;
    const userJson = localStorage.getItem("farro_user");
    return userJson ? JSON.parse(userJson) : null;
  },
};
