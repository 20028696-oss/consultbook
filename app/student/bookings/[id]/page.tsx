"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import { supabase } from "@/lib/supabase/client";

type Booking = {
  id: number;
  student_id: string;
  student_name: string;
  lecturer_id: number;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  reason: string | null;
  status: string;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getBookings();
  }, []);

  const getBookings = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Get currently logged-in student
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("You must be logged in to view your bookings.");
        setBookings([]);
        return;
      }

      // Make sure this is a student account
      const role = user.user_metadata?.role
        ?.toString()
        .toLowerCase();

      if (role !== "student") {
        setMessage("Only student accounts can view this page.");
        setBookings([]);
        return;
      }

      // Only get bookings belonging to this student
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("student_id", user.id)
        .order("booking_date", {
          ascending: true,
        })
        .order("booking_time", {
          ascending: true,
        });

      if (error) {
        console.error("Error loading bookings:", error);

        setMessage(error.message);
        setBookings([]);
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error("Something went wrong:", error);

      setMessage(
        "Something went wrong while loading your bookings."
      );

      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      // Get logged-in student
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You are not authenticated.");
        return;
      }

      // Update only a booking that belongs to this student
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
        })
        .eq("id", id)
        .eq("student_id", user.id);

      if (error) {
        console.error("Cancel booking error:", error);
        alert(error.message);
        return;
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === id
            ? {
                ...booking,
                status: "cancelled",
              }
            : booking
        )
      );
    } catch (error) {
      console.error("Cancel booking error:", error);

      alert(
        "Something went wrong while cancelling the booking."
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(
      date + "T00:00:00"
    ).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="p-7">

          {/* Page Heading */}
          <div className="mb-6">
            <p className="text-sm">
              <Link
                href="/student/dashboard"
                className="font-semibold text-blue-600"
              >
                Dashboard
              </Link>

              <span className="text-slate-400">
                {" "}
                › My Bookings
              </span>
            </p>

            <h1 className="mt-4 text-2xl font-bold text-[#14244a]">
              My Bookings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your consultation bookings.
            </p>
          </div>

          {/* Error */}
          {message && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {message}
            </div>
          )}

          {/* Bookings */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* Header */}
            <div className="hidden grid-cols-[1.2fr_1fr_1.8fr_1.5fr_1fr_1.5fr] bg-[#0b1b41] px-5 py-4 text-[11px] font-bold tracking-wider text-white md:grid">
              <span>DATE</span>
              <span>TIME</span>
              <span>LECTURER</span>
              <span>SUBJECT</span>
              <span>STATUS</span>
              <span>ACTION</span>
            </div>

            {/* Loading */}
            {loading && (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading your bookings...
              </div>
            )}

            {/* Booking Rows */}
            {!loading &&
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="grid grid-cols-1 gap-4 border-t border-slate-200 bg-white px-5 py-5 md:grid-cols-[1.2fr_1fr_1.8fr_1.5fr_1fr_1.5fr] md:items-center"
                >
                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 md:hidden">
                      DATE
                    </p>

                    <p className="text-sm text-[#263451]">
                      {formatDate(booking.booking_date)}
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

                  {/* Subject */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 md:hidden">
                      SUBJECT
                    </p>

                    <p className="text-sm text-[#263451]">
                      {booking.subject || "Consultation"}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 md:hidden">
                      STATUS
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
                        booking.status.toLowerCase() ===
                        "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status.toLowerCase() ===
                            "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status.toLowerCase() ===
                            "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-400 md:hidden">
                      ACTION
                    </p>

                    {booking.status.toLowerCase() !==
                    "cancelled" ? (
                      <div className="flex flex-wrap gap-2">

                        <Link
                          href={`/student/reschedule/${booking.id}`}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          Reschedule
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            cancelBooking(booking.id)
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Cancel
                        </button>

                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        No actions
                      </span>
                    )}
                  </div>
                </div>
              ))}

            {/* No Bookings */}
            {!loading &&
              !message &&
              bookings.length === 0 && (
                <div className="p-10 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    You currently have no bookings.
                  </p>

                  <Link
                    href="/student/lecturers"
                    className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Book a Consultation
                  </Link>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}