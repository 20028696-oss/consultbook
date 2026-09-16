import {
  NextRequest,
  NextResponse,
} from "next/server";

import { supabase } from "@/lib/supabase/client";

/* =====================================================
   GET CONSULTATION NOTE
   /api/consultation-notes?bookingId=5
===================================================== */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const bookingId =
      searchParams.get(
        "bookingId"
      );

    if (!bookingId) {
      return NextResponse.json(
        {
          message:
            "Booking ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const numericBookingId =
      Number(bookingId);

    if (!numericBookingId) {
      return NextResponse.json(
        {
          message:
            "Invalid booking ID.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        "consultation_notes"
      )
      .select("*")
      .eq(
        "booking_id",
        numericBookingId
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Get consultation note error:",
        error
      );

      return NextResponse.json(
        {
          message:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        note: data || null,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Consultation notes GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load consultation notes.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   POST CONSULTATION NOTE

   Creates a note if one does not exist.
   Updates the note if it already exists.
===================================================== */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const {
      booking_id,
      notes,
    } = body;

    if (!booking_id) {
      return NextResponse.json(
        {
          message:
            "Booking ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !notes ||
      !notes.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Consultation notes are required.",
        },
        {
          status: 400,
        }
      );
    }

    const numericBookingId =
      Number(booking_id);

    if (!numericBookingId) {
      return NextResponse.json(
        {
          message:
            "Invalid booking ID.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------
       Check booking
    ------------------------------------------- */

    const {
      data: booking,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .select(
        `
        id,
        student_name,
        lecturer_name,
        subject,
        booking_date,
        booking_time,
        status
        `
      )
      .eq(
        "id",
        numericBookingId
      )
      .single();

    if (
      bookingError ||
      !booking
    ) {
      console.error(
        "Booking lookup error:",
        bookingError
      );

      return NextResponse.json(
        {
          message:
            "Booking was not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -------------------------------------------
       Notes only allowed after completion
    ------------------------------------------- */

    if (
      booking.status
        ?.toLowerCase() !==
      "completed"
    ) {
      return NextResponse.json(
        {
          message:
            "Consultation notes can only be added after the consultation is completed.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------
       Check existing note
    ------------------------------------------- */

    const {
      data: existingNote,
      error:
        existingNoteError,
    } = await supabase
      .from(
        "consultation_notes"
      )
      .select("id")
      .eq(
        "booking_id",
        numericBookingId
      )
      .maybeSingle();

    if (
      existingNoteError
    ) {
      console.error(
        "Existing note check error:",
        existingNoteError
      );

      return NextResponse.json(
        {
          message:
            existingNoteError.message,
        },
        {
          status: 500,
        }
      );
    }

    /* -------------------------------------------
       UPDATE existing note
    ------------------------------------------- */

    if (existingNote) {
      const {
        data,
        error,
      } = await supabase
        .from(
          "consultation_notes"
        )
        .update({
          notes:
            notes.trim(),
        })
        .eq(
          "id",
          existingNote.id
        )
        .select()
        .single();

      if (error) {
        console.error(
          "Update consultation note error:",
          error
        );

        return NextResponse.json(
          {
            message:
              error.message,
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json(
        {
          message:
            "Consultation notes updated successfully.",

          note: data,
        },
        {
          status: 200,
        }
      );
    }

    /* -------------------------------------------
       CREATE new note
    ------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from(
        "consultation_notes"
      )
      .insert([
        {
          booking_id:
            numericBookingId,

          notes:
            notes.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(
        "Create consultation note error:",
        error
      );

      return NextResponse.json(
        {
          message:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Consultation notes saved successfully.",

        note: data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Consultation notes POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to save consultation notes.",
      },
      {
        status: 500,
      }
    );
  }
}