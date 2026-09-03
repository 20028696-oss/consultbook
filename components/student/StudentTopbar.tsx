export default function StudentTopbar() {
  return (
    <header className="fixed left-60 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-7">
      <h1 className="text-xl font-bold text-[#14244a]">
        Student Dashboard
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2463eb] text-sm font-bold text-white">
          MS
        </div>

        <div>
          <p className="text-sm font-bold text-[#14244a]">
            Manpreet Singh
          </p>

          <p className="text-xs text-slate-400">
            Student
          </p>
        </div>
      </div>
    </header>
  );
}