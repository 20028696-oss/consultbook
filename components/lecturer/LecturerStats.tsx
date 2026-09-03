type Props = {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
};

export default function LecturerStats({
  pending,
  confirmed,
  completed,
  cancelled,
}: Props) {
  const stats = [
    {
      title: "PENDING REQUESTS",
      value: pending,
    },
    {
      title: "CONFIRMED",
      value: confirmed,
    },
    {
      title: "COMPLETED",
      value: completed,
    },
    {
      title: "CANCELLED",
      value: cancelled,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-bold tracking-wider text-slate-500">
            {stat.title}
          </p>

          <p className="mt-3 text-3xl font-bold text-[#14244a]">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}