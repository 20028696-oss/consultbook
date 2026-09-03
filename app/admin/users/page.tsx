
"use client";

import { useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  role: "Student" | "Lecturer" | "Admin";
  status: "Active" | "Inactive";
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Manpreet Singh",
      email: "manpreet@gmail.com",
      role: "Student",
      status: "Active",
    },
    {
      id: 2,
      name: "Abhideep Lamichhane",
      email: "abhi@gmail.com",
      role: "Student",
      status: "Active",
    },
    {
      id: 3,
      name: "Dr. Aroba Khan",
      email: "aroba@gmail.com",
      role: "Lecturer",
      status: "Active",
    },
    {
      id: 4,
      name: "Admin User",
      email: "admin@gmail.com",
      role: "Admin",
      status: "Active",
    },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = users.length;
  const students = users.filter((user) => user.role === "Student").length;
  const lecturers = users.filter((user) => user.role === "Lecturer").length;
  const admins = users.filter((user) => user.role === "Admin").length;

  const toggleStatus = (id: number) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
  };

  const handleAddUser = () => {
    alert("Add User feature will be connected to the backend.");
  };

  const handleEdit = (name: string) => {
    alert(`Edit ${name}`);
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
            className="block border-l-4 border-blue-500 bg-white/10 px-7 py-4 text-sm font-semibold"
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
            className="block border-l-4 border-transparent px-7 py-4 text-sm text-slate-300 hover:bg-white/5"
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

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Topbar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-7">
          <h1 className="text-2xl font-bold text-[#263451]">
            Manage Users
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
          {/* Search and Actions */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">
            <div className="relative w-full max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => alert("Export feature will be connected to the backend.")}
                className="rounded-xl border border-[#263451] bg-white px-5 py-3 text-sm font-semibold text-[#263451]"
              >
                Export
              </button>

              <button
                onClick={handleAddUser}
                className="rounded-xl bg-[#2f63c8] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add User
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                TOTAL USERS
              </p>
              <p className="mt-2 text-2xl font-bold text-[#263451]">
                {totalUsers}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                STUDENTS
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {students}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                LECTURERS
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {lecturers}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-slate-500">
                ADMINS
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-500">
                {admins}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#172544] text-left text-xs font-bold tracking-wider text-white">
                  <tr>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">NAME</th>
                    <th className="px-5 py-4">EMAIL</th>
                    <th className="px-5 py-4">ROLE</th>
                    <th className="px-5 py-4">STATUS</th>
                    <th className="px-5 py-4">ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-t border-slate-200 text-sm"
                    >
                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#263451]">
                        {user.name}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.role === "Student"
                              ? "bg-blue-50 text-blue-700"
                              : user.role === "Lecturer"
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.status === "Active"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {user.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user.name)}
                            className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            EDIT
                          </button>

                          <button
                            onClick={() => toggleStatus(user.id)}
                            className={`rounded-lg px-4 py-2 text-xs font-bold ${
                              user.status === "Active"
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {user.status === "Active"
                              ? "DEACTIVATE"
                              : "ACTIVATE"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

