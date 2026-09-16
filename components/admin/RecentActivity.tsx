type Activity = {
  type: string;
  title: string;
  description: string;
  created_at: string;
};

type RecentActivityProps = {
  activities: Activity[];
  loading?: boolean;
};

export default function RecentActivity({
  activities,
  loading = false,
}: RecentActivityProps) {
  const formatActivityDate = (
    value: string
  ) => {
    if (!value) return "";

    const date =
      new Date(value);

    const now =
      new Date();

    if (
      date.toDateString() ===
      now.toDateString()
    ) {
      return "Today";
    }

    return date.toLocaleDateString(
      "en-AU",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-lg font-bold text-[#14244a]">
          Recent Activity
        </h2>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Loading recent activity...
        </div>
      ) : activities.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No recent activity found.
        </div>
      ) : (
        activities.map(
          (
            activity,
            index
          ) => (
            <div
              key={`${activity.type}-${activity.created_at}-${index}`}
              className="flex items-center justify-between gap-5 border-b border-slate-200 px-6 py-5 last:border-b-0"
            >
              <div>
                <p className="text-sm font-bold text-[#263451]">
                  {activity.title}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {activity.description}
                </p>
              </div>

              <span className="shrink-0 text-sm text-slate-400">
                {formatActivityDate(
                  activity.created_at
                )}
              </span>
            </div>
          )
        )
      )}
    </div>
  );
}