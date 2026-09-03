import { createClient } from "./server";
import type { Availability } from "@/types/database";

export interface AddSlotInput {
  date: string;
  start_time: string;
  end_time: string;
}

export interface AddSlotResult {
  ok: boolean;
  error?: string;
}

/* Get all future availability slots */
export async function getAvailabilitySlots(): Promise<Availability[]> {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .gte("date", today)
    .eq("is_available", true)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error getting availability:", error);
    return [];
  }

  return (data || []) as Availability[];
}

/* Add a new availability slot */
export async function addAvailabilitySlot(
  input: AddSlotInput
): Promise<AddSlotResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: "You must be signed in to add availability.",
    };
  }

  /* Validate required fields */
  if (!input.date || !input.start_time || !input.end_time) {
    return {
      ok: false,
      error: "Please provide a date, start time, and end time.",
    };
  }

  /* Make sure end time is after start time */
  if (input.end_time <= input.start_time) {
    return {
      ok: false,
      error: "End time must be later than start time.",
    };
  }

  const { error } = await supabase
    .from("availability")
    .insert({
      lecturer_id: user.id,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      is_available: true,
    });

  if (error) {
    console.error("Error adding availability:", error);

    return {
      ok: false,
      error: error.message,
    };
  }

  return {
    ok: true,
  };
}

/* Delete an availability slot */
export async function deleteAvailabilitySlot(
  id: string
): Promise<AddSlotResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "You must be signed in.",
    };
  }

  const { error } = await supabase
    .from("availability")
    .delete()
    .eq("availability_id", id)
    .eq("lecturer_id", user.id);

  if (error) {
    console.error("Error deleting availability:", error);

    return {
      ok: false,
      error: error.message,
    };
  }

  return {
    ok: true,
  };
}