"use client";

import { useEffect, useState } from "react";
import LecturerSidebar from "@/components/lecturer/LecturerSidebar";
import LecturerTopbar from "@/components/lecturer/LecturerTopbar";
import ConsultationNotesForm from "@/components/lecturer/ConsultationNotesForm";
import { supabase } from "@/lib/supabase/client";

type Booking = {
  id: number;
  student_name: string;
  subject: string | null;
  status: string;
};

export default function ConsultationNotesPage() {
  const [lecturerName, setLecturerName] = useState("Lecturer");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const name =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Lecturer";

    setLecturerName(name);

    const response = await fetch("/api/bookings");

    const result = await response.json();

    const allBookings = Array.isArray(result)
      ? result
      : result.bookings || [];

    const completed = allBookings.filter(
      (booking: any) =>
        booking.lecturer_name?.toLowerCase() === name.toLowerCase() &&
        booking.status?.toLowerCase() === "completed"
    );

    setBookings(completed);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <LecturerSidebar />

      <main className="flex-1 px-8 py-6">
        <LecturerTopbar
          name={lecturerName}
          title="Consultation Notes"
        />

        <h1 className="text-2xl font-bold text-[#14244a]">
          Add Consultation Notes
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Record notes after completed consultations.
        </p>

        <div className="mt-6 max-w-3xl">
          <label className="text-xs font-bold uppercase text-slate-500">
            Select Consultation
          </label>

          <select
            value={selectedBookingId ?? ""}
            onChange={(e) =>
              setSelectedBookingId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="mt-2 w-full rounded-lg border p-3"
          >
            <option value="">Select consultation</option>

            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.student_name} -{" "}
                {booking.subject || "Consultation"}
              </option>
            ))}
          </select>

          {selectedBookingId && (
            <div className="mt-5">
              <ConsultationNotesForm
                bookingId={selectedBookingId}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}