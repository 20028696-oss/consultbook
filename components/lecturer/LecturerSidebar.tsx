"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const items = [
  {
    label: "Dashboard",
    href: "/lecturer/dashboard",
  },
  {
    label: "Booking Requests",
    href: "/lecturer/bookings",
  },
  {
    label: "Availability",
    href: "/lecturer/availability",
  },
  {
    label: "Consultation Notes",
    href: "/lecturer/consultation-notes",
  },
  {
    label: "Consultation History",
    href: "/lecturer/history",
  },
  {
    label: "Profile",
    href: "/lecturer/profile",
  },
];

export default function LecturerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex min-h-screen w-[220px] shrink-0 flex-col bg-[#0D193C] px-4 py-6">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2A5FE4] font-bold text-white">
          C
        </div>

        <div>
          <p className="font-semibold text-white">
            ConsultBook
          </p>

          <p className="text-[10px] text-slate-400">
            Lecturer Portal
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-3 text-sm transition ${
                active
                  ? "bg-white/10 font-semibold text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}