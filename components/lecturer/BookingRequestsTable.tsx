type Booking = {
  id: number;
  student_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
};

export default function BookingRequestsTable({
  bookings,
}: {
  bookings: Booking[];
}) {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-5 bg-[#0D193C] px-6 py-4 text-xs font-bold uppercase tracking-wide text-white">
        <span>STUDENT</span>
        <span>SUBJECT</span>
        <span>DATE</span>
        <span>TIME</span>
        <span>STATUS</span>
      </div>

      {/* Booking Rows */}
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="grid grid-cols-5 items-center border-t border-slate-200 bg-white px-6 py-5"
        >
          {/* Student */}
          <span className="text-sm font-medium text-slate-800">
            {booking.student_name}
          </span>

          {/* Subject */}
          <span className="text-sm font-medium text-slate-800">
            {booking.subject || "Consultation"}
          </span>

          {/* Date */}
          <span className="text-sm text-slate-700">
            {booking.booking_date}
          </span>

          {/* Time */}
          <span className="text-sm text-slate-700">
            {booking.booking_time}
          </span>

          {/* Status */}
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusStyle(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>
        </div>
      ))}

      {/* No Bookings */}
      {bookings.length === 0 && (
        <div className="bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            No booking requests found.
          </p>
        </div>
      )}
    </div>
  );
}