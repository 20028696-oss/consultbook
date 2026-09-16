import Link from "next/link";
import { notFound } from "next/navigation";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import { supabase } from "@/lib/supabase/client";

type Availability = {
  availability_id: string;
  lecturer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

export default async function LecturerAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  /* =====================================================
     1. GET SELECTED LECTURER
  ===================================================== */

  const {
    data: lecturer,
    error: lecturerError,
  } = await supabase
    .from("lecturers")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (lecturerError || !lecturer) {
    console.error(
      "Lecturer error:",
      lecturerError
    );

    notFound();
  }

  /* =====================================================
     2. FIND LECTURER AUTH / PROFILE UUID
  ===================================================== */

  let lecturerAuthId: string | null = null;

  if (lecturer.email) {
    const {
      data: lecturerProfile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id")
      .eq(
        "email",
        lecturer.email.toLowerCase()
      )
      .maybeSingle();

    if (profileError) {
      console.error(
        "Lecturer profile error:",
        profileError
      );
    }

    lecturerAuthId =
      lecturerProfile?.id || null;
  }

  /* =====================================================
     3. GET REAL AVAILABILITY FROM SUPABASE
  ===================================================== */

  let availability: Availability[] = [];

  if (lecturerAuthId) {
    const {
      data: availabilityData,
      error: availabilityError,
    } = await supabase
      .from("availability")
      .select(
        "availability_id, lecturer_id, date, start_time, end_time, is_available"
      )
      .eq(
        "lecturer_id",
        lecturerAuthId
      )
      .eq("is_available", true)
      .order("date", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

    if (availabilityError) {
      console.error(
        "Availability error:",
        availabilityError
      );
    } else {
      availability =
        availabilityData || [];
    }
  }

  /* =====================================================
     LECTURER INITIALS
  ===================================================== */

  const initials = lecturer.full_name
    .replace("Dr. ", "")
    .split(" ")
    .map(
      (name: string) =>
        name[0]
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formatTime = (
    time: string
  ) => {
    if (!time) return "";

    const [hours, minutes] =
      time.split(":");

    const hourNumber =
      Number(hours);

    const period =
      hourNumber >= 12
        ? "PM"
        : "AM";

    const displayHour =
      hourNumber % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (
    date: string
  ) => {
    if (!date) return "";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-AU",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="p-7">

          {/* Breadcrumb */}
          <p className="text-sm text-slate-500">
            Dashboard › Lecturers › Availability
          </p>

          <h1 className="mt-3 text-2xl font-bold text-[#14244a]">
            {lecturer.full_name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {lecturer.subject ||
              "Consultation"}
          </p>

          {/* =====================================================
              LECTURER INFORMATION
          ===================================================== */}

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
                  {lecturer.email ||
                    "No email available"}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Specialisation:{" "}
                  {lecturer.subject ||
                    "Not specified"}
                </p>

              </div>
            </div>
          </div>

          {/* =====================================================
              AVAILABLE CONSULTATION TIMES
          ===================================================== */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-[#14244a]">
              Available Consultation Times
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select an available time to continue with your booking.
            </p>

            {/* No profile */}
            {!lecturerAuthId ? (

              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                No availability has been added by this lecturer yet.
              </div>

            ) : availability.length ===
              0 ? (

              /* No availability */

              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                No consultation times are currently available for this lecturer.
              </div>

            ) : (

              /* Availability Slots */

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                {availability.map(
                  (slot) => {

                    const displayStart =
                      formatTime(
                        slot.start_time
                      );

                    const displayEnd =
                      formatTime(
                        slot.end_time
                      );

                    return (
                      <Link
                        key={
                          slot.availability_id
                        }
                        href={`/student/booking?lecturer=${lecturer.id}&date=${encodeURIComponent(
                          slot.date
                        )}&time=${encodeURIComponent(
                          displayStart
                        )}`}
                        className="rounded-lg border border-blue-500 px-4 py-4 text-center transition hover:bg-blue-50"
                      >

                        {/* Date */}
                        <p className="text-sm font-semibold text-slate-600">
                          {formatDate(
                            slot.date
                          )}
                        </p>

                        {/* Time */}
                        <p className="mt-1 font-bold text-blue-700">
                          {displayStart} -{" "}
                          {displayEnd}
                        </p>

                      </Link>
                    );
                  }
                )}

              </div>
            )}
          </div>

          {/* Back */}

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