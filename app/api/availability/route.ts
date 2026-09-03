import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getAccessToken(request: NextRequest) {
  const authorization =
    request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "");
}

/* =====================================================
   GET - GET LOGGED-IN LECTURER AVAILABILITY
===================================================== */

export async function GET(
  request: NextRequest
) {
  try {
    const token = getAccessToken(request);

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
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

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

    const { data, error } =
      await supabase
        .from("availability")
        .select("*")
        .eq("lecturer_id", user.id)
        .order("date", {
          ascending: true,
        })
        .order("start_time", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Get availability error:",
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
        availability: data || [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Availability GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load availability.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   POST - ADD AVAILABILITY SLOT
===================================================== */

export async function POST(
  request: NextRequest
) {
  try {
    const token = getAccessToken(request);

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
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

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

    // Make sure logged-in account is lecturer
    const role =
      user.user_metadata?.role
        ?.toString()
        .toLowerCase();

    if (role !== "lecturer") {
      return NextResponse.json(
        {
          message:
            "Only lecturers can add availability.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const {
      date,
      start_time,
      end_time,
    } = body;

    if (
      !date ||
      !start_time ||
      !end_time
    ) {
      return NextResponse.json(
        {
          message:
            "Date, start time and end time are required.",
        },
        {
          status: 400,
        }
      );
    }

    // End time must be later than start time
    if (end_time <= start_time) {
      return NextResponse.json(
        {
          message:
            "End time must be later than start time.",
        },
        {
          status: 400,
        }
      );
    }

    // Check duplicate slot
    const {
      data: existingSlot,
      error: existingError,
    } = await supabase
      .from("availability")
      .select("availability_id")
      .eq("lecturer_id", user.id)
      .eq("date", date)
      .eq("start_time", start_time)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Duplicate check error:",
        existingError
      );
    }

    if (existingSlot) {
      return NextResponse.json(
        {
          message:
            "This availability slot already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // Insert availability
    const { data, error } =
      await supabase
        .from("availability")
        .insert({
          lecturer_id: user.id,
          date,
          start_time,
          end_time,
          is_available: true,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "Add availability error:",
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
          "Availability added successfully.",
        availability: data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Availability POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to add availability.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   DELETE - REMOVE AVAILABILITY SLOT
===================================================== */

export async function DELETE(
  request: NextRequest
) {
  try {
    const token = getAccessToken(request);

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
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

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

    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Availability ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const { error } =
      await supabase
        .from("availability")
        .delete()
        .eq("availability_id", id)
        .eq("lecturer_id", user.id);

    if (error) {
      console.error(
        "Delete availability error:",
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
          "Availability deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Availability DELETE error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete availability.",
      },
      {
        status: 500,
      }
    );
  }
}
