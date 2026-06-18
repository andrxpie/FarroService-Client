export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Service {
  id: string;
  title: string;
  price: number;
  durationMinutes: number;
  description: string;
  isActive: boolean;
  specializationId?: string;
  specializationName?: string;
  image?: string;
}

export interface Master {
  id: string;
  fullName: string;
  email: string;
  specializations: Specialization[];
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
  latitude?: string;
  longitude?: string;
  comment?: string;
  createdAt: string;
}

export interface UpdateBookingPayload {
  clientName: string;
  phone: string;
  serviceId: string;
  masterId: string;
  date: string;
  startTime: string;
  status: BookingStatus;
  address?: string;
  comment?: string;
  latitude?: string;
  longitude?: string;
}

export interface CreateBookingPayload {
  serviceId: string;
  masterId: string;
  date: string;
  startTime: string;
  clientName: string;
  phone: string;
  address: string;
  latitude?: string;
  longitude?: string;
  comment?: string;
}

export interface ToastNotification {
  message: string;
  type: "success" | "info" | "error";
}

export interface AuthUser {
  id: string;
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
  updateProfile: (fullName: string, email: string) => void;
}

export interface UpdateProfilePayload {
  fullName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
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
  userId: string;
}

export interface ScheduleItem {
  id: string;
  masterId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorkingDay: boolean;
}

export interface Specialization {
  id: string;
  name: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  specializations: Specialization[];
  createdAt: string;
}

export interface CreateServicePayload {
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  specializationId: string;
}

export interface UpdateServicePayload {
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  specializationId: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role: string;
  specializationIds?: string[];
}

export interface UpdateUserPayload {
  fullName: string;
  email: string;
  specializationIds?: string[];
  role?: string;
}
