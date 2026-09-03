import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/* =====================================================
   GET ALL BOOKINGS
   Used by lecturer/dashboard and other booking pages
===================================================== */

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", {
        ascending: true,
      })
      .order("booking_time", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error fetching bookings:",
        error
      );

      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      data || [],
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET bookings error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while fetching bookings.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   POST NEW BOOKING
===================================================== */

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      student_id,
      student_name,
      lecturer_id,
      lecturer_name,
      subject,
      booking_date,
      booking_time,
      reason,
    } = body;

    /* Required fields */
    if (
      !student_id ||
      !student_name ||
      !lecturer_id ||
      !lecturer_name ||
      !booking_date ||
      !booking_time
    ) {
      return NextResponse.json(
        {
          message:
            "Please provide all required booking information.",
        },
        {
          status: 400,
        }
      );
    }

    /* Check duplicate booking */
    const {
      data: existingBooking,
      error: duplicateError,
    } = await supabase
      .from("bookings")
      .select("id")
      .eq(
        "student_id",
        student_id
      )
      .eq(
        "lecturer_id",
        lecturer_id
      )
      .eq(
        "booking_date",
        booking_date
      )
      .eq(
        "booking_time",
        booking_time
      )
      .in(
        "status",
        [
          "pending",
          "confirmed",
        ]
      )
      .maybeSingle();

    if (duplicateError) {
      console.error(
        "Duplicate booking check error:",
        duplicateError
      );
    }

    if (existingBooking) {
      return NextResponse.json(
        {
          message:
            "You already have a booking with this lecturer at this date and time.",
        },
        {
          status: 409,
        }
      );
    }

    /* Create booking */
    const {
      data,
      error,
    } = await supabase
      .from("bookings")
      .insert([
        {
          student_id,
          student_name,

          lecturer_id,
          lecturer_name,

          subject:
            subject || null,

          booking_date,
          booking_time,

          reason:
            reason || null,

          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(
        "Error creating booking:",
        error
      );

      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Booking created successfully.",

        booking: data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST booking error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while creating the booking.",
      },
      {
        status: 500,
      }
    );
  }
}
