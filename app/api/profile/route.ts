
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

/* GET PROFILE */
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

    // If no profile row exists yet, return basic user information
    if (!data) {
      return NextResponse.json(
        {
          id: user.id,
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          student_id: "",
          course: "",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);

    return NextResponse.json(
      { message: "Failed to get profile." },
      { status: 500 }
    );
  }
}

/* UPDATE PROFILE */
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

    const { full_name, student_id, course } = body;

    const profileData = {
      id: user.id,
      full_name,
      email: user.email || "",
      student_id,
      course,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData, {
        onConflict: "id",
      })
      .select()
      .single();

    if (error) {
      console.error("Update profile error:", error);

      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        profile: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile API error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}