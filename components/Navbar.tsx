import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-16 py-5">
      <div>
        <h1 className="text-2xl font-bold text-blue-700">
          ConsultBook
        </h1>
        <p className="text-sm text-gray-500">
          Book & Consult Platform
        </p>
      </div>

      <div className="flex items-center gap-10">
        <Link href="/">Home</Link>
        <a href="#about">About</a>
        <a href="#students">For Students</a>
        <a href="#lecturers">For Lecturers</a>
        <a href="#contact">Contact</a>
      </div>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg border border-blue-600 px-6 py-3 text-blue-600"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}