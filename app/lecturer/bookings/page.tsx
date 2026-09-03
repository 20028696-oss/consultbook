"use client";

import { useEffect, useState } from "react";
import LecturerSidebar from "@/components/lecturer/LecturerSidebar";
import LecturerTopbar from "@/components/lecturer/LecturerTopbar";
import { supabase } from "@/lib/supabase/client";

type Booking = {
  id: number;
  student_name: string;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  reason: string | null;
  status: string;
};

export default function LecturerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lecturerName, setLecturerName] = useState("Lecturer");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Lecturer is not authenticated.");
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Lecturer";

      setLecturerName(name);

      const response = await fetch("/api/bookings", {
        cache: "no-store",
      });

      const result = await response.json();

      const allBookings: Booking[] = Array.isArray(result)
        ? result
        : result.bookings || [];

      setBookings(
        allBookings.filter(
          (booking) =>
            booking.lecturer_name?.toLowerCase() === name.toLowerCase()
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to load booking requests.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    bookingId: number,
    status: "confirmed" | "cancelled" | "completed"
  ) => {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update booking.");
      return;
    }

    await loadBookings();
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <LecturerSidebar />

      <main className="flex-1 px-8 py-6">
        <LecturerTopbar
          name={lecturerName}
          title="Booking Requests"
        />

        <h1 className="text-2xl font-bold text-[#14244a]">
          Student Booking Requests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review and manage consultation requests from students.
        </p>

        {message && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {message}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-xl border bg-white">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No booking requests found.
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="border-b border-slate-200 p-5 last:border-b-0"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h2 className="font-bold text-[#14244a]">
                      {booking.subject || "Consultation"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      Student: {booking.student_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {booking.booking_date} • {booking.booking_time}
                    </p>

                    {booking.reason && (
                      <p className="mt-2 text-sm text-slate-500">
                        Reason: {booking.reason}
                      </p>
                    )}

                    <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                      {booking.status}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        updateStatus(booking.id, "confirmed")
                      }
                      className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(booking.id, "cancelled")
                      }
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(booking.id, "completed")
                      }
                      className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}