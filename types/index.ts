export type UserRole = "guest" | "master" | "admin";
export type ViewState = UserRole | "guest-booking";
export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Service {
  id: string;
  title: string;
  price: number;
  durationMinutes: number;
  description: string;
  isActive: boolean;
  image?: string;
}

export interface Master {
  id: string;
  fullName: string;
  email: string;
  specialization?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceTitle: string;
  masterId: string;
  masterFullName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  address?: string;
  comment?: string;
  createdAt: string;
}

export interface CreateBookingPayload {
  serviceId: string;
  masterId: string;
  date: string;
  startTime: string;
  clientName: string;
  phone: string;
  address: string;
  comment?: string;
}

export interface ToastNotification {
  message: string;
  type: "success" | "info" | "error";
}

export interface AuthUser {
  email: string;
  role: string;
  fullName: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
}

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
