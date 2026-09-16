import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAccessToken(request: NextRequest) {
  const authorization =
    request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "");
}

export async function GET(request: NextRequest) {
  try {
    // ------------------------------------------------
    // Environment variables
    // ------------------------------------------------

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Supports whichever server key you already use
    const adminKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        {
          message:
            "NEXT_PUBLIC_SUPABASE_URL is missing.",
        },
        {
          status: 500,
        }
      );
    }

    if (!anonKey) {
      return NextResponse.json(
        {
          message:
            "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.",
        },
        {
          status: 500,
        }
      );
    }

    if (!adminKey) {
      return NextResponse.json(
        {
          message:
            "Supabase server key is missing. Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY to .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    // ------------------------------------------------
    // Create Supabase clients
    // ------------------------------------------------

    const supabase = createClient(
      supabaseUrl,
      anonKey
    );

    const supabaseAdmin = createClient(
      supabaseUrl,
      adminKey
    );

    // ------------------------------------------------
    // Authenticate admin
    // ------------------------------------------------

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
    } =
      await supabase.auth.getUser(
        token
      );

    if (userError || !user) {
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
            "Only administrators can generate reports.",
        },
        {
          status: 403,
        }
      );
    }

    // ------------------------------------------------
    // Read report options
    // ------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const type =
      searchParams.get("type") ||
      "consultations";

    const fromDate =
      searchParams.get("from");

    const toDate =
      searchParams.get("to");

    // =================================================
    // CONSULTATIONS REPORT
    // =================================================

    if (type === "consultations") {
      let query =
        supabaseAdmin
          .from("bookings")
          .select(`
            id,
            student_name,
            lecturer_name,
            subject,
            booking_date,
            booking_time,
            status,
            created_at
          `)
          .order(
            "booking_date",
            {
              ascending: false,
            }
          );

      if (fromDate) {
        query = query.gte(
          "booking_date",
          fromDate
        );
      }

      if (toDate) {
        query = query.lte(
          "booking_date",
          toDate
        );
      }

      const {
        data,
        error,
      } = await query;

      if (error) {
        console.error(
          "Consultation report error:",
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

      const bookings =
        data || [];

      const summary = {
        total:
          bookings.length,

        confirmed:
          bookings.filter(
            (item) =>
              item.status
                ?.toLowerCase() ===
              "confirmed"
          ).length,

        pending:
          bookings.filter(
            (item) =>
              item.status
                ?.toLowerCase() ===
              "pending"
          ).length,

        completed:
          bookings.filter(
            (item) =>
              item.status
                ?.toLowerCase() ===
              "completed"
          ).length,

        cancelled:
          bookings.filter(
            (item) =>
              item.status
                ?.toLowerCase() ===
              "cancelled"
          ).length,
      };

      return NextResponse.json(
        {
          type:
            "consultations",

          summary,

          records:
            bookings,
        },
        {
          status: 200,
        }
      );
    }

    // =================================================
    // LECTURERS REPORT
    // =================================================

    if (type === "lecturers") {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("lecturers")
          .select("*");

      if (error) {
        console.error(
          "Lecturer report error:",
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
          type:
            "lecturers",

          summary: {
            total:
              data?.length || 0,
          },

          records:
            data || [],
        },
        {
          status: 200,
        }
      );
    }

    // =================================================
    // STUDENTS REPORT
    // =================================================

    if (type === "students") {
      const {
        data: usersData,
        error,
      } =
        await supabaseAdmin.auth.admin.listUsers(
          {
            page: 1,
            perPage: 1000,
          }
        );

      if (error) {
        console.error(
          "Student report error:",
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

      const students =
        usersData.users
          .filter(
            (item) =>
              item.user_metadata
                ?.role
                ?.toString()
                .toLowerCase() ===
              "student"
          )
          .map(
            (item) => ({
              id:
                item.id,

              full_name:
                item
                  .user_metadata
                  ?.full_name ||
                item.email?.split(
                  "@"
                )[0] ||
                "Student",

              email:
                item.email ||
                "",

              created_at:
                item.created_at,
            })
          );

      return NextResponse.json(
        {
          type:
            "students",

          summary: {
            total:
              students.length,
          },

          records:
            students,
        },
        {
          status: 200,
        }
      );
    }

    // ------------------------------------------------
    // Invalid report type
    // ------------------------------------------------

    return NextResponse.json(
      {
        message:
          "Invalid report type.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Reports API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate report.",
      },
      {
        status: 500,
      }
    );
  }
}