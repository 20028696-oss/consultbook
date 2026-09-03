"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import DashboardStats from "@/components/student/DashboardStats";
import MiniCalendar from "@/components/student/MiniCalendar";
import { supabase } from "@/lib/supabase/client";

type Booking = {
  id: number;
  student_id: string;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
};

export default function StudentDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookings();
  }, []);

  const getBookings = async () => {
    try {
      setLoading(true);

      // Get currently logged-in student
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Student not authenticated:", userError);

        setBookings([]);
        return;
      }

      const today = new Date()
        .toISOString()
        .split("T")[0];

      // Get ONLY this student's real upcoming bookings
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          student_id,
          lecturer_name,
          subject,
          booking_date,
          booking_time,
          status
          `
        )
        .eq("student_id", user.id)
        .in("status", ["pending", "confirmed"])
        .gte("booking_date", today)
        .order("booking_date", {
          ascending: true,
        })
        .order("booking_time", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Error loading student bookings:",
          error
        );

        setBookings([]);
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error(
        "Student dashboard booking error:",
        error
      );

      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
  };

  const getStatusStyle = (status: string) => {
    if (status.toLowerCase() === "confirmed") {
      return "bg-green-100 text-green-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const mainBooking = bookings[0];

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="p-7">

          {/* Statistics */}
          <DashboardStats />

          {/* Upcoming Bookings */}
          <div className="mt-8">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#263451]">
                Upcoming Bookings
              </h2>

              <Link
                href="/student/bookings"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                See all →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[270px_1fr]">

              {/* Calendar */}
              <MiniCalendar />

              {/* Main Upcoming Booking */}
              <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

                {loading ? (
                  <p className="text-sm text-slate-500">
                    Loading bookings...
                  </p>
                ) : mainBooking ? (
                  <div className="flex items-start justify-between">

                    <div>
                      <span
                        className={`inline-block rounded-md px-3 py-1 text-xs font-bold tracking-wide ${getStatusStyle(
                          mainBooking.status
                        )}`}
                      >
                        {mainBooking.status.toUpperCase()}
                      </span>

                      <h3 className="mt-5 text-lg font-bold text-[#263451]">
                        {mainBooking.subject ||
                          "Consultation"}
                      </h3>

                      <p className="mt-3 text-sm text-slate-500">
                        📅{" "}
                        {formatDate(
                          mainBooking.booking_date
                        )}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        🕒 {mainBooking.booking_time}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        👤 {mainBooking.lecturer_name}
                      </p>
                    </div>

                    <span className="text-sm text-slate-400">
                      {formatShortDate(
                        mainBooking.booking_date
                      )}
                    </span>

                  </div>
                ) : (
                  <div className="py-6 text-center">

                    <p className="text-sm text-slate-500">
                      No upcoming bookings.
                    </p>

                    <Link
                      href="/student/lecturers"
                      className="mt-4 inline-block text-sm font-semibold text-blue-600"
                    >
                      Book a consultation →
                    </Link>

                  </div>
                )}

              </div>
            </div>
          </div>

          {/* My Upcoming Schedule */}
          <div className="mt-8">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-lg font-bold text-[#263451]">
                My Upcoming Schedule
              </h2>

              <Link
                href="/student/bookings"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                View all →
              </Link>

            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* Table Header */}
              <div className="hidden grid-cols-[1.3fr_1fr_2fr_1.5fr] bg-[#0b1b41] px-6 py-4 text-xs font-bold tracking-wider text-white md:grid">

                <span>DATE</span>

                <span>TIME</span>

                <span>LECTURER</span>

                <span>STATUS</span>

              </div>

              {/* Loading */}
              {loading && (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading schedule...
                </div>
              )}

              {/* Real Student Bookings */}
              {!loading &&
                bookings
                  .slice(0, 5)
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="grid grid-cols-1 gap-4 border-t border-slate-200 px-6 py-5 md:grid-cols-[1.3fr_1fr_2fr_1.5fr] md:items-center"
                    >

                      {/* Date */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 md:hidden">
                          DATE
                        </p>

                        <p className="text-sm text-[#263451]">
                          {formatDate(
                            booking.booking_date
                          )}
                        </p>
                      </div>

                      {/* Time */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 md:hidden">
                          TIME
                        </p>

                        <p className="text-sm text-[#263451]">
                          {booking.booking_time}
                        </p>
                      </div>

                      {/* Lecturer */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 md:hidden">
                          LECTURER
                        </p>

                        <p className="text-sm font-semibold text-[#263451]">
                          {booking.lecturer_name}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="mb-1 text-xs font-semibold text-slate-400 md:hidden">
                          STATUS
                        </p>

                        <span
                          className={`inline-flex rounded-full px-4 py-1 text-[10px] font-bold tracking-wider ${getStatusStyle(
                            booking.status
                          )}`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                    </div>
                  ))}

              {/* No Bookings */}
              {!loading && bookings.length === 0 && (
                <div className="p-10 text-center">

                  <p className="text-sm font-semibold text-[#263451]">
                    No upcoming bookings
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your upcoming consultations will appear here.
                  </p>

                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
