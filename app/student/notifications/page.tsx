"use client";

import {
  useEffect,
  useState,
} from "react";

import StudentSidebar from "@/components/student/StudentSidebar";
import StudentTopbar from "@/components/student/StudentTopbar";

import { supabase } from "@/lib/supabase/client";

type Notification = {
  id: number;
  booking_id: number | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const getSession =
    async () => {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      return session;
    };

  const loadNotifications =
    async () => {
      try {
        setLoading(true);
        setMessage("");

        const session =
          await getSession();

        if (!session) {
          setMessage(
            "User is not authenticated."
          );
          return;
        }

        const response =
          await fetch(
            "/api/notifications",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              cache:
                "no-store",
            }
          );

        const responseText =
          await response.text();

        let data: any = {};

        try {
          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : {};
        } catch {
          setMessage(
            "Notifications API returned an invalid response."
          );

          return;
        }

        if (!response.ok) {
          setMessage(
            data.message ||
              "Failed to load notifications."
          );

          return;
        }

        setNotifications(
          data.notifications ||
            []
        );
      } catch (error) {
        console.error(
          "Notifications error:",
          error
        );

        setMessage(
          "Something went wrong while loading notifications."
        );
      } finally {
        setLoading(false);
      }
    };

  const markAsRead =
    async (
      id: number
    ) => {
      const session =
        await getSession();

      if (!session) {
        return;
      }

      const response =
        await fetch(
          "/api/notifications",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                id,
              }),
          }
        );

      if (response.ok) {
        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item.id === id
                  ? {
                      ...item,
                      is_read:
                        true,
                    }
                  : item
            )
        );
      }
    };

  const markAllAsRead =
    async () => {
      const session =
        await getSession();

      if (!session) {
        return;
      }

      const response =
        await fetch(
          "/api/notifications",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                markAll:
                  true,
              }),
          }
        );

      if (response.ok) {
        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                is_read:
                  true,
              })
            )
        );
      }
    };

  const formatDate = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleString(
      "en-AU",
      {
        day:
          "numeric",
        month:
          "short",
        year:
          "numeric",
        hour:
          "2-digit",
        minute:
          "2-digit",
      }
    );
  };

  const getTypeStyle = (
    type: string
  ) => {
    switch (
      type.toLowerCase()
    ) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const unreadCount =
    notifications.filter(
      (item) =>
        !item.is_read
    ).length;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">

      <StudentSidebar />
      <StudentTopbar />

      <main className="ml-60 pt-20">
        <div className="p-7">

          {/* Heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h1 className="text-2xl font-bold text-[#14244a]">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View updates about your consultation bookings.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Mark All as Read
              </button>
            )}

          </div>

          {/* Unread count */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Unread Notifications
            </p>

            <p className="mt-2 text-3xl font-bold text-[#14244a]">
              {unreadCount}
            </p>

          </div>

          {message && (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
              {message}
            </div>
          )}

          {/* Notifications */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="p-10 text-center">

                <p className="font-semibold text-[#263451]">
                  No notifications
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Booking updates will appear here.
                </p>

              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={
                      notification.id
                    }
                    className={`border-b border-slate-200 p-6 last:border-b-0 ${
                      notification.is_read
                        ? "bg-white"
                        : "bg-blue-50/50"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-3">

                          <h2 className="font-bold text-[#263451]">
                            {
                              notification.title
                            }
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${getTypeStyle(
                              notification.type
                            )}`}
                          >
                            {
                              notification.type
                            }
                          </span>

                          {!notification.is_read && (
                            <span className="rounded-full bg-blue-600 px-2 py-1 text-[9px] font-bold text-white">
                              NEW
                            </span>
                          )}

                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {
                            notification.message
                          }
                        </p>

                        <p className="mt-3 text-xs text-slate-400">
                          {formatDate(
                            notification.created_at
                          )}
                        </p>

                      </div>

                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}

                    </div>
                  </div>
                )
              )
            )}

          </div>

        </div>
      </main>
    </div>
  );
}