"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminStats from "@/components/admin/AdminStats";
import RecentActivity from "@/components/admin/RecentActivity";

type DashboardStats = {
  totalUsers: number;
  students: number;
  lecturers: number;
  bookings: number;
};

type Activity = {
  type: string;
  title: string;
  description: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const [adminName, setAdminName] =
    useState("Admin User");

  const [stats, setStats] =
    useState<DashboardStats>({
      totalUsers: 0,
      students: 0,
      lecturers: 0,
      bookings: 0,
    });

  const [recentActivity, setRecentActivity] =
    useState<Activity[]>([]);

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

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setMessage(
          "Admin is not authenticated."
        );
        return;
      }

      const user = session.user;

      const role =
        user.user_metadata?.role
          ?.toString()
          .toLowerCase();

      if (role !== "admin") {
        setMessage(
          "This account is not registered as an administrator."
        );
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Admin User";

      setAdminName(name);

      const response = await fetch(
        "/api/admin/dashboard",
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
          ? JSON.parse(responseText)
          : {};
      } catch (error) {
        console.error(
          "Admin API returned invalid response:",
          responseText
        );

        setMessage(
          "Admin dashboard API failed. Check the terminal."
        );

        return;
      }

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to load admin dashboard."
        );
        return;
      }

      setStats(
        data.stats || {
          totalUsers: 0,
          students: 0,
          lecturers: 0,
          bookings: 0,
        }
      );

      setRecentActivity(
        data.recentActivity || []
      );
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      setMessage(
        "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
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
          title="Admin Dashboard"
        />

        <main className="p-8">

          {/* Welcome */}
          <div>
            <h2 className="text-2xl font-bold text-[#14244a]">
              Welcome back, {adminName}!
            </h2>

            <p className="mt-2 text-base text-slate-500">
              Monitor and manage your ConsultBook platform.
            </p>
          </div>

          {/* Error */}
          {message && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {message}
            </div>
          )}

          {/* Statistics */}
          <div className="mt-8">
            <AdminStats
              totalUsers={
                stats.totalUsers
              }
              students={
                stats.students
              }
              lecturers={
                stats.lecturers
              }
              bookings={
                stats.bookings
              }
              loading={
                loading
              }
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold text-[#14244a]">
              Quick Actions
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage important areas of the platform.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <Link
                href="/admin/users"
                className="rounded-lg bg-blue-600 px-5 py-4 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                Manage Users →
              </Link>

              <Link
                href="/admin/reports"
                className="rounded-lg border border-blue-600 bg-white px-5 py-4 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Generate Reports →
              </Link>

            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <RecentActivity
              activities={
                recentActivity
              }
              loading={
                loading
              }
            />
          </div>

        </main>
      </div>
    </div>
  );
}