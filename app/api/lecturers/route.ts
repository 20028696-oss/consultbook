import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET all lecturers
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("lecturers")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching lecturers:", error);

      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Server error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while fetching lecturers.",
      },
      {
        status: 500,
      }
    );
  }
}