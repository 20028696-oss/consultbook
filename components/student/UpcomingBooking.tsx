"use client";

import { useEffect, useState } from "react";
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

export default function UpcomingBooking() {
  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadUpcomingBooking();
  }, []);

  const loadUpcomingBooking = async () => {
    try {
      setLoading(true);

      // Get currently logged-in student
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setBooking(null);
        return;
      }

      const today = new Date()
        .toISOString()
        .split("T")[0];

      // Get only this student's next booking
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
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Upcoming booking error:",
          error
        );

        setBooking(null);
        return;
      }

      setBooking(data);
    } catch (error) {
      console.error(
        "Load upcoming booking error:",
        error
      );

      setBooking(null);
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

  if (loading) {
    return (
      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading upcoming booking...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="inline-flex rounded-md bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500">
          UPCOMING
        </span>

        <h3 className="mt-4 text-base font-bold text-[#14244a]">
          No Upcoming Booking
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          You currently have no upcoming consultations.
        </p>
      </div>
    );
  }

  const bookingStatus =
    booking.status?.toLowerCase() || "pending";

  return (
    <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`inline-flex rounded-md px-3 py-1 text-[10px] font-bold tracking-wider ${
              bookingStatus === "confirmed"
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {booking.status.toUpperCase()}
          </span>

          <h3 className="mt-4 text-base font-bold text-[#14244a]">
            {booking.subject || "Consultation"}
          </h3>

          <div className="mt-3 space-y-2 text-sm text-slate-500">
            <p>
              📅 {formatDate(booking.booking_date)}
            </p>

            <p>
              🕐 {booking.booking_time}
            </p>

            <p>
              👤 {booking.lecturer_name}
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          {formatShortDate(booking.booking_date)}
        </span>
      </div>
    </div>
  );
}