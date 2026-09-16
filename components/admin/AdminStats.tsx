type AdminStatsProps = {
  totalUsers: number;
  students: number;
  lecturers: number;
  bookings: number;
  loading?: boolean;
};

export default function AdminStats({
  totalUsers,
  students,
  lecturers,
  bookings,
  loading = false,
}: AdminStatsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {/* Total Users */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Total Users
        </p>

        <p className="mt-4 text-4xl font-bold text-[#14244a]">
          {loading ? "..." : totalUsers}
        </p>

        <p className="mt-3 text-sm text-slate-500">
          Registered users
        </p>
      </div>

      {/* Students */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Students
        </p>

        <p className="mt-4 text-4xl font-bold text-blue-600">
          {loading ? "..." : students}
        </p>

        <p className="mt-3 text-sm text-slate-500">
          Active students
        </p>
      </div>

      {/* Lecturers */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Lecturers
        </p>

        <p className="mt-4 text-4xl font-bold text-green-600">
          {loading ? "..." : lecturers}
        </p>

        <p className="mt-3 text-sm text-slate-500">
          Active lecturers
        </p>
      </div>

      {/* Bookings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Bookings
        </p>

        <p className="mt-4 text-4xl font-bold text-orange-500">
          {loading ? "..." : bookings}
        </p>

        <p className="mt-3 text-sm text-slate-500">
          Total consultations
        </p>
      </div>
    </div>
  );
}