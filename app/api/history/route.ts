import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/* =========================================
   GET CONSULTATION HISTORY
   /api/history?lecturerName=Dr.%20Aroba%20Khan
========================================= */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const lecturerName =
      searchParams.get("lecturerName");

    if (!lecturerName) {
      return NextResponse.json(
        {
          message:
            "Lecturer name is required.",
        },
        {
          status: 400,
        }
      );
    }

    // Get completed bookings
    const {
      data: bookings,
      error: bookingsError,
    } = await supabase
      .from("bookings")
      .select(`
        id,
        student_name,
        lecturer_name,
        subject,
        booking_date,
        booking_time,
        status
      `)
      .eq("status", "completed")
      .order("booking_date", {
        ascending: false,
      })
      .order("booking_time", {
        ascending: false,
      });

    if (bookingsError) {
      console.error(
        "History bookings error:",
        bookingsError
      );

      return NextResponse.json(
        {
          message:
            bookingsError.message,
        },
        {
          status: 500,
        }
      );
    }

    const normalizeName = (
      value: string
    ) => {
      return value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    };

    // Keep only this lecturer's completed bookings
    const lecturerBookings =
      (bookings || []).filter(
        (booking) =>
          normalizeName(
            booking.lecturer_name || ""
          ) ===
          normalizeName(
            lecturerName
          )
      );

    if (
      lecturerBookings.length === 0
    ) {
      return NextResponse.json(
        {
          history: [],
        },
        {
          status: 200,
        }
      );
    }

    const bookingIds =
      lecturerBookings.map(
        (booking) => booking.id
      );

    // Get notes for those bookings
    const {
      data: notes,
      error: notesError,
    } = await supabase
      .from("consultation_notes")
      .select(`
        id,
        booking_id,
        notes,
        created_at
      `)
      .in(
        "booking_id",
        bookingIds
      );

    if (notesError) {
      console.error(
        "History notes error:",
        notesError
      );

      return NextResponse.json(
        {
          message:
            notesError.message,
        },
        {
          status: 500,
        }
      );
    }

    // Combine booking + note
    const history =
      lecturerBookings.map(
        (booking) => {
          const note =
            (notes || []).find(
              (item) =>
                item.booking_id ===
                booking.id
            );

          return {
            ...booking,

            note: note
              ? {
                  id: note.id,
                  notes: note.notes,
                  created_at:
                    note.created_at,
                }
              : null,
          };
        }
      );

    return NextResponse.json(
      {
        history,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Consultation history error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load consultation history.",
      },
      {
        status: 500,
      }
    );
  }
}