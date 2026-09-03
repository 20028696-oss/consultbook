function getInitials(name: string) {
  return (
    name
      .replace("Dr.", "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((item) => item[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "LE"
  );
}

export default function LecturerTopbar({
  name,
  title,
}: {
  name: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-lg font-bold text-[#14244a]">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A5FE4] font-semibold text-white">
          {getInitials(name)}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {name}
          </p>

          <p className="text-xs text-slate-500">
            Lecturer
          </p>
        </div>
      </div>
    </div>
  );
}