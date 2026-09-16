import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getAccessToken(request: NextRequest) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "");
}

/* =====================================================
   GET PROFILE
===================================================== */

export async function GET(request: NextRequest) {
  try {
    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json(
        { message: "User is not authenticated." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { message: "User is not authenticated." },
        { status: 401 }
      );
    }

    const authRole =
      user.user_metadata?.role
        ?.toString()
        .toLowerCase() || "student";

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    /*
     * If no profile exists yet, return
     * information from Supabase Auth.
     */
    if (!data) {
      return NextResponse.json(
        {
          id: user.id,
          full_name:
            user.user_metadata?.full_name || "",
          email: user.email || "",
          student_id: null,
          course: "",
          role: authRole,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      data,
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return NextResponse.json(
      { message: "Failed to get profile." },
      { status: 500 }
    );
  }
}

/* =====================================================
   UPDATE PROFILE
===================================================== */

export async function PATCH(request: NextRequest) {
  try {
    const token = getAccessToken(request);

    if (!token) {
      return NextResponse.json(
        { message: "User is not authenticated." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { message: "User is not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      full_name,
      student_id,
      course,
    } = body;

    /*
     * IMPORTANT:
     * Get the role from the authenticated
     * Supabase user instead of trusting
     * a role sent from the frontend.
     */
    const authRole =
      user.user_metadata?.role
        ?.toString()
        .toLowerCase() || "student";

    /*
     * Build profile according to the
     * authenticated user's role.
     */
    const profileData = {
      id: user.id,

      full_name:
        full_name?.trim() ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User",

      email:
        user.email || "",

      /*
       * Only students should have a student ID.
       */
      student_id:
        authRole === "student"
          ? student_id || null
          : null,

      course:
        course?.trim() || null,

      /*
       * Keep profiles.role synchronized
       * with Supabase Auth.
       */
      role: authRole,

      updated_at:
        new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        profileData,
        {
          onConflict: "id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Update profile error:",
        error
      );

      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    /*
     * Keep Auth full_name synchronized too.
     */
    const { error: metadataError } =
      await supabase.auth.updateUser({
        data: {
          full_name:
            profileData.full_name,

          role:
            authRole,
        },
      });

    if (metadataError) {
      console.error(
        "Auth metadata update error:",
        metadataError
      );
    }

    return NextResponse.json(
      {
        message:
          "Profile updated successfully.",

        profile: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Profile API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
