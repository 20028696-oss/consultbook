"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentSidebar() {
     
    const router = useRouter();

const handleLogout = () => {
  router.push("/login");
};
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-[#0b1b41] text-white">
      <div className="px-7 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2463eb] text-lg font-bold">
            C
          </div>

          <span className="text-lg font-bold">
            ConsultBook
          </span>
        </div>

        <p className="mt-2 text-[10px] text-slate-400">
          Book & Consult Platform
        </p>
      </div>

      <nav className="mt-2 flex-1">
        <Link
          href="/student/dashboard"
          className="relative flex h-12 items-center gap-3 bg-[#1c2d55] px-4 text-sm font-semibold text-white"
        >
          <span className="absolute left-0 h-full w-1 bg-[#2463eb]" />
          <span className="text-xs">●</span>
          Dashboard
        </Link>

        <Link
          href="/student/lecturers"
          className="flex h-12 items-center gap-3 px-4 text-sm text-slate-400 hover:bg-[#16284f] hover:text-white"
        >
          <span className="text-xs">●</span>
          Book Session
        </Link>

        <Link
          href="/student/bookings"
          className="flex h-12 items-center gap-3 px-4 text-sm text-slate-400 hover:bg-[#16284f] hover:text-white"
        >
          <span className="text-xs">●</span>
          My Bookings
        </Link>

        <Link
          href="/student/profile"
          className="flex h-12 items-center gap-3 px-4 text-sm text-slate-400 hover:bg-[#16284f] hover:text-white"
        >
          <span className="text-xs">●</span>
          Profile
        </Link>

        <Link
          href="#"
          className="flex h-12 items-center gap-3 px-4 text-sm text-slate-400 hover:bg-[#16284f] hover:text-white"
        >
          <span className="text-xs">●</span>
          Help & Support
        </Link>
      </nav>

      <div className="px-7 pb-7">
        <div className="mb-5 h-px bg-slate-700" />

        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-white"
        >
          → Logout
        </button>
      </div>
    </aside>
  );
}