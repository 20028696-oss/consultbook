
"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-[#162544] text-white">
        {/* Logo */}
        <div className="border-b border-white/10 px-7 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f63c8] text-lg font-bold">
              C
            </div>

            <div>
              <h1 className="text-xl font-bold">ConsultBook</h1>
              <p className="mt-1 text-xs text-slate-400">
                Book & Consult Platform
              </p>
            </div>
          </div>

          {/* Admin */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d97706] font-bold">
              AU
            </div>

            <div>
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex flex-col">
          <Link
            href="/admin/dashboard"
            className="border-l-4 border-blue-500 bg-white/10 px-7 py-4 text-sm font-semibold"
          >
            • Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="border-l-4 border-transparent px-7 py-4 text-sm text-slate-300 hover:bg-white/5"
          >
            • Users
          </Link>

          <Link
            href="/admin/bookings"
            className="border-l-4 border-transparent px-7 py-4 text-sm text-slate-300 hover:bg-white/5"
          >
            • Bookings
          </Link>

          <Link
            href="/admin/reports"
            className="border-l-4 border-transparent px-7 py-4 text-sm text-slate-300 hover:bg-white/5"
          >
            • Reports
          </Link>
        </nav>

        {/* Logout */}
        <div className="mt-auto border-t border-white/10 p-6">
          <Link
            href="/login"
            className="block rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-semibold text-slate-300 hover:bg-white/10"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex-1">
        {/* Topbar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-7">
          <h2 className="text-2xl font-bold text-[#263451]">
            Admin Dashboard
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d97706] font-semibold text-white">
              AU
            </div>

            <div>
              <p className="font-semibold text-[#263451]">Admin User</p>
              <p className="text-sm text-slate-500">Administrator</p>
            </div>
          </div>
        </header>

        <div className="p-7">
          {/* Welcome */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#263451]">
              Welcome back, Admin!
            </h1>

            <p className="mt-2 text-slate-500">
              Monitor and manage your ConsultBook platform.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                TOTAL USERS
              </p>

              <p className="mt-3 text-4xl font-bold text-[#263451]">
                4
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Registered users
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                STUDENTS
              </p>

              <p className="mt-3 text-4xl font-bold text-blue-600">
                2
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Active students
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                LECTURERS
              </p>

              <p className="mt-3 text-4xl font-bold text-green-600">
                1
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Active lecturers
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                BOOKINGS
              </p>

              <p className="mt-3 text-4xl font-bold text-orange-500">
                2
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Total consultations
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#263451]">
              Quick Actions
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage important areas of the platform.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link
                href="/admin/users"
                className="rounded-xl bg-[#2f63c8] p-5 text-center font-semibold text-white hover:bg-blue-700"
              >
                Manage Users →
              </Link>

              <Link
                href="/admin/bookings"
                className="rounded-xl border border-blue-600 p-5 text-center font-semibold text-blue-700 hover:bg-blue-50"
              >
                View Bookings →
              </Link>

              <Link
                href="/admin/reports"
                className="rounded-xl border border-blue-600 p-5 text-center font-semibold text-blue-700 hover:bg-blue-50"
              >
                Generate Reports →
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-7 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-[#263451]">
                Recent Activity
              </h2>
            </div>

            <div className="divide-y divide-slate-200">
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-[#263451]">
                    New student account registered
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    A new student joined ConsultBook.
                  </p>
                </div>

                <span className="text-sm text-slate-400">
                  Today
                </span>
              </div>

              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-[#263451]">
                    New consultation booking created
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    A student requested a consultation.
                  </p>
                </div>

                <span className="text-sm text-slate-400">
                  Today
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

