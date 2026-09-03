
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    upcoming: 0,
    cancelled: 0,
  });

  useEffect(() => {
    getStats();
  }, []);

  const getStats = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("status, booking_date");

    if (error) {
      console.error("Error loading dashboard stats:", error);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const completed =
      data?.filter(
        (booking) => booking.status.toLowerCase() === "completed"
      ).length || 0;

    const pending =
      data?.filter(
        (booking) => booking.status.toLowerCase() === "pending"
      ).length || 0;

    const cancelled =
      data?.filter(
        (booking) => booking.status.toLowerCase() === "cancelled"
      ).length || 0;

    const upcoming =
      data?.filter(
        (booking) =>
          booking.booking_date >= today &&
          booking.status.toLowerCase() !== "cancelled" &&
          booking.status.toLowerCase() !== "completed"
      ).length || 0;

    setStats({
      completed,
      pending,
      upcoming,
      cancelled,
    });
  };

  const statItems = [
    {
      title: "COMPLETED",
      value: stats.completed,
    },
    {
      title: "PENDING",
      value: stats.pending,
    },
    {
      title: "UPCOMING",
      value: stats.upcoming,
    },
    {
      title: "CANCELLED",
      value: stats.cancelled,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-bold tracking-wider text-slate-400">
            {stat.title}
          </p>

          <p className="mt-3 text-3xl font-bold text-[#14244a]">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

