"use client";

import { useEffect, useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

import { supabase } from "@/lib/supabase/client";

type UserRole = "student" | "lecturer";

type UserItem = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
};

type FormState = {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  student_id: string;
  course: string;
  subject: string;
};

const emptyForm: FormState = {
  id: "",
  full_name: "",
  email: "",
  password: "",
  role: "student",
  student_id: "",
  course: "",
  subject: "",
};

export default function AdminUsersPage() {
  const [adminName, setAdminName] =
    useState("Admin User");

  const [users, setUsers] =
    useState<UserItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  useEffect(() => {
    loadUsers();
  }, []);

  const getSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      const session =
        await getSession();

      if (!session) {
        setMessage(
          "Admin is not authenticated."
        );
        return;
      }

      const adminUser =
        session.user;

      setAdminName(
        adminUser.user_metadata?.full_name ||
          adminUser.email?.split("@")[0] ||
          "Admin User"
      );

      const response = await fetch(
        "/api/users",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const responseText =
        await response.text();

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (error) {
        console.error(
          "Users API invalid response:",
          responseText
        );

        setMessage(
          "Users API returned an invalid response."
        );
        return;
      }

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to load users."
        );
        return;
      }

      setUsers(
        data.users || []
      );
    } catch (error) {
      console.error(
        "Admin users page error:",
        error
      );

      setMessage(
        "Something went wrong while loading users."
      );
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditing(false);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
    setSuccess(false);
  };

  const openEditForm = (
    user: UserItem
  ) => {
    setEditing(true);

    setForm({
      id: user.id,
      full_name:
        user.full_name,
      email:
        user.email,
      password: "",
      role:
        user.role.toLowerCase() ===
        "lecturer"
          ? "lecturer"
          : "student",
      student_id: "",
      course: "",
      subject: "",
    });

    setShowForm(true);
    setMessage("");
    setSuccess(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(false);
    setForm(emptyForm);
    setMessage("");
    setSuccess(false);
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);
      setMessage("");
      setSuccess(false);

      if (
        !form.full_name.trim()
      ) {
        setMessage(
          "Full name is required."
        );
        return;
      }

      if (
        !editing &&
        !form.email.trim()
      ) {
        setMessage(
          "Email is required."
        );
        return;
      }

      if (
        !editing &&
        form.password.length < 6
      ) {
        setMessage(
          "Password must be at least 6 characters."
        );
        return;
      }

      const session =
        await getSession();

      if (!session) {
        setMessage(
          "Admin is not authenticated."
        );
        return;
      }

      const method =
        editing
          ? "PATCH"
          : "POST";

      const body = editing
        ? {
            id:
              form.id,

            full_name:
              form.full_name.trim(),

            role:
              form.role,

            student_id:
              form.role ===
              "student"
                ? form.student_id.trim()
                : null,

            course:
              form.role ===
              "student"
                ? form.course.trim()
                : "",

            subject:
              form.role ===
              "lecturer"
                ? form.subject.trim()
                : "",
          }
        : {
            email:
              form.email.trim(),

            password:
              form.password,

            full_name:
              form.full_name.trim(),

            role:
              form.role,

            student_id:
              form.role ===
              "student"
                ? form.student_id.trim()
                : null,

            course:
              form.role ===
              "student"
                ? form.course.trim()
                : "",

            subject:
              form.role ===
              "lecturer"
                ? form.subject.trim()
                : "",
          };

      const response = await fetch(
        "/api/users",
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body:
            JSON.stringify(
              body
            ),
        }
      );

      const responseText =
        await response.text();

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (error) {
        console.error(
          "Users API invalid response:",
          responseText
        );

        setMessage(
          "Users API returned an invalid response."
        );

        return;
      }

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to save user."
        );
        return;
      }

      setSuccess(true);

      setMessage(
        editing
          ? "User updated successfully."
          : "User created successfully."
      );

      await loadUsers();

      setTimeout(() => {
        setShowForm(false);
        setEditing(false);
        setForm(emptyForm);
      }, 800);
    } catch (error) {
      console.error(
        "Save user error:",
        error
      );

      setMessage(
        "Something went wrong while saving the user."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (
    user: UserItem
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${user.full_name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        user.id
      );

      setMessage("");
      setSuccess(false);

      const session =
        await getSession();

      if (!session) {
        setMessage(
          "Admin is not authenticated."
        );
        return;
      }

      const response = await fetch(
        `/api/users?id=${encodeURIComponent(
          user.id
        )}`,
        {
          method:
            "DELETE",

          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const responseText =
        await response.text();

      let data: any = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (error) {
        console.error(
          "Delete API invalid response:",
          responseText
        );

        setMessage(
          "Users API returned an invalid response."
        );

        return;
      }

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete user."
        );

        return;
      }

      setSuccess(true);

      setMessage(
        "User deleted successfully."
      );

      setUsers(
        (
          currentUsers
        ) =>
          currentUsers.filter(
            (item) =>
              item.id !==
              user.id
          )
      );
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      setMessage(
        "Something went wrong while deleting the user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "en-AU",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getRoleStyle = (
    role: string
  ) => {
    switch (
      role.toLowerCase()
    ) {
      case "student":
        return "bg-blue-100 text-blue-700";

      case "lecturer":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <AdminSidebar
        name={adminName}
      />

      <div className="ml-[240px] min-h-screen">
        <AdminTopbar
          name={adminName}
          title="Users"
        />

        <main className="p-8">

          {/* Page Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h1 className="text-2xl font-bold text-[#14244a]">
                Manage Users
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create, update and delete student and lecturer accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openCreateForm
              }
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Add User
            </button>

          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-5 rounded-lg p-4 text-sm font-semibold ${
                success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* User Form */}
          {showForm && (
            <div className="mt-7 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#14244a]">
                    {editing
                      ? "Edit User"
                      : "Create User"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {editing
                      ? "Update the selected account."
                      : "Create a new student or lecturer account."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  className="text-sm font-semibold text-slate-500 hover:text-red-600"
                >
                  Close
                </button>

              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={
                      form.full_name
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        full_name:
                          e.target.value,
                      })
                    }
                    placeholder="Enter full name"
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#263451] outline-none focus:border-blue-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </label>

                  <select
                    value={
                      form.role
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role:
                          e.target
                            .value as UserRole,
                      })
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#263451] outline-none focus:border-blue-500"
                  >
                    <option value="student">
                      Student
                    </option>

                    <option value="lecturer">
                      Lecturer
                    </option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email:
                          e.target.value,
                      })
                    }
                    disabled={
                      editing
                    }
                    placeholder="user@example.com"
                    className={`mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none ${
                      editing
                        ? "cursor-not-allowed bg-slate-100 text-slate-500"
                        : "bg-white text-[#263451] focus:border-blue-500"
                    }`}
                  />
                </div>

                {/* Password only when creating */}
                {!editing && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Temporary Password
                    </label>

                    <input
                      type="password"
                      value={
                        form.password
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password:
                            e.target.value,
                        })
                      }
                      placeholder="Minimum 6 characters"
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#263451] outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Student Fields */}
                {form.role ===
                  "student" && (
                  <>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Student ID
                      </label>

                      <input
                        type="text"
                        value={
                          form.student_id
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            student_id:
                              e.target.value,
                          })
                        }
                        placeholder="e.g. 20029163"
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#263451] outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Course
                      </label>

                      <input
                        type="text"
                        value={
                          form.course
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            course:
                              e.target.value,
                          })
                        }
                        placeholder="e.g. Software Development"
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#263451] outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Lecturer Fields */}
                {form.role ===
                  "lecturer" && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subject / Specialisation
                    </label>

                    <input
                      type="text"
                      value={
                        form.subject
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subject:
                            e.target.value,
                        })
                      }
                      placeholder="e.g. Database Systems"
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#263451] outline-none focus:border-blue-500"
                    />
                  </div>
                )}

              </div>

              <div className="mt-6 flex gap-3 border-t border-slate-200 pt-6">

                <button
                  type="button"
                  onClick={
                    handleSaveUser
                  }
                  disabled={
                    saving
                  }
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {saving
                    ? "Saving..."
                    : editing
                    ? "Update User"
                    : "Create User"}
                </button>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

              </div>

            </div>
          )}

          {/* Users Table */}
          <div className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* Header */}
            <div className="hidden grid-cols-[1.6fr_2fr_1fr_1.2fr_1.5fr] bg-[#152747] px-6 py-4 text-xs font-bold tracking-wider text-white md:grid">
              <span>NAME</span>
              <span>EMAIL</span>
              <span>ROLE</span>
              <span>REGISTERED</span>
              <span>ACTIONS</span>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading users...
              </div>
            ) : users.length ===
              0 ? (
              <div className="p-10 text-center">

                <p className="text-sm font-semibold text-[#263451]">
                  No users found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Create a student or lecturer account using Add User.
                </p>

              </div>
            ) : (
              users.map(
                (user) => (
                  <div
                    key={
                      user.id
                    }
                    className="grid grid-cols-1 gap-4 border-t border-slate-200 bg-white px-6 py-5 md:grid-cols-[1.6fr_2fr_1fr_1.2fr_1.5fr] md:items-center"
                  >

                    {/* Name */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 md:hidden">
                        NAME
                      </p>

                      <p className="text-sm font-semibold text-[#263451]">
                        {
                          user.full_name
                        }
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 md:hidden">
                        EMAIL
                      </p>

                      <p className="break-all text-sm text-slate-600">
                        {
                          user.email
                        }
                      </p>
                    </div>

                    {/* Role */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 md:hidden">
                        ROLE
                      </p>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${getRoleStyle(
                          user.role
                        )}`}
                      >
                        {
                          user.role
                        }
                      </span>
                    </div>

                    {/* Registered */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 md:hidden">
                        REGISTERED
                      </p>

                      <p className="text-sm text-slate-600">
                        {formatDate(
                          user.created_at
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-400 md:hidden">
                        ACTIONS
                      </p>

                      <div className="flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              user
                            )
                          }
                          className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteUser(
                              user
                            )
                          }
                          disabled={
                            deletingId ===
                            user.id
                          }
                          className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          user.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>
                    </div>

                  </div>
                )
              )
            )}

          </div>

        </main>
      </div>
    </div>
  );
}