"use client";

import { useEffect, useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

import { supabase } from "@/lib/supabase/client";

type ReportType =
  | "consultations"
  | "lecturers"
  | "students";

type ReportSummary = {
  total?: number;
  confirmed?: number;
  pending?: number;
  completed?: number;
  cancelled?: number;
};

type ReportData = {
  type: ReportType;
  summary: ReportSummary;
  records: any[];
};

export default function AdminReportsPage() {
  const [adminName, setAdminName] =
    useState("Admin User");

  const [reportType, setReportType] =
    useState<ReportType>("consultations");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [report, setReport] =
    useState<ReportData | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setMessage(
          "Admin is not authenticated."
        );
        return;
      }

      setAdminName(
        user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Admin User"
      );
    } catch (error) {
      console.error(
        "Load admin error:",
        error
      );
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setMessage("");
      setReport(null);

      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !session
      ) {
        setMessage(
          "Admin is not authenticated."
        );
        return;
      }

      const params =
        new URLSearchParams();

      params.set(
        "type",
        reportType
      );

      if (
        reportType ===
        "consultations"
      ) {
        if (fromDate) {
          params.set(
            "from",
            fromDate
          );
        }

        if (toDate) {
          params.set(
            "to",
            toDate
          );
        }
      }

      const response =
        await fetch(
          `/api/reports?${params.toString()}`,
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
          ? JSON.parse(
              responseText
            )
          : {};
      } catch (error) {
        console.error(
          "Reports API returned invalid response:",
          responseText
        );

        setMessage(
          "Reports API returned an invalid response."
        );

        return;
      }

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to generate report."
        );

        return;
      }

      setReport(data);
    } catch (error) {
      console.error(
        "Generate report error:",
        error
      );

      setMessage(
        "Something went wrong while generating the report."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-AU",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusStyle = (
    status: string
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

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
          title="Reports"
        />

        <main className="p-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#14244a]">
              Generate Reports
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Generate reports for consultations, lecturers and students.
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {message}
            </div>
          )}

          {/* Report Form */}
          <div className="mt-8 max-w-4xl rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

            <h2 className="text-lg font-bold text-[#14244a]">
              Create a New Report
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select the type of report you want to generate.
            </p>

            {/* Report Type */}
            <div className="mt-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Report Type
              </label>

              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(
                    e.target
                      .value as ReportType
                  );

                  setReport(null);
                  setMessage("");
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-[#263451] outline-none focus:border-blue-500"
              >
                <option value="consultations">
                  Consultations
                </option>

                <option value="lecturers">
                  Lecturers
                </option>

                <option value="students">
                  Students
                </option>
              </select>
            </div>

            {/* Date Filter */}
            {reportType ===
              "consultations" && (
              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      setFromDate(
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-[#263451] outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) =>
                      setToDate(
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-[#263451] outline-none focus:border-blue-500"
                  />
                </div>

              </div>
            )}

            <button
              type="button"
              onClick={
                generateReport
              }
              disabled={
                loading
              }
              className="mt-7 w-full rounded-lg bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading
                ? "Generating..."
                : "Generate Report"}
            </button>

          </div>

          {/* Report Results */}
          {report && (
            <div className="mt-8">

              <h2 className="text-xl font-bold text-[#14244a]">
                Report Results
              </h2>

              {/* Consultation Stats */}
              {report.type ===
                "consultations" && (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

                  <SummaryCard
                    label="Total"
                    value={
                      report.summary
                        .total || 0
                    }
                  />

                  <SummaryCard
                    label="Confirmed"
                    value={
                      report.summary
                        .confirmed || 0
                    }
                  />

                  <SummaryCard
                    label="Pending"
                    value={
                      report.summary
                        .pending || 0
                    }
                  />

                  <SummaryCard
                    label="Completed"
                    value={
                      report.summary
                        .completed || 0
                    }
                  />

                  <SummaryCard
                    label="Cancelled"
                    value={
                      report.summary
                        .cancelled || 0
                    }
                  />

                </div>
              )}

              {/* Student / Lecturer Total */}
              {report.type !==
                "consultations" && (
                <div className="mt-5 max-w-xs">

                  <SummaryCard
                    label={
                      report.type ===
                      "lecturers"
                        ? "Total Lecturers"
                        : "Total Students"
                    }
                    value={
                      report.summary
                        .total || 0
                    }
                  />

                </div>
              )}

              {/* CONSULTATIONS TABLE */}
              {report.type ===
                "consultations" && (
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                  {/* Header */}
                  <div className="hidden grid-cols-[1.4fr_1.4fr_1.5fr_1fr_1fr_1fr] bg-[#152747] px-6 py-4 text-xs font-bold text-white md:grid">
                    <span>
                      STUDENT
                    </span>

                    <span>
                      LECTURER
                    </span>

                    <span>
                      SUBJECT
                    </span>

                    <span>
                      DATE
                    </span>

                    <span>
                      TIME
                    </span>

                    <span>
                      STATUS
                    </span>
                  </div>

                  {report.records.length ===
                  0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                      No consultations found for this report.
                    </div>
                  ) : (
                    report.records.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          className="grid grid-cols-1 gap-4 border-t border-slate-200 bg-white px-6 py-5 md:grid-cols-[1.4fr_1.4fr_1.5fr_1fr_1fr_1fr] md:items-center"
                        >

                          {/* Student */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 md:hidden">
                              STUDENT
                            </p>

                            <p className="text-sm font-semibold text-[#263451]">
                              {
                                item.student_name
                              }
                            </p>
                          </div>

                          {/* Lecturer */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 md:hidden">
                              LECTURER
                            </p>

                            <p className="text-sm font-medium text-[#263451]">
                              {
                                item.lecturer_name
                              }
                            </p>
                          </div>

                          {/* Subject */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 md:hidden">
                              SUBJECT
                            </p>

                            <p className="text-sm text-slate-600">
                              {item.subject ||
                                "Consultation"}
                            </p>
                          </div>

                          {/* Date */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 md:hidden">
                              DATE
                            </p>

                            <p className="text-sm text-[#263451]">
                              {formatDate(
                                item.booking_date
                              )}
                            </p>
                          </div>

                          {/* Time */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 md:hidden">
                              TIME
                            </p>

                            <p className="text-sm text-[#263451]">
                              {
                                item.booking_time
                              }
                            </p>
                          </div>

                          {/* Status */}
                          <div>
                            <p className="mb-1 text-xs font-semibold text-slate-400 md:hidden">
                              STATUS
                            </p>

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase ${getStatusStyle(
                                item.status
                              )}`}
                            >
                              {
                                item.status
                              }
                            </span>
                          </div>

                        </div>
                      )
                    )
                  )}

                </div>
              )}

              {/* LECTURERS TABLE */}
              {report.type ===
                "lecturers" && (
                <SimpleTable
                  records={
                    report.records
                  }
                  type="lecturers"
                />
              )}

              {/* STUDENTS TABLE */}
              {report.type ===
                "students" && (
                <SimpleTable
                  records={
                    report.records
                  }
                  type="students"
                />
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* ==============================
   Summary Card
============================== */

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-[#14244a]">
        {value}
      </p>

    </div>
  );
}

/* ==============================
   Lecturer / Student Table
============================== */

function SimpleTable({
  records,
  type,
}: {
  records: any[];
  type:
    | "lecturers"
    | "students";
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="grid grid-cols-3 bg-[#152747] px-6 py-4 text-xs font-bold text-white">

        <span>
          NAME
        </span>

        <span>
          EMAIL
        </span>

        <span>
          DETAILS
        </span>

      </div>

      {records.length ===
      0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          No records found.
        </div>
      ) : (
        records.map(
          (
            item,
            index
          ) => (
            <div
              key={
                item.id ||
                index
              }
              className="grid grid-cols-3 border-t border-slate-200 bg-white px-6 py-5"
            >

              {/* Name */}
              <span className="text-sm font-semibold text-[#263451]">
                {item.full_name ||
                  item.name ||
                  "Unknown"}
              </span>

              {/* Email */}
              <span className="text-sm text-slate-600">
                {item.email ||
                  "-"}
              </span>

              {/* Details */}
              <span className="text-sm text-slate-600">
                {type ===
                "lecturers"
                  ? item.subject ||
                    item.specialisation ||
                    "Lecturer"
                  : item.course ||
                    "Student"}
              </span>

            </div>
          )
        )
      )}

    </div>
  );
}