export default function Features() {
  return (
    <section className="bg-white py-24">

      <h2 className="mb-16 text-center text-5xl font-bold text-[#14244a]">
        Who can use ConsultBook?
      </h2>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 md:grid-cols-3">

        {/* Students */}
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow">
          <h3 className="mb-4 text-2xl font-bold text-[#14244a]">
            🎓 Students
          </h3>

          <p className="leading-7 text-slate-600">
            Book consultations with lecturers quickly and easily.
          </p>
        </div>

        {/* Lecturers */}
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow">
          <h3 className="mb-4 text-2xl font-bold text-[#14244a]">
            👨‍🏫 Lecturers
          </h3>

          <p className="leading-7 text-slate-600">
            Manage availability and approve consultation requests.
          </p>
        </div>

        {/* Administrators */}
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow">
          <h3 className="mb-4 text-2xl font-bold text-[#14244a]">
            ⚙️ Administrators
          </h3>

          <p className="leading-7 text-slate-600">
            Manage users, reports, and platform settings.
          </p>
        </div>

      </div>

    </section>
  );
}