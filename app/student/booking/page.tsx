"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import { supabase } from "@/lib/supabase/client";

const lecturers = [
  {
    id: 1,
    name: "Dr. Aroba Khan",
    subject: "Database Systems",
    initials: "AK",
  },
  {
    id: 2,
    name: "Dr. Swami Prasad",
    subject: "Software Development",
    initials: "SP",
  },
  {
    id: 3,
    name: "Dr. Sarah Williams",
    subject: "Programming",
    initials: "SW",
  },
  {
    id: 4,
    name: "Dr. Michael Brown",
    subject: "Networking",
    initials: "MB",
  },
];

const timeSlots = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "04:00 PM",
];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lecturerId = searchParams.get("lecturer");
  const timeFromUrl = searchParams.get("time");

  const lecturer =
    lecturers.find(
      (item) => item.id === Number(lecturerId)
    ) || lecturers[0];

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedTime, setSelectedTime] = useState(
    timeFromUrl || "10:00 AM"
  );

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const confirmBooking = async () => {
  setMessage("");
  setSuccess(false);

  if (!selectedDate || !selectedTime || !lecturer) {
    setMessage(
      "Please provide all required booking information."
    );
    return;
  }

  setLoading(true);

  try {
    // Get currently logged-in student
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(
        "You must be logged in as a student to make a booking."
      );
      return;
    }

    // Check account role
    const role =
      user.user_metadata?.role
        ?.toString()
        .toLowerCase();

    if (role !== "student") {
      setMessage(
        "Only student accounts can create bookings."
      );
      return;
    }

    // Get logged-in student's name
    const studentName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student";

    // Create booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          // IMPORTANT:
          // booking belongs to currently logged-in student
          student_id: user.id,

          student_name: studentName,

          lecturer_id: lecturer.id,
          lecturer_name: lecturer.name,

          subject: lecturer.subject,

          booking_date: selectedDate,
          booking_time: selectedTime,

          reason: reason.trim() || null,

          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(
        "Booking creation error:",
        error
      );

      setMessage(error.message);
      return;
    }

    console.log(
      "Booking created:",
      data
    );

    setSuccess(true);
    setReason("");

    setTimeout(() => {
      router.push(
        "/student/bookings"
      );

      router.refresh();
    }, 1500);

  } catch (error) {
    console.error(
      "Unexpected booking error:",
      error
    );

    setMessage(
      "Something went wrong while creating your booking. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="grid gap-6 p-7 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-2">
            <h1 className="text-2xl font-bold text-[#14244a]">
              Book a Consultation
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Fill in the details below to request a session.
            </p>

            {/* Lecturer */}
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500">
                SELECTED LECTURER
              </p>

              <div className="flex items-center gap-3 rounded-lg border-2 border-blue-500 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {lecturer.initials}
                </div>

                <div>
                  <p className="font-semibold text-[#263451]">
                    {lecturer.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {lecturer.subject}
                  </p>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500">
                SELECT DATE
              </p>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#263451] outline-none focus:border-blue-500"
              />
            </div>

            {/* Time */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold tracking-wider text-slate-500">
                AVAILABLE SLOTS
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                      selectedTime === time
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-[#263451] hover:border-blue-400"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500">
                REASON (OPTIONAL)
              </p>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`e.g. Need help with ${lecturer.subject}...`}
                className="h-28 w-full resize-none rounded-lg border border-slate-300 p-4 text-sm text-[#263451] outline-none focus:border-blue-500"
              />
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={confirmBooking}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Submitting..." : "Confirm Booking"}
            </button>

            {/* Error Message */}
            {message && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
                {message}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm font-semibold text-green-700">
                Booking request submitted successfully! Redirecting to My
                Bookings...
              </div>
            )}

            <p className="mt-4 text-center text-xs text-slate-500">
              Your booking will remain pending until the lecturer approves or
              rejects your request.
            </p>
          </div>

          {/* Booking Summary */}
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#14244a]">
              Booking Summary
            </h2>

            <div className="my-5 border-t border-slate-200" />

            <div className="rounded-xl bg-slate-100 p-5">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Lecturer
                </span>

                <span className="text-right text-sm font-bold text-[#263451]">
                  {lecturer.name}
                </span>
              </div>

              <div className="mt-5 flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Subject
                </span>

                <span className="text-right text-sm font-bold text-[#263451]">
                  {lecturer.subject}
                </span>
              </div>

              <div className="mt-5 flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Date
                </span>

                <span className="text-sm font-bold text-[#263451]">
                  {selectedDate}
                </span>
              </div>

              <div className="mt-5 flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Time
                </span>

                <span className="text-sm font-bold text-[#263451]">
                  {selectedTime}
                </span>
              </div>

              <div className="mt-5 flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Duration
                </span>

                <span className="text-sm font-bold text-[#263451]">
                  30 minutes
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                  PENDING
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
              ⚠ The lecturer will review your booking request.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
