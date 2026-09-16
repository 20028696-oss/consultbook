"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type AdminSidebarProps = {
  name?: string;
};

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    label: "Users",
    href: "/admin/users",
  },
  {
    label: "Reports",
    href: "/admin/reports",
  },
  {
    label: "Profile",
    href: "/admin/profile",
  },
];

export default function AdminSidebar({
  name = "Admin User",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[240px] flex-col bg-[#152747] text-white">

      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">
            C
          </div>

          <div>
            <p className="font-bold">
              ConsultBook
            </p>

            <p className="text-xs text-slate-400">
              Book & Consult Platform
            </p>
          </div>
        </div>

        {/* Admin */}
        <div className="mt-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold">
            {initials || "A"}
          </div>

          <div>
            <p className="text-sm font-semibold">
              {name}
            </p>

            <p className="text-xs text-slate-400">
              Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex flex-col">
        {navItems.map((item) => {
          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-6 py-4 text-sm transition ${
                active
                  ? "bg-white/10 font-semibold text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
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
          onClick={handleLogout}
          className="w-full rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}