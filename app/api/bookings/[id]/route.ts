import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =====================================================
   GET ONE BOOKING
===================================================== */

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const bookingId = Number(id);

    if (!bookingId) {
      return NextResponse.json(
        {
          message: "Invalid booking ID.",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error) {
      console.error(
        "Get booking error:",
        error
      );

      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      data,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET booking error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to get booking.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   UPDATE BOOKING
   - student reschedule
   - lecturer status update
===================================================== */

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const bookingId = Number(id);

    if (!bookingId) {
      return NextResponse.json(
        {
          message: "Invalid booking ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const {
      booking_date,
      booking_time,
      status,
    } = body;

    const updateData: {
      booking_date?: string;
      booking_time?: string;
      status?: string;
    } = {};

    /* ---------------------------------------------
       RESCHEDULE
    --------------------------------------------- */

    if (
      booking_date ||
      booking_time
    ) {
      if (
        !booking_date ||
        !booking_time
      ) {
        return NextResponse.json(
          {
            message:
              "Both booking date and booking time are required when rescheduling.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.booking_date =
        booking_date;

      updateData.booking_time =
        booking_time;

      /*
        Rescheduled bookings return to pending
        unless another valid status is explicitly sent.
      */
      updateData.status =
        status?.toLowerCase() ||
        "pending";
    }

    /* ---------------------------------------------
       STATUS UPDATE
    --------------------------------------------- */

    if (
      status &&
      !booking_date &&
      !booking_time
    ) {
      const validStatuses = [
        "pending",
        "confirmed",
        "rejected",
        "cancelled",
        "completed",
      ];

      const normalisedStatus =
        status
          .toString()
          .toLowerCase();

      if (
        !validStatuses.includes(
          normalisedStatus
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Invalid booking status.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.status =
        normalisedStatus;
    }

    /* ---------------------------------------------
       NOTHING TO UPDATE
    --------------------------------------------- */

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Please provide booking information to update.",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------------------------------------
       UPDATE BOOKING
    --------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      console.error(
        "Update booking error:",
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

    /* =================================================
       CREATE STUDENT NOTIFICATION
    ================================================= */

    const updatedStatus =
      data.status
        ?.toString()
        .toLowerCase();

    if (
      data.student_id &&
      (
        updatedStatus === "confirmed" ||
        updatedStatus === "rejected" ||
        updatedStatus === "cancelled"
      )
    ) {
      let title = "";
      let notificationMessage = "";

      if (
        updatedStatus ===
        "confirmed"
      ) {
        title =
          "Booking Confirmed";

        notificationMessage =
          `Your consultation with ${data.lecturer_name} on ${data.booking_date} at ${data.booking_time} has been confirmed.`;
      }

      if (
        updatedStatus ===
        "rejected"
      ) {
        title =
          "Booking Rejected";

        notificationMessage =
          `Your consultation request with ${data.lecturer_name} has been rejected.`;
      }

      if (
        updatedStatus ===
        "cancelled"
      ) {
        title =
          "Booking Cancelled";

        notificationMessage =
          `Your consultation with ${data.lecturer_name} has been cancelled.`;
      }

      const {
        error:
          notificationError,
      } = await supabase
        .from("notifications")
        .insert([
          {
            user_id:
              data.student_id,

            booking_id:
              data.id,

            title,

            message:
              notificationMessage,

            type:
              updatedStatus,

            is_read:
              false,
          },
        ]);

      if (
        notificationError
      ) {
        console.error(
          "Notification creation error:",
          notificationError
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "Booking updated successfully.",
        booking: data,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH booking error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update booking.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   CANCEL BOOKING
===================================================== */

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const bookingId = Number(id);

    if (!bookingId) {
      return NextResponse.json(
        {
          message: "Invalid booking ID.",
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
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      console.error(
        "Cancel booking error:",
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

    /* =================================================
       CREATE CANCELLED NOTIFICATION
    ================================================= */

    if (
      data.student_id
    ) {
      const {
        error:
          notificationError,
      } = await supabase
        .from("notifications")
        .insert([
          {
            user_id:
              data.student_id,

            booking_id:
              data.id,

            title:
              "Booking Cancelled",

            message:
              `Your consultation with ${data.lecturer_name} on ${data.booking_date} at ${data.booking_time} has been cancelled.`,

            type:
              "cancelled",

            is_read:
              false,
          },
        ]);

      if (
        notificationError
      ) {
        console.error(
          "Cancelled notification error:",
          notificationError
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "Booking cancelled successfully.",
        booking: data,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE booking error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to cancel booking.",
      },
      {
        status: 500,
      }
    );
  }
}