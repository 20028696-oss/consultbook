import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
  Normal client:
  used to verify the currently logged-in admin
*/
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/*
  Admin/server client:
  used ONLY on the server to read Authentication users.

  IMPORTANT:
  SUPABASE_SERVICE_ROLE_KEY must NEVER start with NEXT_PUBLIC_
  and must NEVER be imported into a client component.
*/
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getAccessToken(request: NextRequest) {
  const authorization =
    request.headers.get("Authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return null;
  }

  return authorization.replace("Bearer ", "");
}

export async function GET(
  request: NextRequest
) {
  try {
    /*
      -----------------------------------------
      1. Verify logged-in user
      -----------------------------------------
    */

    const token =
      getAccessToken(request);

    if (!token) {
      return NextResponse.json(
        {
          message:
            "Admin is not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(
      token
    );

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          message:
            "Admin is not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const role =
      user.user_metadata?.role
        ?.toString()
        .toLowerCase();

    if (role !== "admin") {
      return NextResponse.json(
        {
          message:
            "Only administrators can access this dashboard.",
        },
        {
          status: 403,
        }
      );
    }

    /*
      -----------------------------------------
      2. Get all Authentication users
      -----------------------------------------
    */

    const {
      data: usersData,
      error: usersError,
    } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error(
        "Admin users error:",
        usersError
      );

      return NextResponse.json(
        {
          message:
            usersError.message,
        },
        {
          status: 500,
        }
      );
    }

    const users =
      usersData.users || [];

    /*
      -----------------------------------------
      3. Count users by role
      -----------------------------------------
    */

    const students =
      users.filter(
        (item) =>
          item.user_metadata?.role
            ?.toString()
            .toLowerCase() ===
          "student"
      );

    const lecturers =
      users.filter(
        (item) =>
          item.user_metadata?.role
            ?.toString()
            .toLowerCase() ===
          "lecturer"
      );

    /*
      Total users includes:
      student + lecturer + admin accounts
    */
    const totalUsers =
      users.length;

    /*
      -----------------------------------------
      4. Get bookings
      -----------------------------------------
    */

    const {
      data: bookings,
      error: bookingsError,
    } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        student_name,
        lecturer_name,
        subject,
        booking_date,
        booking_time,
        status,
        created_at
        `
      )
      .order("created_at", {
        ascending: false,
      });

    if (bookingsError) {
      console.error(
        "Admin booking error:",
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

    const bookingList =
      bookings || [];

    /*
      -----------------------------------------
      5. Build Recent Activity
      -----------------------------------------
    */

    type Activity = {
      type: string;
      title: string;
      description: string;
      created_at: string;
    };

    const activity: Activity[] =
      [];

    /*
      Recent registered users
    */

    users.forEach((account) => {
      const accountRole =
        account.user_metadata?.role
          ?.toString()
          .toLowerCase();

      const accountName =
        account.user_metadata
          ?.full_name ||
        account.email ||
        "User";

      if (
        accountRole ===
        "student"
      ) {
        activity.push({
          type: "student",
          title:
            "New student account registered",
          description: `${accountName} joined ConsultBook.`,
          created_at:
            account.created_at,
        });
      }

      if (
        accountRole ===
        "lecturer"
      ) {
        activity.push({
          type: "lecturer",
          title:
            "New lecturer account registered",
          description: `${accountName} joined ConsultBook as a lecturer.`,
          created_at:
            account.created_at,
        });
      }
    });

    /*
      Booking activity
    */

    bookingList.forEach(
      (booking) => {
        activity.push({
          type: "booking",

          title:
            "New consultation booking created",

          description: `${booking.student_name} requested a consultation with ${booking.lecturer_name}.`,

          created_at:
            booking.created_at,
        });
      }
    );

    /*
      Sort newest first
    */

    activity.sort(
      (a, b) =>
        new Date(
          b.created_at
        ).getTime() -
        new Date(
          a.created_at
        ).getTime()
    );

    /*
      Only latest 5
    */

    const recentActivity =
      activity.slice(0, 5);

    return NextResponse.json(
      {
        stats: {
          totalUsers,
          students:
            students.length,
          lecturers:
            lecturers.length,
          bookings:
            bookingList.length,
        },

        recentActivity,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Admin dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load admin dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}