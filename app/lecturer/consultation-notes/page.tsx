"use client";

import { useEffect, useState } from "react";
import LecturerSidebar from "@/components/lecturer/LecturerSidebar";
import LecturerTopbar from "@/components/lecturer/LecturerTopbar";
import { supabase } from "@/lib/supabase/client";

type Booking = {
  id: number;
  student_name: string;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
};

export default function ConsultationNotesPage() {
  const [lecturerName, setLecturerName] = useState("Lecturer");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingNote, setLoadingNote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  const normalizeName = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Logged-in lecturer
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Lecturer is not authenticated.");
        return;
      }

      const currentLecturerName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Lecturer";

      setLecturerName(currentLecturerName);

      // Load completed bookings
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          student_name,
          lecturer_name,
          subject,
          booking_date,
          booking_time,
          status
          `
        )
        .eq("status", "completed")
        .order("booking_date", {
          ascending: false,
        })
        .order("booking_time", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Completed booking error:",
          error
        );

        setMessage(error.message);
        setBookings([]);
        return;
      }

      /*
        Your bookings currently use lecturer_name.
        Filter completed bookings so this lecturer
        only sees their own completed consultations.
      */
      const lecturerBookings = (data || []).filter(
        (booking) =>
          normalizeName(
            booking.lecturer_name || ""
          ) ===
          normalizeName(
            currentLecturerName
          )
      );

      setBookings(lecturerBookings);
    } catch (error) {
      console.error(
        "Consultation notes page error:",
        error
      );

      setMessage(
        "Something went wrong while loading consultations."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectBooking = async (
    booking: Booking
  ) => {
    try {
      setSelectedBooking(booking);
      setNotes("");
      setMessage("");
      setLoadingNote(true);

      const response = await fetch(
        `/api/consultation-notes?bookingId=${booking.id}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to load consultation notes."
        );
        return;
      }

      if (data.note) {
        setNotes(
          data.note.notes || ""
        );
      } else {
        setNotes("");
      }
    } catch (error) {
      console.error(
        "Load note error:",
        error
      );

      setMessage(
        "Something went wrong while loading notes."
      );
    } finally {
      setLoadingNote(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedBooking) {
      setMessage(
        "Please select a completed consultation."
      );
      return;
    }

    if (!notes.trim()) {
      setMessage(
        "Please enter consultation notes."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        "/api/consultation-notes",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            booking_id:
              selectedBooking.id,
            notes: notes.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to save consultation notes."
        );
        return;
      }

      setMessage(
        data.message ||
          "Consultation notes saved successfully."
      );
    } catch (error) {
      console.error(
        "Save notes error:",
        error
      );

      setMessage(
        "Something went wrong while saving notes."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <LecturerSidebar />

      <main className="min-w-0 flex-1 px-8 py-6">
        <LecturerTopbar
          name={lecturerName}
          title="Consultation Notes"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-[#14244a]">
            Consultation Notes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Record notes after completed student consultations.
          </p>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-lg p-4 text-sm font-semibold ${
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

        <div className="mt-7 grid gap-6 lg:grid-cols-2">

          {/* Completed consultations */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-[#14244a]">
                Completed Consultations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a consultation to add or edit notes.
              </p>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading consultations...
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-[#263451]">
                  No completed consultations
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Completed consultations will appear here.
                </p>
              </div>
            ) : (
              bookings.map(
                (booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() =>
                      selectBooking(
                        booking
                      )
                    }
                    className={`block w-full border-b border-slate-100 p-5 text-left transition ${
                      selectedBooking?.id ===
                      booking.id
                        ? "bg-blue-50"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-[#263451]">
                          {
                            booking.student_name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {booking.subject ||
                            "Consultation"}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatDate(
                            booking.booking_date
                          )}
                          {" • "}
                          {
                            booking.booking_time
                          }
                        </p>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold text-green-700">
                        COMPLETED
                      </span>
                    </div>
                  </button>
                )
              )
            )}
          </div>

          {/* Notes section */}
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-[#14244a]">
              Add Consultation Notes
            </h2>

            {!selectedBooking ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">
                  Select a completed consultation from the left.
                </p>
              </div>
            ) : (
              <>
                {/* Selected consultation */}
                <div className="mt-5 rounded-xl bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#263451]">
                        {
                          selectedBooking.student_name
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedBooking.subject ||
                          "Consultation"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatDate(
                          selectedBooking.booking_date
                        )}
                        {" • "}
                        {
                          selectedBooking.booking_time
                        }
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold text-green-700">
                      COMPLETED
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Consultation Notes
                  </label>

                  {loadingNote ? (
                    <div className="mt-2 rounded-lg border border-slate-300 p-6 text-center text-sm text-slate-500">
                      Loading notes...
                    </div>
                  ) : (
                    <textarea
                      value={notes}
                      onChange={(e) => {
                        setNotes(
                          e.target.value
                        );
                        setMessage("");
                      }}
                      placeholder="Enter what was discussed during the consultation..."
                      className="mt-2 h-52 w-full resize-none rounded-lg border border-slate-300 bg-white p-4 text-sm text-[#263451] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={saveNotes}
                  disabled={
                    saving ||
                    loadingNote
                  }
                  className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving
                    ? "Saving..."
                    : "Save Notes"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}