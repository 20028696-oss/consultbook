"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function UpcomingSchedule() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);

      // Get currently logged-in student
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not found:", userError);
        setBookings([]);
        return;
      }

      const today = new Date()
        .toISOString()
        .split("T")[0];

      // Get ONLY logged-in student's upcoming bookings
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
        })
        .limit(5);

      if (error) {
        console.error(
          "Error loading upcoming schedule:",
          error
        );

        setBookings([]);
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error(
        "Upcoming schedule error:",
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

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <section>
      {/* Heading */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#14244a]">
          My Upcoming Schedule
        </h2>

        <Link
          href="/student/bookings"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View all →
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}
        <div className="hidden grid-cols-[1.2fr_1fr_2fr_1.3fr] bg-[#0b1b41] px-5 py-4 text-[11px] font-bold tracking-wider text-white md:grid">
          <span>DATE</span>
          <span>TIME</span>
          <span>LECTURER</span>
          <span>STATUS</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading upcoming bookings...
          </div>
        )}

        {/* Bookings */}
        {!loading &&
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-1 gap-3 border-t border-slate-200 px-5 py-4 text-sm md:grid-cols-[1.2fr_1fr_2fr_1.3fr] md:items-center"
            >
              {/* Date */}
              <div>
                <p className="text-xs font-semibold text-slate-400 md:hidden">
                  DATE
                </p>

                <p className="text-[#263451]">
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

                <p className="text-[#263451]">
                  {booking.booking_time}
                </p>
              </div>

              {/* Lecturer */}
              <div>
                <p className="text-xs font-semibold text-slate-400 md:hidden">
                  LECTURER
                </p>

                <p className="font-semibold text-[#263451]">
                  {booking.lecturer_name}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-400 md:hidden">
                  STATUS
                </p>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${getStatusStyle(
                    booking.status
                  )}`}
                >
                  {booking.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}

        {/* No bookings */}
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
    </section>
  );
}