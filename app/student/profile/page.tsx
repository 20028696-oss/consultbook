"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import { supabase } from "@/lib/supabase/client";

export default function StudentProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [course, setCourse] = useState("");

  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    studentId: "",
    course: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("User is not authenticated.");
        return;
      }

      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to load profile.");
        return;
      }

      const profileName = result.full_name || "";
      const profileEmail = result.email || session.user.email || "";
      const profileStudentId = result.student_id || "";
      const profileCourse = result.course || "";

      setName(profileName);
      setEmail(profileEmail);
      setStudentId(profileStudentId);
      setCourse(profileCourse);

      setOriginalData({
        name: profileName,
        email: profileEmail,
        studentId: profileStudentId,
        course: profileCourse,
      });
    } catch (error) {
      console.error("Load profile error:", error);
      setMessage("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("User is not authenticated.");
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: name,
          student_id: studentId,
          course,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to update profile.");
        return;
      }

      setOriginalData({
        name,
        email,
        studentId,
        course,
      });

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Save profile error:", error);
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(originalData.name);
    setEmail(originalData.email);
    setStudentId(originalData.studentId);
    setCourse(originalData.course);
    setMessage("");
  };

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="p-7">
          <div className="mb-6">
            <p className="text-sm">
              <Link
                href="/student/dashboard"
                className="font-semibold text-blue-600"
              >
                Dashboard
              </Link>

              <span className="text-slate-400"> › Profile</span>
            </p>

            <h1 className="mt-4 text-2xl font-bold text-[#14244a]">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your personal information.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold text-[#14244a]">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your account information below.
              </p>

              <div className="mt-7 flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2463eb] text-xl font-bold text-white">
                  {initials}
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#14244a]">
                    {name || "Student"}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Student
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Student ID
                  </label>

                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Course
                  </label>

                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    disabled={loading}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || saving}
                  className="rounded-lg bg-[#2463eb] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading || saving}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              {message && (
                <div
                  className={`mt-4 rounded-lg p-4 text-sm font-semibold ${
                    message.includes("success")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#14244a]">
                Account Summary
              </h2>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-400">
                    NAME
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#14244a]">
                    {name || "-"}
                  </p>
                </div>

                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-400">
                    ROLE
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#14244a]">
                    Student
                  </p>
                </div>

                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-400">
                    STUDENT ID
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#14244a]">
                    {studentId || "-"}
                  </p>
                </div>

                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-400">
                    COURSE
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#14244a]">
                    {course || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    EMAIL
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-[#14244a]">
                    {email || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <p className="text-xs leading-5 text-blue-700">
                  Keep your personal information up to date so that your
                  consultation bookings remain accurate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
