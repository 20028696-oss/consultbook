
import Link from "next/link";
import { notFound } from "next/navigation";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import { supabase } from "@/lib/supabase/client";

const timeSlots = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "04:00 PM",
];

export default async function LecturerAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: lecturer, error } = await supabase
    .from("lecturers")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error || !lecturer) {
    notFound();
  }

  const initials = lecturer.full_name
    .replace("Dr. ", "")
    .split(" ")
    .map((name: string) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="p-7">
          <p className="text-sm text-slate-500">
            Dashboard › Lecturers › Availability
          </p>

          <h1 className="mt-3 text-2xl font-bold text-[#14244a]">
            {lecturer.full_name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {lecturer.subject || "Consultation"}
          </p>

          {/* Lecturer Information */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {initials}
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#14244a]">
                  {lecturer.full_name}
                </h2>

                <p className="text-sm text-slate-500">
                  {lecturer.email || "No email available"}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Specialisation: {lecturer.subject || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Available Times */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#14244a]">
              Available Consultation Times
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select an available time to continue with your booking.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {timeSlots.map((time) => (
                <Link
                  key={time}
                  href={`/student/booking?lecturer=${lecturer.id}&time=${encodeURIComponent(time)}`}
                  className="rounded-lg border border-blue-500 px-4 py-4 text-center font-semibold text-blue-700 hover:bg-blue-50"
                >
                  {time}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/student/lecturers"
            className="mt-6 inline-block text-sm font-semibold text-blue-600"
          >
            ← Back to Lecturer List
          </Link>
        </div>
      </main>
    </div>
  );
}

