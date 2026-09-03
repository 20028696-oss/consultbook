import type { Booking, TodayStats } from "@/types/database";

// In-memory store so Approve/Reject visibly changes state in the demo.
// Resets whenever the dev server restarts — that's fine for a local check.
let TODAY_BOOKINGS: Booking[] = [
  {
    booking_id: "t1",
    student_id: "s1",
    lecturer_id: "l1",
    availability_id: "a1",
    subject: "Database help",
    status: "confirmed",
    created_at: "",
    updated_at: "",
    student_name: "Abhideep Lamichhane",
    date: new Date().toISOString().slice(0, 10),
    start_time: "10:00:00",
    end_time: "10:30:00",
  },
  {
    booking_id: "t2",
    student_id: "s2",
    lecturer_id: "l1",
    availability_id: "a2",
    subject: "Project review",
    status: "pending",
    created_at: "",
    updated_at: "",
    student_name: "Manpreet Singh",
    date: new Date().toISOString().slice(0, 10),
    start_time: "14:00:00",
    end_time: "14:30:00",
  },
  {
    booking_id: "t3",
    student_id: "s3",
    lecturer_id: "l1",
    availability_id: "a3",
    subject: "Assignment query",
    status: "confirmed",
    created_at: "",
    updated_at: "",
    student_name: "Jasim Khan",
    date: new Date().toISOString().slice(0, 10),
    start_time: "16:00:00",
    end_time: "16:30:00",
  },
];

const UPCOMING_WEEK: Booking[] = [
  {
    booking_id: "w1",
    student_id: "s4",
    lecturer_id: "l1",
    availability_id: "a4",
    subject: "ERD feedback",
    status: "confirmed",
    created_at: "",
    updated_at: "",
    student_name: "Patwary M. Alam",
    date: "2026-08-19",
    start_time: "11:00:00",
    end_time: "11:30:00",
  },
  {
    booking_id: "w2",
    student_id: "s1",
    lecturer_id: "l1",
    availability_id: "a5",
    subject: "Flask backend",
    status: "pending",
    created_at: "",
    updated_at: "",
    student_name: "Abhideep Lamichhane",
    date: "2026-08-21",
    start_time: "15:00:00",
    end_time: "15:30:00",
  },
];

export async function getTodayStats(): Promise<TodayStats> {
  return {
    todaysTotal: TODAY_BOOKINGS.length,
    confirmed: TODAY_BOOKINGS.filter((b) => b.status === "confirmed").length,
    pending: TODAY_BOOKINGS.filter((b) => b.status === "pending").length,
    cancelled: TODAY_BOOKINGS.filter((b) => b.status === "cancelled").length,
  };
}

export async function getTodayConsultations(): Promise<Booking[]> {
  return TODAY_BOOKINGS;
}

export async function getUpcomingThisWeek(): Promise<Booking[]> {
  return UPCOMING_WEEK;
}

export async function updateBookingStatus(bookingId: string, status: "confirmed" | "rejected") {
  TODAY_BOOKINGS = TODAY_BOOKINGS.map((b) =>
    b.booking_id === bookingId ? { ...b, status } : b
  );
}

export async function getScheduleBookingById(id: string): Promise<Booking | null> {
  return [...TODAY_BOOKINGS, ...UPCOMING_WEEK].find((b) => b.booking_id === id) ?? null;
}
