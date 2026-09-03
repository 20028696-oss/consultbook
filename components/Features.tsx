export default function Features() {
  return (
    <section className="py-24 bg-white">

      <h2 className="text-5xl font-bold text-center mb-16">
        Who can use ConsultBook?
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 px-8">

        <div className="border rounded-3xl p-10 shadow">
          <h3 className="text-2xl font-bold mb-4">
            🎓 Students
          </h3>
          <p>
            Book consultations with lecturers quickly and easily.
          </p>
        </div>

        <div className="border rounded-3xl p-10 shadow">
          <h3 className="text-2xl font-bold mb-4">
            👨‍🏫 Lecturers
          </h3>
          <p>
            Manage availability and approve consultation requests.
          </p>
        </div>

        <div className="border rounded-3xl p-10 shadow">
          <h3 className="text-2xl font-bold mb-4">
            ⚙️ Administrators
          </h3>
          <p>
            Manage users, reports, and platform settings.
          </p>
        </div>

      </div>

    </section>
  );
}