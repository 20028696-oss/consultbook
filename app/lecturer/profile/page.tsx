"use client";

import { useEffect, useState } from "react";
import LecturerSidebar from "@/components/lecturer/LecturerSidebar";
import LecturerTopbar from "@/components/lecturer/LecturerTopbar";
import { supabase } from "@/lib/supabase/client";

export default function LecturerProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Get currently logged-in lecturer
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Lecturer is not authenticated.");
        return;
      }

      // Basic auth information
      const authName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Lecturer";

      setName(authName);
      setEmail(user.email || "");

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setMessage("Lecturer session was not found.");
        return;
      }

      // Load profile from API
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Profile API error:", data);

        // We still keep Auth name/email above
        return;
      }

      if (data.full_name) {
        setName(data.full_name);
      }

      if (data.email) {
        setEmail(data.email);
      }

      if (data.course) {
        setSubject(data.course);
      } else {
        // Fallback to lecturers table
        await loadLecturerSpecialisation(user.email || "");
      }
    } catch (error) {
      console.error("Load lecturer profile error:", error);

      setMessage(
        "Something went wrong while loading the lecturer profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadLecturerSpecialisation = async (
    userEmail: string
  ) => {
    try {
      if (!userEmail) return;

      const response = await fetch("/api/lecturers", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      const lecturers = Array.isArray(data)
        ? data
        : data.lecturers || [];

      const currentLecturer = lecturers.find(
        (lecturer: any) =>
          lecturer.email?.toLowerCase() ===
          userEmail.toLowerCase()
      );

      if (currentLecturer) {
        setSubject(
          currentLecturer.subject ||
            currentLecturer.specialisation ||
            ""
        );
      }
    } catch (error) {
      console.error(
        "Load lecturer specialisation error:",
        error
      );
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      setMessage("Full name is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      // Get current Supabase session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setMessage("User is not authenticated.");
        return;
      }

      // Update profile table through API
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: name.trim(),

          // Lecturer does not need student ID
          student_id: null,

          // Your profile table currently uses course
          // so we store lecturer specialisation there
          course: subject.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to update profile."
        );
        return;
      }

      // Update auth metadata so Topbar name also changes
      const { error: metadataError } =
        await supabase.auth.updateUser({
          data: {
            full_name: name.trim(),
          },
        });

      if (metadataError) {
        console.error(
          "Auth metadata update error:",
          metadataError
        );
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Save profile error:", error);

      setMessage(
        "Something went wrong while saving the profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setMessage("");
    await loadProfile();
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <LecturerSidebar />

      <main className="flex-1 px-8 py-6">
        <LecturerTopbar
          name={name || "Lecturer"}
          title="Profile"
        />

        <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#14244a]">
            Lecturer Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and update your lecturer information.
          </p>

          {loading ? (
            <div className="py-10 text-sm text-slate-500">
              Loading profile...
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  readOnly
                  className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Email is linked to your login account and cannot be changed here.
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Subject / Specialisation
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                  placeholder="e.g. Database Systems"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`rounded-lg p-4 text-sm font-semibold ${
                    message
                      .toLowerCase()
                      .includes("success")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}