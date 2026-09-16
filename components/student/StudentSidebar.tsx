"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
  },
  {
    label: "Book Session",
    href: "/student/lecturers",
  },
  {
    label: "My Bookings",
    href: "/student/bookings",
  },
  {
    label: "Notifications",
    href: "/student/notifications",
  },
  {
    label: "Profile",
    href: "/student/profile",
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-[#0b1b41] text-white">

      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-6">

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            C
          </div>

          <div>
            <h2 className="font-bold">
              ConsultBook
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Book & Consult Platform
            </p>
          </div>
        </Link>

      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-col">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(
              `${item.href}/`
            );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-5 py-4 text-sm transition ${
                active
                  ? "bg-white/10 font-semibold text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              • {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-white/10 p-5">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          Logout
        </button>
      </div>

    </aside>
  );
}