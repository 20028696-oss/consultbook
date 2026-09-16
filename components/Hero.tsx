import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#0d1b4c] py-24 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-8 lg:flex-row">

        {/* Left side */}
        <div className="max-w-xl">

          <span className="rounded-full bg-blue-800 px-4 py-2 text-sm">
            ACADEMIC CONSULTATION PLATFORM
          </span>

          <h1 className="mt-8 text-6xl font-bold leading-tight md:text-7xl">
            Book.
            <br />
            Consult.
            <br />
            <span className="text-blue-400">
              Succeed.
            </span>
          </h1>

          <p className="mt-8 text-xl leading-8 text-gray-300">
            Connect with lecturers, view real-time availability,
            book consultation sessions, and manage your bookings
            from one platform.
          </p>

          <div className="mt-10 flex flex-wrap gap-6">

            <Link
              href="/login"
              className="rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-700"
            >
              Book a Session
            </Link>

            <a
              href="#about"
              className="rounded-xl border border-white px-8 py-4 font-semibold transition hover:bg-white hover:text-[#0d1b4c]"
            >
              Learn More
            </a>

          </div>

          <p className="mt-6 text-sm text-gray-400">
            For students, lecturers and administrators
          </p>

        </div>

        {/* Right side dashboard preview */}
        <div className="w-full max-w-[460px] rounded-3xl bg-[#203268] p-10 shadow-2xl">

          <h3 className="mb-8 text-xl font-bold">
            ConsultBook Dashboard
          </h3>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">

            <div className="rounded-lg bg-green-200 p-4 text-center">
              <p className="text-lg font-bold text-green-700">
                12
              </p>
              <p className="mt-1 text-[11px] font-semibold text-green-800">
                Completed
              </p>
            </div>

            <div className="rounded-lg bg-yellow-200 p-4 text-center">
              <p className="text-lg font-bold text-yellow-700">
                5
              </p>
              <p className="mt-1 text-[11px] font-semibold text-yellow-800">
                Pending
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-4 text-center">
              <p className="text-lg font-bold text-blue-700">
                8
              </p>
              <p className="mt-1 text-[11px] font-semibold text-blue-800">
                Upcoming
              </p>
            </div>

            <div className="rounded-lg bg-red-200 p-4 text-center">
              <p className="text-lg font-bold text-red-700">
                2
              </p>
              <p className="mt-1 text-[11px] font-semibold text-red-800">
                Cancelled
              </p>
            </div>

          </div>

          <div className="rounded-xl bg-white p-4 text-[#14244a]">
            <p className="text-xs font-semibold text-slate-500">
              NEXT CONSULTATION
            </p>

            <p className="mt-2 font-bold">
              Database Systems
            </p>

            <p className="mt-1 text-sm text-slate-500">
              15 September 2026 · 10:00 AM
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-white p-4 text-[#14244a]">
            <p className="text-xs font-semibold text-slate-500">
              STATUS
            </p>

            <p className="mt-2 font-bold text-green-600">
              Confirmed
            </p>
          </div>

          <Link
            href="/login"
            className="mt-8 block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold transition hover:bg-blue-700"
          >
            Login to Book
          </Link>

        </div>

      </div>
    </section>
  );
}