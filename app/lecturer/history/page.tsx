"use client";

import {
  useEffect,
  useState,
} from "react";

import LecturerSidebar from "@/components/lecturer/LecturerSidebar";
import LecturerTopbar from "@/components/lecturer/LecturerTopbar";

import { supabase } from "@/lib/supabase/client";

type ConsultationNote = {
  id: number;
  notes: string;
  created_at: string;
};

type HistoryItem = {
  id: number;
  student_name: string;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
  note: ConsultationNote | null;
};

export default function ConsultationHistoryPage() {
  const [
    lecturerName,
    setLecturerName,
  ] = useState("Lecturer");

  const [
    history,
    setHistory,
  ] = useState<HistoryItem[]>([]);

  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState<HistoryItem | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory =
    async () => {
      try {
        setLoading(true);
        setMessage("");

        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          setMessage(
            "Lecturer is not authenticated."
          );

          return;
        }

        const currentLecturerName =
          user.user_metadata
            ?.full_name ||
          user.email?.split(
            "@"
          )[0] ||
          "Lecturer";

        setLecturerName(
          currentLecturerName
        );

        const response =
          await fetch(
            `/api/history?lecturerName=${encodeURIComponent(
              currentLecturerName
            )}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          setMessage(
            data.message ||
              "Failed to load consultation history."
          );

          setHistory([]);

          return;
        }

        setHistory(
          data.history || []
        );
      } catch (error) {
        console.error(
          "History page error:",
          error
        );

        setMessage(
          "Something went wrong while loading history."
        );
      } finally {
        setLoading(false);
      }
    };

  const formatDate = (
    date: string
  ) => {
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

  const formatCreatedAt = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleString(
      "en-AU",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute:
          "2-digit",
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <LecturerSidebar />

      <main className="min-w-0 flex-1 px-8 py-6">
        <LecturerTopbar
          name={
            lecturerName
          }
          title="Consultation History"
        />

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-[#14244a]">
            Consultation History
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review previous completed consultations and saved notes.
          </p>
        </div>

        {message && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <div className="mt-7 grid gap-6 lg:grid-cols-3">

          {/* History list */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-[#14244a]">
                Completed Consultations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a consultation to view details.
              </p>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading consultation history...
              </div>
            ) : history.length ===
              0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-[#263451]">
                  No consultation history
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Completed consultations will appear here.
                </p>
              </div>
            ) : (
              history.map(
                (item) => (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedItem(
                        item
                      )
                    }
                    className={`block w-full border-b border-slate-100 p-5 text-left transition ${
                      selectedItem
                        ?.id ===
                      item.id
                        ? "bg-blue-50"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="font-bold text-[#263451]">
                          {
                            item.student_name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.subject ||
                            "Consultation"}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatDate(
                            item.booking_date
                          )}
                          {" • "}
                          {
                            item.booking_time
                          }
                        </p>

                        <p className="mt-2 text-xs font-semibold">
                          {item.note ? (
                            <span className="text-green-600">
                              Notes available
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              No notes
                            </span>
                          )}
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

          {/* Details */}
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-[#14244a]">
              Consultation Details
            </h2>

            {!selectedItem ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">
                  Select a completed consultation to view its details.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-5 space-y-5">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Student
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#263451]">
                      {
                        selectedItem.student_name
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Subject
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#263451]">
                      {selectedItem.subject ||
                        "Consultation"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#263451]">
                      {formatDate(
                        selectedItem.booking_date
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#263451]">
                      {
                        selectedItem.booking_time
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      COMPLETED
                    </span>
                  </div>

                </div>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Consultation Notes
                  </p>

                  {selectedItem.note ? (
                    <>
                      <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-[#263451]">
                        {
                          selectedItem.note
                            .notes
                        }
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Saved{" "}
                        {formatCreatedAt(
                          selectedItem.note
                            .created_at
                        )}
                      </p>
                    </>
                  ) : (
                    <div className="mt-3 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
                      No consultation notes have been added for this consultation.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}