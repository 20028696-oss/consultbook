"use client";

import { useEffect, useState } from "react";
import LecturerSidebar from "@/components/lecturer/LecturerSidebar";
import LecturerTopbar from "@/components/lecturer/LecturerTopbar";
import AvailabilityForm from "@/components/lecturer/AvailabilityForm";
import AvailabilityList from "@/components/lecturer/AvailabilityList";
import { supabase } from "@/lib/supabase/client";

type Availability = {
  availability_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

export default function LecturerAvailabilityPage() {
  const [lecturerName, setLecturerName] =
    useState("Lecturer");

  const [slots, setSlots] =
    useState<Availability[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    await loadUser();
    await loadSlots();
  };

  const loadUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setMessage(
          "Lecturer is not authenticated."
        );
        return;
      }

      setLecturerName(
        user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Lecturer"
      );
    } catch (error) {
      console.error(
        "Load lecturer error:",
        error
      );
    }
  };

  const getAccessToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session.access_token;
  };

  const loadSlots = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token =
        await getAccessToken();

      if (!token) {
        setMessage(
          "Lecturer is not authenticated."
        );

        setSlots([]);
        return;
      }

      const response =
        await fetch(
          "/api/availability",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "Load availability error:",
          data
        );

        setMessage(
          data.message ||
            "Failed to load availability."
        );

        setSlots([]);
        return;
      }

      setSlots(
        Array.isArray(data)
          ? data
          : data.availability ||
              data.slots ||
              []
      );

    } catch (error) {
      console.error(
        "Load availability error:",
        error
      );

      setMessage(
        "Something went wrong while loading availability."
      );

      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this availability slot?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");

      const token =
        await getAccessToken();

      if (!token) {
        setMessage(
          "Lecturer is not authenticated."
        );
        return;
      }

      const response =
        await fetch(
          `/api/availability?id=${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete availability."
        );

        return;
      }

      setMessage(
        "Availability slot deleted successfully."
      );

      await loadSlots();

    } catch (error) {
      console.error(
        "Delete availability error:",
        error
      );

      setMessage(
        "Something went wrong while deleting the slot."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <LecturerSidebar />

      <main className="min-w-0 flex-1 px-8 py-6">
        <LecturerTopbar
          name={lecturerName}
          title="Availability"
        />

        <div>
          <h1 className="text-2xl font-bold text-[#14244a]">
            Manage Availability
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add consultation times that students can book.
          </p>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-lg p-4 text-sm font-semibold ${
              message
                .toLowerCase()
                .includes(
                  "successfully"
                )
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Add Slot */}
          <AvailabilityForm
            onAdded={loadSlots}
          />

          {/* Availability List */}
          <div className="lg:col-span-2">

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  Loading availability...
                </p>
              </div>
            ) : (
              <AvailabilityList
                slots={slots}
                onDelete={deleteSlot}
                deletingId={deletingId}
              />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}