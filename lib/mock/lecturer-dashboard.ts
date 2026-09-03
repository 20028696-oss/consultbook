import type { Booking, LecturerDashboardStats } from "@/types/database";

const MOCK_BOOKINGS: Booking[] = [
  {
    booking_id: "1",
    student_id: "s1",
    lecturer_id: "l1",
    availability_id: "a1",
    subject: "Database Systems Consultation",
    status: "confirmed",
    created_at: "2026-05-10T00:00:00Z",
    updated_at: "2026-05-10T00:00:00Z",
    student_name: "Abhi Lamichhane",
    date: "2026-08-15",
    start_time: "10:00:00",
    end_time: "10:30:00",
  },
  {
    booking_id: "2",
    student_id: "s2",
    lecturer_id: "l1",
    availability_id: "a2",
    subject: "Project Review",
    status: "pending",
    created_at: "2026-08-09T00:00:00Z",
    updated_at: "2026-08-09T00:00:00Z",
    student_name: "Manpreet Singh",
    date: "2026-08-16",
    start_time: "14:00:00",
    end_time: "14:30:00",
  },
  {
    booking_id: "3",
    student_id: "s3",
    lecturer_id: "l1",
    availability_id: "a3",
    subject: "Assignment Query",
    status: "confirmed",
    created_at: "2026-08-08T00:00:00Z",
    updated_at: "2026-08-08T00:00:00Z",
    student_name: "Jasim Khan",
    date: "2026-08-10",
    start_time: "16:00:00",
    end_time: "16:30:00",
  },
];

export async function getLecturerName(): Promise<string> {
  return "Arooba Khan";
}

export async function getDashboardStats(): Promise<LecturerDashboardStats> {
  return {
    totalConsultations: 24,
    confirmedToday: 2,
    pendingRequests: 3,
    completedThisWeek: 8,
  };
}

export async function getNextUpcomingConsultation(): Promise<Booking | null> {
  return MOCK_BOOKINGS.find((b) => b.status === "confirmed") ?? null;
}

export async function getMarkedDates(): Promise<string[]> {
  return MOCK_BOOKINGS.map((b) => b.date!).filter(Boolean);
}

export async function getRecentConsultations(): Promise<Booking[]> {
  return MOCK_BOOKINGS;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const all = [...MOCK_BOOKINGS];
  return all.find((b) => b.booking_id === id) ?? null;
}
