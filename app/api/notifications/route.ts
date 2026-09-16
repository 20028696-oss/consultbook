import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClients() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const adminKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !anonKey || !adminKey) {
    throw new Error(
      "Supabase environment variables are missing."
    );
  }

  const supabase = createClient(
    supabaseUrl,
    anonKey
  );

  const supabaseAdmin = createClient(
    supabaseUrl,
    adminKey
  );

  return {
    supabase,
    supabaseAdmin,
  };
}

function getAccessToken(
  request: NextRequest
) {
  const authorization =
    request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "");
}

/* =========================================
   GET LOGGED-IN USER NOTIFICATIONS
========================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const token =
      getAccessToken(request);

    if (!token) {
      return NextResponse.json(
        {
          message: "User is not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      supabase,
      supabaseAdmin,
    } = getClients();

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
          message: "User is not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Notifications error:",
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
        notifications: data || [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Notifications GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load notifications.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   MARK NOTIFICATION AS READ
========================================= */

export async function PATCH(
  request: NextRequest
) {
  try {
    const token =
      getAccessToken(request);

    if (!token) {
      return NextResponse.json(
        {
          message: "User is not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      supabase,
      supabaseAdmin,
    } = getClients();

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
          message: "User is not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const {
      id,
      markAll,
    } = body;

    // Mark all notifications as read
    if (markAll) {
      const { error } =
        await supabaseAdmin
          .from("notifications")
          .update({
            is_read: true,
          })
          .eq("user_id", user.id);

      if (error) {
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
            "All notifications marked as read.",
        },
        {
          status: 200,
        }
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Notification ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const { error } =
      await supabaseAdmin
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq("id", Number(id))
        .eq("user_id", user.id);

    if (error) {
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
          "Notification marked as read.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Notifications PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update notification.",
      },
      {
        status: 500,
      }
    );
  }
}