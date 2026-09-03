"use client";

import Link from "next/link";
import LecturerStats from "@/components/lecturer/LecturerStats";
import BookingRequestsTable from "@/components/lecturer/BookingRequestsTable";

type Booking = {
  id: number;
  student_name: string;
  lecturer_id: number;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  reason: string | null;
  status: string;
};

type Props = {
  lecturerName: string;
  bookings: Booking[];
  loading?: boolean;
};

export default function LecturerDashboard({
  lecturerName,
  bookings,
  loading = false,
}: Props) {
  const normaliseStatus = (status: string) =>
    status?.toLowerCase() || "pending";

  const pending = bookings.filter(
    (booking) =>
      normaliseStatus(booking.status) === "pending"
  ).length;

  const confirmed = bookings.filter(
    (booking) =>
      normaliseStatus(booking.status) === "confirmed"
  ).length;

  const completed = bookings.filter(
    (booking) =>
      normaliseStatus(booking.status) === "completed"
  ).length;

  const cancelled = bookings.filter(
    (booking) =>
      normaliseStatus(booking.status) === "cancelled"
  ).length;

  const upcomingBookings = bookings
    .filter((booking) => {
      const status = normaliseStatus(booking.status);

      return (
        status === "pending" ||
        status === "confirmed"
      );
    })
    .sort((a, b) => {
      return (
        new Date(a.booking_date).getTime() -
        new Date(b.booking_date).getTime()
      );
    });

  const nextBooking = upcomingBookings[0];

  const firstName =
    lecturerName
      .replace("Dr.", "")
      .trim()
      .split(" ")[0] || "Lecturer";

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-AU",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-[#14244a]">
          Welcome back, {firstName}! 🎓
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your consultation requests, availability and
          student sessions.
        </p>
      </div>

      {/* Stats */}
      <LecturerStats
        pending={pending}
        confirmed={confirmed}
        completed={completed}
        cancelled={cancelled}
      />

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-[#14244a]">
          Quick Actions
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/lecturer/bookings"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h4 className="font-bold text-[#14244a]">
              Booking Requests
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Review, approve or reject student booking requests.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              Manage bookings →
            </p>
          </Link>

          <Link
            href="/lecturer/availability"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h4 className="font-bold text-[#14244a]">
              Availability
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Add and manage consultation time slots.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              Manage availability →
            </p>
          </Link>

          <Link
            href="/lecturer/consultation-notes"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h4 className="font-bold text-[#14244a]">
              Consultation Notes
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Record notes after completed consultations.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              Add notes →
            </p>
          </Link>
        </div>
      </div>

      {/* Next Consultation */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#14244a]">
            Next Consultation
          </h3>

          <Link
            href="/lecturer/bookings"
            className="text-sm font-semibold text-blue-600"
          >
            View all →
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-500">
              Loading consultation...
            </p>
          ) : nextBooking ? (
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    normaliseStatus(nextBooking.status) ===
                    "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {nextBooking.status.toUpperCase()}
                </span>

                <h4 className="mt-3 text-lg font-bold text-[#14244a]">
                  {nextBooking.subject || "Consultation"}
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  Student: {nextBooking.student_name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(nextBooking.booking_date)} •{" "}
                  {nextBooking.booking_time}
                </p>

                {nextBooking.reason && (
                  <p className="mt-2 text-sm text-slate-500">
                    Reason: {nextBooking.reason}
                  </p>
                )}
              </div>

              <Link
                href="/lecturer/bookings"
                className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
              >
                Review Booking
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No upcoming consultations.
            </p>
          )}
        </div>
      </div>

      {/* Recent Requests */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#14244a]">
            Recent Booking Requests
          </h3>

          <Link
            href="/lecturer/bookings"
            className="text-sm font-semibold text-blue-600"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading bookings...
          </div>
        ) : (
          <BookingRequestsTable
            bookings={bookings.slice(0, 5)}
          />
        )}
      </div>
    </div>
  );
}