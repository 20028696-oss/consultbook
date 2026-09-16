type AdminTopbarProps = {
  name?: string;
  title?: string;
};

export default function AdminTopbar({
  name = "Admin User",
  title = "Admin Dashboard",
}: AdminTopbarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-[84px] items-center justify-between border-b border-slate-200 bg-white px-8">
      <h1 className="text-2xl font-bold text-[#14244a]">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
          {initials || "A"}
        </div>

        <div>
          <p className="text-sm font-bold text-[#14244a]">
            {name}
          </p>

          <p className="text-xs text-slate-500">
            Administrator
          </p>
        </div>
      </div>
    </header>
  );
}