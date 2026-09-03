
"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("Bookings");
  const [message, setMessage] = useState("");

  const generateReport = () => {
    setMessage(`${reportType} report generated successfully.`);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-[#172544] text-white">
        <div className="border-b border-white/10 p-6">
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

        <nav className="mt-5">
          <Link
            href="/admin/dashboard"
            className="block border-l-4 border-transparent px-7 py-4 text-sm text-slate-300 hover:bg-white/5"
          >
            • Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="block border-l-4 border-transparent px-7 py-4 text-sm text-slate-300 hover:bg-white/5"
          >
            • Users
          </Link>

          <Link
            href="/admin/bookings"
            className="block border-l-4 border-transparent px-7 py-4 text-sm text-slate-300 hover:bg-white/5"
          >
            • Bookings
          </Link>

          <Link
            href="/admin/reports"
            className="block border-l-4 border-blue-500 bg-white/10 px-7 py-4 text-sm font-semibold"
          >
            • Reports
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/10 p-6">
          <Link
            href="/login"
            className="block rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-semibold text-slate-300 hover:bg-white/10"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 min-h-screen">
        {/* Topbar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-7">
          <h1 className="text-2xl font-bold text-[#263451]">
            Reports
          </h1>

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
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[#263451]">
              Generate Reports
            </h2>

            <p className="mt-2 text-slate-500">
              Generate reports for consultations, lecturers and students.
            </p>
          </div>

          {/* Report Statistics */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                TOTAL BOOKINGS
              </p>

              <p className="mt-3 text-4xl font-bold text-blue-600">
                24
              </p>

              <p className="mt-2 text-sm text-slate-400">
                All consultation requests
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                APPROVED BOOKINGS
              </p>

              <p className="mt-3 text-4xl font-bold text-green-600">
                18
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Successfully approved
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                PENDING BOOKINGS
              </p>

              <p className="mt-3 text-4xl font-bold text-orange-500">
                6
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Waiting for approval
              </p>
            </div>
          </div>

          {/* Generate Report */}
          <div className="mt-7 max-w-3xl rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-xl font-bold text-[#263451]">
              Create a New Report
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Select the type of report you want to generate.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500">
                REPORT TYPE
              </label>

              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm text-[#263451] outline-none focus:border-blue-500"
              >
                <option>Bookings</option>
                <option>Students</option>
                <option>Lecturers</option>
                <option>System Activity</option>
              </select>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500">
                  FROM DATE
                </label>

                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-300 px-4 py-4 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500">
                  TO DATE
                </label>

                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-300 px-4 py-4 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={generateReport}
              className="mt-7 w-full rounded-xl bg-[#2f63c8] py-4 font-semibold text-white hover:bg-blue-700"
            >
              Generate Report
            </button>

            {message && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-center text-sm font-semibold text-green-700">
                {message}
              </div>
            )}
          </div>

          {/* Available Reports */}
          <div className="mt-7 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-[#263451]">
                Available Reports
              </h3>
            </div>

            <div className="divide-y divide-slate-200">
              <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-[#263451]">
                    Booking Summary Report
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    View consultation booking activity.
                  </p>
                </div>

                <button
                  onClick={() =>
                    alert("Booking Summary Report downloaded.")
                  }
                  className="rounded-lg bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Download
                </button>
              </div>

              <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-[#263451]">
                    Student Activity Report
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    View student consultation activity.
                  </p>
                </div>

                <button
                  onClick={() =>
                    alert("Student Activity Report downloaded.")
                  }
                  className="rounded-lg bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Download
                </button>
              </div>

              <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-[#263451]">
                    Lecturer Activity Report
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    View lecturer consultation activity.
                  </p>
                </div>

                <button
                  onClick={() =>
                    alert("Lecturer Activity Report downloaded.")
                  }
                  className="rounded-lg bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

