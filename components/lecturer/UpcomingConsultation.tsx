import Link from "next/link";

type Booking = {
  id: number;
  student_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  reason: string | null;
  status: string;
};

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function UpcomingConsultation({
  booking,
}: {
  booking: Booking | null;
}) {
  if (!booking) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#14244a]">
          Upcoming Consultation
        </h2>

        <p className="mt-4 text-sm text-slate-500">
          No upcoming consultations.
        </p>
      </div>
    );
  }

  const status = booking.status?.toLowerCase() || "pending";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              status === "confirmed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {booking.status.toUpperCase()}
          </span>

          <h2 className="mt-4 text-xl font-bold text-[#14244a]">
            {booking.subject || "Consultation"}
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            Student: {booking.student_name}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            📅 {formatDate(booking.booking_date)}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            🕒 {booking.booking_time}
          </p>

          {booking.reason && (
            <p className="mt-3 text-sm text-slate-500">
              Reason: {booking.reason}
            </p>
          )}
        </div>
      </div>

      <Link
        href="/lecturer/bookings"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Review Booking
      </Link>
    </div>
  );
}