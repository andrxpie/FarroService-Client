import { apiClient } from "@/utils/apiClient";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  masterSpecialization?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  fullName: string;
}

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });

    if (data.token) {
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
    return data;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });

    if (data.token) {
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
    return data;
  },

  logout(): void {
    localStorage.removeItem("farro_token");
    localStorage.removeItem("farro_user");
  },

  getCurrentUser() {
    if (typeof window === "undefined") return null;
    const userJson = localStorage.getItem("farro_user");
    return userJson ? JSON.parse(userJson) : null;
  },
};
