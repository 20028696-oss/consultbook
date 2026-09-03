"use client";

import { useState } from "react";

export default function ConsultationNotesForm({
  bookingId,
}: {
  bookingId: number;
}) {
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const saveNotes = async () => {
    if (!notes.trim()) {
      setMessage("Please enter consultation notes.");
      return;
    }

    const response = await fetch(
      "/api/consultation-notes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: bookingId,
          notes,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Unable to save notes.");
      return;
    }

    setMessage("Consultation notes saved successfully.");
    setNotes("");
  };

  return (
    <div className="rounded-xl border bg-white p-6">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter consultation notes..."
        className="h-36 w-full rounded-lg border p-4"
      />

      <button
        type="button"
        onClick={saveNotes}
        className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
      >
        Save Notes
      </button>

      {message && (
        <p className="mt-3 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}