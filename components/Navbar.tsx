import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white px-8 py-5 lg:px-16">

      {/* Logo */}
      <Link href="/">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">
            ConsultBook
          </h1>

          <p className="text-sm text-gray-500">
            Book & Consult Platform
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <div className="hidden items-center gap-10 lg:flex">

        <Link
          href="/"
          className="text-slate-700 hover:text-blue-600"
        >
          Home
        </Link>

        <a
          href="#about"
          className="text-slate-700 hover:text-blue-600"
        >
          About
        </a>

        <a
          href="#students"
          className="text-slate-700 hover:text-blue-600"
        >
          For Students
        </a>

        <a
          href="#lecturers"
          className="text-slate-700 hover:text-blue-600"
        >
          For Lecturers
        </a>

        <a
          href="#contact"
          className="text-slate-700 hover:text-blue-600"
        >
          Contact
        </a>

      </div>

      {/* Login / Register */}
      <div className="flex gap-4">

        <Link
          href="/login"
          className="rounded-lg border border-blue-600 px-6 py-3 text-blue-600 transition hover:bg-blue-50"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
        >
          Get Started
        </Link>

      </div>

    </nav>
  );
}