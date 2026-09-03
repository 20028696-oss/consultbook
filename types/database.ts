// Types mirroring the ConsultBook schema defined in DATABASE_DESIGN.md
// (public.app_user, public.lecturer, public.availability, public.booking)

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "completed";

export interface AppUser {
  user_id: string;
  full_name: string;
  role: "student" | "lecturer" | "admin";
  created_at: string;
}

export interface Lecturer {
  lecturer_id: string; // FK -> app_user.user_id
  department?: string | null;
}

export interface Availability {
  availability_id: string;
  lecturer_id: string;
  date: string; // ISO date
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  is_available: boolean;
}

export interface Booking {
  booking_id: string;
  student_id: string;
  lecturer_id: string;
  availability_id: string;
  subject: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  // Joined fields (populated by the queries in lecturer-dashboard.ts)
  student_name?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

export interface LecturerDashboardStats {
  totalConsultations: number;
  confirmedToday: number;
  pendingRequests: number;
  completedThisWeek: number;
}

export interface TodayStats {
  todaysTotal: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}
