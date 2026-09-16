"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";
import { supabase } from "@/lib/supabase/client";

type Lecturer = {
  id: number;
  full_name: string;
  subject: string | null;
  email: string | null;
};

type Availability = {
  availability_id: string;
  lecturer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lecturerId = searchParams.get("lecturer");
  const dateFromUrl = searchParams.get("date");
  const timeFromUrl = searchParams.get("time");

  const [lecturer, setLecturer] = useState<Lecturer | null>(null);

  const [availability, setAvailability] = useState<Availability[]>([]);

  const [selectedDate, setSelectedDate] = useState(
    dateFromUrl || ""
  );

  const [selectedTime, setSelectedTime] = useState(
    timeFromUrl || ""
  );

  const [selectedEndTime, setSelectedEndTime] = useState("");

  const [reason, setReason] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formatTime = (time: string) => {
    if (!time) return "";

    // Already formatted as AM/PM
    if (
      time.toUpperCase().includes("AM") ||
      time.toUpperCase().includes("PM")
    ) {
      return time;
    }

    const [hours, minutes] = time.split(":");

    const hourNumber = Number(hours);

    const period =
      hourNumber >= 12 ? "PM" : "AM";

    const displayHour =
      hourNumber % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date: string) => {
    if (!date) return "Not selected";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* =====================================================
     INITIALS
  ===================================================== */

  const getInitials = (name: string) => {
    return name
      .replace("Dr. ", "")
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  /* =====================================================
     LOAD LECTURER
  ===================================================== */

  useEffect(() => {
    const loadLecturer = async () => {
      setPageLoading(true);
      setMessage("");

      try {
        if (!lecturerId) {
          setMessage("No lecturer was selected.");
          return;
        }

        const { data, error } = await supabase
          .from("lecturers")
          .select(
            "id, full_name, subject, email"
          )
          .eq("id", Number(lecturerId))
          .single();

        if (error || !data) {
          console.error(
            "Lecturer loading error:",
            error
          );

          setMessage(
            "Unable to load the selected lecturer."
          );

          return;
        }

        setLecturer(data);

      } catch (error) {
        console.error(
          "Unexpected lecturer loading error:",
          error
        );

        setMessage(
          "Something went wrong while loading the lecturer."
        );

      } finally {
        setPageLoading(false);
      }
    };

    loadLecturer();

  }, [lecturerId]);

  /* =====================================================
     UPDATE DATE/TIME FROM URL
  ===================================================== */

  useEffect(() => {
    if (dateFromUrl) {
      setSelectedDate(dateFromUrl);
    }

    if (timeFromUrl) {
      setSelectedTime(timeFromUrl);
    }
  }, [dateFromUrl, timeFromUrl]);

  /* =====================================================
     LOAD REAL AVAILABILITY
  ===================================================== */

  useEffect(() => {
    const loadAvailability = async () => {
      if (!lecturer?.email) {
        return;
      }

      try {
        /*
         Find lecturer's Auth UUID from profiles.
        */

        const {
          data: profile,
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
            "Profile loading error:",
            profileError
          );

          return;
        }

        if (!profile) {
          console.error(
            "No profile found for lecturer."
          );

          return;
        }

        /*
         Load only available slots for this lecturer.
        */

        const {
          data: slots,
          error: availabilityError,
        } = await supabase
          .from("availability")
          .select(
            "availability_id, lecturer_id, date, start_time, end_time, is_available"
          )
          .eq("lecturer_id", profile.id)
          .eq("is_available", true)
          .order("date", {
            ascending: true,
          })
          .order("start_time", {
            ascending: true,
          });

        if (availabilityError) {
          console.error(
            "Availability loading error:",
            availabilityError
          );

          return;
        }

        setAvailability(slots || []);

        /*
         If the student came from the availability
         page with a selected date/time, find the
         corresponding end time.
        */

        if (dateFromUrl && timeFromUrl) {
          const matchingSlot =
            (slots || []).find((slot) => {
              return (
                slot.date === dateFromUrl &&
                formatTime(slot.start_time) ===
                  timeFromUrl
              );
            });

          if (matchingSlot) {
            setSelectedEndTime(
              formatTime(
                matchingSlot.end_time
              )
            );
          }
        }

      } catch (error) {
        console.error(
          "Availability error:",
          error
        );
      }
    };

    loadAvailability();

  }, [
    lecturer,
    dateFromUrl,
    timeFromUrl,
  ]);

  /* =====================================================
     AVAILABLE SLOTS FOR SELECTED DATE
  ===================================================== */

  const slotsForSelectedDate =
    availability.filter(
      (slot) =>
        slot.date === selectedDate
    );

  /* =====================================================
     SELECT SLOT
  ===================================================== */

  const selectSlot = (
    slot: Availability
  ) => {
    setSelectedTime(
      formatTime(slot.start_time)
    );

    setSelectedEndTime(
      formatTime(slot.end_time)
    );
  };

  /* =====================================================
     CHANGE DATE
  ===================================================== */

  const handleDateChange = (
    date: string
  ) => {
    setSelectedDate(date);
    setSelectedTime("");
    setSelectedEndTime("");
  };

  /* =====================================================
     CONFIRM BOOKING
  ===================================================== */

  const confirmBooking = async () => {
    setMessage("");
    setSuccess(false);

    if (!lecturer) {
      setMessage(
        "No lecturer was selected."
      );

      return;
    }

    if (!selectedDate) {
      setMessage(
        "Please select an available date."
      );

      return;
    }

    if (!selectedTime) {
      setMessage(
        "Please select an available consultation time."
      );

      return;
    }

    setLoading(true);

    try {
      /* Get logged-in student */

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        setMessage(
          "You must be logged in as a student to make a booking."
        );

        return;
      }

      /* Check role */

      const role =
        user.user_metadata?.role
          ?.toString()
          .toLowerCase();

      if (role !== "student") {
        setMessage(
          "Only student accounts can create bookings."
        );

        return;
      }

      /* =====================================================
         GET STUDENT NAME FROM PROFILE
      ===================================================== */

      const {
        data: studentProfile,
      } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const studentName =
        studentProfile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Student";

      /* =====================================================
         VERIFY SLOT IS STILL AVAILABLE
      ===================================================== */

      const selectedSlot =
        availability.find(
          (slot) =>
            slot.date === selectedDate &&
            formatTime(
              slot.start_time
            ) === selectedTime &&
            slot.is_available
        );

      if (!selectedSlot) {
        setMessage(
          "This consultation time is no longer available. Please select another time."
        );

        return;
      }

      /* =====================================================
         CREATE BOOKING
      ===================================================== */

      const {
        data: booking,
        error: bookingError,
      } = await supabase
        .from("bookings")
        .insert([
          {
            student_id: user.id,

            student_name:
              studentName,

            lecturer_id:
              lecturer.id,

            lecturer_name:
              lecturer.full_name,

            subject:
              lecturer.subject,

            booking_date:
              selectedDate,

            booking_time:
              selectedTime,

            reason:
              reason.trim() || null,

            status: "pending",
          },
        ])
        .select()
        .single();

      if (bookingError) {
        console.error(
          "Booking creation error:",
          bookingError
        );

        setMessage(
          bookingError.message
        );

        return;
      }

      console.log(
        "Booking created:",
        booking
      );

      /* =====================================================
         MARK SLOT UNAVAILABLE
      ===================================================== */

      const {
        error: slotUpdateError,
      } = await supabase
        .from("availability")
        .update({
          is_available: false,
        })
        .eq(
          "availability_id",
          selectedSlot.availability_id
        );

      if (slotUpdateError) {
        console.error(
          "Slot update error:",
          slotUpdateError
        );
      }

      setSuccess(true);
      setReason("");

      setTimeout(() => {
        router.push(
          "/student/bookings"
        );

        router.refresh();
      }, 1500);

    } catch (error) {
      console.error(
        "Unexpected booking error:",
        error
      );

      setMessage(
        "Something went wrong while creating your booking. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <StudentSidebar />
        <StudentTopbar />

        <main className="ml-60 pt-20">
          <div className="p-7">
            <div className="rounded-xl border bg-white p-8">
              <p className="text-[#263451]">
                Loading lecturer...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     LECTURER NOT FOUND
  ===================================================== */

  if (!lecturer) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <StudentSidebar />
        <StudentTopbar />

        <main className="ml-60 pt-20">
          <div className="p-7">

            <div className="rounded-xl border bg-white p-8">

              <h1 className="text-2xl font-bold text-[#14244a]">
                Lecturer not found
              </h1>

              <p className="mt-3 text-red-600">
                {message ||
                  "Unable to find the selected lecturer."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/student/lecturers"
                  )
                }
                className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white"
              >
                Back to Lecturers
              </button>

            </div>

          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f5f6f8]">

      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">

        <div className="grid gap-6 p-7 lg:grid-cols-3">

          {/* Booking Form */}

          <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-2">

            <h1 className="text-2xl font-bold text-[#14244a]">
              Book a Consultation
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Fill in the details below to request a session.
            </p>

            {/* Lecturer */}

            <div className="mt-6">

              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500">
                SELECTED LECTURER
              </p>

              <div className="flex items-center gap-3 rounded-lg border-2 border-blue-500 p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {getInitials(
                    lecturer.full_name
                  )}
                </div>

                <div>

                  <p className="font-semibold text-[#263451]">
                    {lecturer.full_name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {lecturer.subject ||
                      "No subject specified"}
                  </p>

                </div>

              </div>

            </div>

            {/* Date */}

            <div className="mt-6">

              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500">
                SELECT DATE
              </p>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  handleDateChange(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#263451] outline-none focus:border-blue-500"
              />

            </div>

            {/* Slots */}

            <div className="mt-6">

              <p className="mb-3 text-xs font-bold tracking-wider text-slate-500">
                AVAILABLE SLOTS
              </p>

              {slotsForSelectedDate.length ===
              0 ? (

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No available consultation times for this date.
                </div>

              ) : (

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                  {slotsForSelectedDate.map(
                    (slot) => {

                      const start =
                        formatTime(
                          slot.start_time
                        );

                      const end =
                        formatTime(
                          slot.end_time
                        );

                      return (
                        <button
                          key={
                            slot.availability_id
                          }
                          type="button"
                          onClick={() =>
                            selectSlot(slot)
                          }
                          className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                            selectedTime ===
                            start
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-[#263451] hover:border-blue-400"
                          }`}
                        >
                          {start} - {end}
                        </button>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* Reason */}

            <div className="mt-6">

              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500">
                REASON (OPTIONAL)
              </p>

              <textarea
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value
                  )
                }
                placeholder={`e.g. Need help with ${
                  lecturer.subject ||
                  "this subject"
                }...`}
                className="h-28 w-full resize-none rounded-lg border border-slate-300 p-4 text-sm text-[#263451] outline-none focus:border-blue-500"
              />

            </div>

            {/* Confirm */}

            <button
              type="button"
              onClick={confirmBooking}
              disabled={
                loading ||
                !selectedDate ||
                !selectedTime
              }
              className="mt-6 w-full rounded-lg bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading
                ? "Submitting..."
                : "Confirm Booking"}
            </button>

            {message && !success && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
                {message}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm font-semibold text-green-700">
                Booking request submitted successfully! Redirecting to My Bookings...
              </div>
            )}

            <p className="mt-4 text-center text-xs text-slate-500">
              Your booking will remain pending until the lecturer approves or rejects your request.
            </p>

          </div>

          {/* =====================================================
              BOOKING SUMMARY
          ===================================================== */}

          <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-[#14244a]">
              Booking Summary
            </h2>

            <div className="my-5 border-t border-slate-200" />

            <div className="rounded-xl bg-slate-100 p-5">

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Lecturer
                </span>

                <span className="text-right text-sm font-bold text-[#263451]">
                  {lecturer.full_name}
                </span>
              </div>

              <div className="mt-5 flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Subject
                </span>

                <span className="text-right text-sm font-bold text-[#263451]">
                  {lecturer.subject ||
                    "Not specified"}
                </span>
              </div>

              <div className="mt-5 flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Date
                </span>

                <span className="text-sm font-bold text-[#263451]">
                  {formatDate(
                    selectedDate
                  )}
                </span>
              </div>

              <div className="mt-5 flex justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Time
                </span>

                <span className="text-right text-sm font-bold text-[#263451]">
                  {selectedTime
                    ? `${selectedTime}${
                        selectedEndTime
                          ? ` - ${selectedEndTime}`
                          : ""
                      }`
                    : "Not selected"}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                  PENDING
                </span>
              </div>

            </div>

            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
              ⚠ The lecturer will review your booking request.
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
