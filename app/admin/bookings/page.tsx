
"use client";

import { useState } from "react";
import Link from "next/link";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

type Booking = {
  id: number;
  student: string;
  lecturer: string;
  subject: string;
  date: string;
  time: string;
  status: BookingStatus;
};

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      student: "Manpreet Singh",
      lecturer: "Dr. Aroba Khan",
      subject: "Database Systems",
      date: "May 15, 2026",
      time: "10:00 AM",
      status: "CONFIRMED",
    },
    {
      id: 2,
      student: "Abhideep Lamichhane",
      lecturer: "Dr. Swami Prasad",
      subject: "Software Development",
      date: "May 16, 2026",
      time: "02:00 PM",
      status: "PENDING",
    },
    {
      id: 3,
      student: "Manpreet Singh",
      lecturer: "Dr. Sarah Williams",
      subject: "Programming",
      date: "May 20, 2026",
      time: "11:00 AM",
      status: "PENDING",
    },
    {
      id: 4,
      student: "Abhideep Lamichhane",
      lecturer: "Dr. Michael Brown",
      subject: "Networking",
      date: "May 22, 2026",
      time: "01:00 PM",
      status: "CANCELLED",
    },
  ]);

  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.toLowerCase();

    return (
      booking.student.toLowerCase().includes(searchText) ||
      booking.lecturer.toLowerCase().includes(searchText) ||
      booking.subject.toLowerCase().includes(searchText) ||
      booking.status.toLowerCase().includes(searchText)
    );
  });

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  ).length;

  const updateStatus = (id: number, status: BookingStatus) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-[#172544] text-white">
        {/* Logo */}
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

          {/* Admin */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d97706] font-bold">
              AU
            </div>

            <div>
              <p className="text-sm font-semibold">Admin User</p>

              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
            className="block border-l-4 border-blue-500 bg-white/10 px-7 py-4 text-sm font-semibold"
          >
            • Bookings
          </Link>

          <Link
            href="/admin/reports"
            className="block border-l-4 border-transparent px-7 py-4 text-sm text-slate-300 hover:bg-white/5"
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
      <main className="ml-64 min-h-screen">
        {/* Topbar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-7">
          <div>
            <h1 className="text-2xl font-bold text-[#263451]">
              Manage Bookings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all consultation bookings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d97706] font-semibold text-white">
              AU
            </div>

            <div>
              <p className="font-semibold text-[#263451]">
                Admin User
              </p>

              <p className="text-sm text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </header>

        <div className="p-7">
          {/* Statistics */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                TOTAL BOOKINGS
              </p>

              <p className="mt-2 text-3xl font-bold text-[#263451]">
                {bookings.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                CONFIRMED
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {confirmedBookings}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                PENDING
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {pendingBookings}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                CANCELLED
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {cancelledBookings}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-7">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, lecturer, subject or status..."
              className="w-full max-w-xl rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Bookings Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#172544] text-left text-xs font-bold tracking-wider text-white">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">STUDENT</th>
                    <th className="px-5 py-4">LECTURER</th>
                    <th className="px-5 py-4">SUBJECT</th>
                    <th className="px-5 py-4">DATE</th>
                    <th className="px-5 py-4">TIME</th>
                    <th className="px-5 py-4">STATUS</th>
                    <th className="px-5 py-4">ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-t border-slate-200 text-sm"
                    >
                      <td className="px-5 py-4 text-slate-500">
                        #{booking.id}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#263451]">
                        {booking.student}
                      </td>

                      <td className="px-5 py-4 text-[#263451]">
                        {booking.lecturer}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {booking.subject}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {booking.date}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {booking.time}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            booking.status === "CONFIRMED"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {booking.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updateStatus(
                                  booking.id,
                                  "CONFIRMED"
                                )
                              }
                              className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100"
                            >
                              CONFIRM
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(
                                  booking.id,
                                  "CANCELLED"
                                )
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                No bookings found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

