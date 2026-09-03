"use client";

type Availability = {
  availability_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "-";

  const [hourString, minuteString] = time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute
    .toString()
    .padStart(2, "0")} ${period}`;
}

export default function AvailabilityList({
  slots,
  onDelete,
  deletingId,
}: {
  slots: Availability[];
  onDelete: (id: string) => void;
  deletingId?: string | null;
}) {
  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          No availability slots added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_1fr] bg-[#0D193C] px-5 py-4 text-xs font-bold tracking-wider text-white md:grid">
        <span>DATE</span>
        <span>START</span>
        <span>END</span>
        <span>STATUS</span>
        <span>ACTION</span>
      </div>

      {slots.map((slot) => (
        <div
          key={slot.availability_id}
          className="grid grid-cols-1 gap-4 border-t border-slate-200 px-5 py-5 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:items-center"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 md:hidden">
              DATE
            </p>

            <p className="text-sm font-semibold text-[#263451]">
              {formatDate(slot.date)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 md:hidden">
              START
            </p>

            <p className="text-sm text-[#263451]">
              {formatTime(slot.start_time)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 md:hidden">
              END
            </p>

            <p className="text-sm text-[#263451]">
              {formatTime(slot.end_time)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 md:hidden">
              STATUS
            </p>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                slot.is_available
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {slot.is_available ? "AVAILABLE" : "UNAVAILABLE"}
            </span>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-slate-400 md:hidden">
              ACTION
            </p>

            <button
              type="button"
              onClick={() => onDelete(slot.availability_id)}
              disabled={deletingId === slot.availability_id}
              className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId === slot.availability_id
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}