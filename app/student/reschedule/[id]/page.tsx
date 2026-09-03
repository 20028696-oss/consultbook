
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import { supabase } from "@/lib/supabase/client";

type Booking = {
  id: number;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
};

const timeSlots = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "04:00 PM",
];

export default function ReschedulePage() {
  const params = useParams();
  const router = useRouter();

  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getBooking();
  }, []);

  const getBooking = async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) {
        console.error("Error loading booking:", error);
        setBooking(null);
        return;
      }

      setBooking(data);

      // Set current booking values
      setSelectedDate(data.booking_date);
      setSelectedTime(data.booking_time);
    } catch (error) {
      console.error("Something went wrong:", error);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
  if (!booking) return;

  if (!selectedDate || !selectedTime) {
    setMessage("Please select a new date and time.");
    return;
  }

  setSaving(true);
  setMessage("");

  try {
    const response = await fetch(
      `/api/bookings/${booking.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_date: selectedDate,
          booking_time: selectedTime,
          status: "pending",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.message || "Failed to reschedule booking."
      );
      return;
    }

    setMessage(
      "Your booking has been rescheduled successfully and is now pending approval."
    );

    setTimeout(() => {
      router.push("/student/bookings");
    }, 1500);
  } catch (error) {
    console.error("Reschedule error:", error);

    setMessage(
      "Something went wrong. Please try again."
    );
  } finally {
    setSaving(false);
  }
};

  const formatDate = (date: string) => {
    if (!date) return "";

    return new Date(date + "T00:00:00").toLocaleDateString(
      "en-AU",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <StudentSidebar />
        <StudentTopbar />

        <main className="ml-60 pt-20">
          <div className="p-7 text-sm text-slate-500">
            Loading booking...
          </div>
        </main>
      </div>
    );
  }

  /* Booking not found */
  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <StudentSidebar />
        <StudentTopbar />

        <main className="ml-60 pt-20">
          <div className="p-7">
            <h1 className="text-2xl font-bold text-[#14244a]">
              Booking Not Found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              The booking you are trying to reschedule could not be found.
            </p>

            <Link
              href="/student/bookings"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to My Bookings
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="p-7">

          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-sm">
              <Link
                href="/student/dashboard"
                className="font-semibold text-blue-600"
              >
                Dashboard
              </Link>

              <span className="text-slate-400"> › </span>

              <Link
                href="/student/bookings"
                className="font-semibold text-blue-600"
              >
                My Bookings
              </Link>

              <span className="text-slate-400">
                {" "}› Reschedule
              </span>
            </p>

            <h1 className="mt-4 text-2xl font-bold text-[#14244a]">
              Reschedule Booking
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Change the date or time of your consultation.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Reschedule Form */}
            <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-2">

              <h2 className="text-lg font-bold text-[#14244a]">
                Reschedule Consultation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a new date and available time.
              </p>

              {/* Current booking */}
              <div className="mt-6 rounded-lg bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Current Booking
                </p>

                <h3 className="mt-2 text-base font-bold text-[#14244a]">
                  {booking.subject || "Consultation"}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {booking.lecturer_name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(booking.booking_date)} •{" "}
                  {booking.booking_time}
                </p>
              </div>

              {/* Date */}
              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select New Date
                </label>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Available times */}
              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Available Time
                </label>

                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                        selectedTime === time
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-[#14244a] hover:border-blue-500"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleReschedule}
                disabled={saving}
                className="mt-7 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving
                  ? "Rescheduling..."
                  : "Confirm Reschedule"}
              </button>

              {message && (
                <div className="mt-4 rounded-lg bg-green-50 p-4 text-center text-sm font-semibold text-green-600">
                  {message}
                </div>
              )}

              <div className="mt-4 text-center">
                <Link
                  href="/student/bookings"
                  className="text-sm font-semibold text-slate-500 hover:text-blue-600"
                >
                  ← Back to My Bookings
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-[#14244a]">
                Booking Summary
              </h2>

              <div className="mt-5 border-t border-slate-200 pt-5">

                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400">
                    LECTURER
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#14244a]">
                    {booking.lecturer_name}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400">
                    SUBJECT
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#14244a]">
                    {booking.subject || "Consultation"}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400">
                    NEW DATE
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#14244a]">
                    {formatDate(selectedDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    NEW TIME
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#14244a]">
                    {selectedTime}
                  </p>
                </div>

              </div>

              <div className="mt-6 rounded-lg bg-yellow-50 p-4">
                <p className="text-xs font-semibold text-yellow-700">
                  ⚠ Rescheduling will change the booking status back to pending for lecturer approval.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

