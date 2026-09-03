
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";

type Lecturer = {
  id: number;
  full_name: string;
  subject: string | null;
  email: string | null;
};

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getLecturers();
  }, []);

  const getLecturers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/lecturers");

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to load lecturers."
        );
        return;
      }

      setLecturers(data);
    } catch (error) {
      console.error("Error loading lecturers:", error);
      setMessage("Something went wrong while loading lecturers.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .replace("Dr.", "")
      .trim()
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="p-7">
          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-sm">
              <Link
                href="/student/dashboard"
                className="font-semibold text-blue-600"
              >
                Dashboard
              </Link>

              <span className="text-slate-400">
                {" "}› Lecturers
              </span>
            </p>

            <h1 className="mt-4 text-2xl font-bold text-[#14244a]">
              Select a Lecturer
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Choose a lecturer to view their available consultation times.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
              Loading lecturers...
            </div>
          )}

          {/* Error */}
          {!loading && message && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
              {message}
            </div>
          )}

          {/* Lecturers */}
          {!loading && !message && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {lecturers.map((lecturer) => (
                <div
                  key={lecturer.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* Lecturer avatar */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {getInitials(lecturer.full_name)}
                    </div>

                    <div>
                      <h2 className="font-bold text-[#14244a]">
                        {lecturer.full_name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {lecturer.subject || "Consultation"}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p className="text-xs font-bold tracking-wider text-slate-400">
                      SUBJECT
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#263451]">
                      {lecturer.subject || "Not specified"}
                    </p>

                    {lecturer.email && (
                      <>
                        
                      </>
                    )}
                  </div>

                  {/* Button */}
                  <Link
                    href={`/student/lecturers/${lecturer.id}`}
                    className="mt-6 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Availability
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* No lecturers */}
          {!loading &&
            !message &&
            lecturers.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                No lecturers are available at the moment.
              </div>
            )}
        </div>
      </main>
    </div>
  );
}


