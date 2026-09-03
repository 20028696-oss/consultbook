"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AvailabilityForm({
  onAdded,
}: {
  onAdded?: () => void;
}) {
  const [date, setDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const submit = async () => {
    setMessage("");

    if (
      !date ||
      !startTime ||
      !endTime
    ) {
      setMessage(
        "Please complete all fields."
      );

      return;
    }

    if (endTime <= startTime) {
      setMessage(
        "End time must be later than start time."
      );

      return;
    }

    try {
      setSaving(true);

      // Get lecturer session
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
          "Lecturer is not authenticated."
        );

        return;
      }

      const response =
        await fetch(
          "/api/availability",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              date,
              start_time:
                startTime,
              end_time:
                endTime,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to add availability."
        );

        return;
      }

      setMessage(
        "Availability added successfully."
      );

      setDate("");
      setStartTime("");
      setEndTime("");

      // Reload availability list
      onAdded?.();

    } catch (error) {
      console.error(
        "Availability error:",
        error
      );

      setMessage(
        "Something went wrong while adding availability."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-lg font-bold text-[#14244a]">
        Add Availability
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Add a consultation period that students can book.
      </p>

      <div className="mt-5 grid gap-5">

        {/* Date */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Start Time
          </label>

          <input
            type="time"
            value={startTime}
            onChange={(e) =>
              setStartTime(
                e.target.value
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            End Time
          </label>

          <input
            type="time"
            value={endTime}
            onChange={(e) =>
              setEndTime(
                e.target.value
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving
            ? "Adding Slot..."
            : "Add Slot"}
        </button>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm font-semibold ${
              message
                .toLowerCase()
                .includes(
                  "success"
                )
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

      </div>
    </div>
  );
}