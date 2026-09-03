"use client";

import { useEffect, useState } from "react";

import LecturerSidebar from "@/components/lecturer/LecturerSidebar";
import LecturerTopbar from "@/components/lecturer/LecturerTopbar";
import LecturerDashboard from "@/components/lecturer/LecturerDashboard";

import { supabase } from "@/lib/supabase/client";

type Booking = {
  id: number;
  student_name: string;
  lecturer_id: number;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
  reason: string | null;
  status: string;
};

export default function LecturerDashboardPage() {
  const [lecturerName, setLecturerName] =
    useState("Lecturer");

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      // -----------------------------------
      // 1. Get currently logged-in user
      // -----------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage(
          "Lecturer is not authenticated."
        );

        return;
      }

      // -----------------------------------
      // 2. Check lecturer role
      // -----------------------------------

      const role =
        user.user_metadata?.role;

      if (role && role !== "lecturer") {
        setMessage(
          "This account is not a lecturer account."
        );

        return;
      }

      // -----------------------------------
      // 3. Get lecturer name
      // -----------------------------------

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Lecturer";

      setLecturerName(name);

      // -----------------------------------
      // 4. Get bookings from API
      // -----------------------------------

      const response = await fetch(
        "/api/bookings",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setMessage(
          result.message ||
            "Could not load bookings."
        );

        return;
      }

      // API might return:
      //
      // [...]
      //
      // OR:
      //
      // { bookings: [...] }

      const allBookings: Booking[] =
        Array.isArray(result)
          ? result
          : result.bookings || [];

      // -----------------------------------
      // 5. Find bookings for this lecturer
      // -----------------------------------

      const lecturerBookings =
        allBookings.filter((booking) => {
          if (!booking.lecturer_name) {
            return false;
          }

          return (
            booking.lecturer_name
              .trim()
              .toLowerCase() ===
            name.trim().toLowerCase()
          );
        });

      setBookings(lecturerBookings);

    } catch (error) {
      console.error(
        "Lecturer dashboard error:",
        error
      );

      setMessage(
        "Something went wrong while loading the lecturer dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">

      {/* --------------------------------
          Lecturer Sidebar
          Logout button is inside here
      --------------------------------- */}

      <LecturerSidebar />

      {/* --------------------------------
          Main Content
      --------------------------------- */}

      <main className="min-w-0 flex-1 px-8 py-6">

        {/* Lecturer Topbar */}

        <LecturerTopbar
          name={lecturerName}
          title="Lecturer Dashboard"
        />

        {/* Message */}

        {message && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {message}
          </div>
        )}

        {/* Dashboard */}

        <LecturerDashboard
          lecturerName={lecturerName}
          bookings={bookings}
          loading={loading}
        />

      </main>
    </div>
  );
}