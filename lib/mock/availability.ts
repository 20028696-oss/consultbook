export interface AvailabilitySlot {
  availability_id: string;
  date: string; // ISO date
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  is_available: boolean; // false once booked — matches booking_sync_slot trigger
}

// In-memory store — resets on dev server restart. Same pattern as
// lib/mock/schedule.ts so behaviour is consistent across the demo.
let SLOTS: AvailabilitySlot[] = [
  { availability_id: "av1", date: "2026-08-11", start_time: "10:00", end_time: "10:30", is_available: false },
  { availability_id: "av2", date: "2026-08-11", start_time: "14:00", end_time: "14:30", is_available: true },
  { availability_id: "av3", date: "2026-08-12", start_time: "11:00", end_time: "11:30", is_available: true },
  { availability_id: "av4", date: "2026-08-14", start_time: "15:00", end_time: "15:30", is_available: false },
];

export async function getAvailabilitySlots(): Promise<AvailabilitySlot[]> {
  return [...SLOTS].sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
}

export interface AddSlotInput {
  date: string;
  start_time: string;
  end_time: string;
}

export interface AddSlotResult {
  ok: boolean;
  error?: string;
}

/** Mirrors the DB constraints: end > start, and no duplicate slot for the same lecturer/date/start_time. */
export async function addAvailabilitySlot(input: AddSlotInput): Promise<AddSlotResult> {
  if (input.end_time <= input.start_time) {
    return { ok: false, error: "End time must be after start time." };
  }
  const duplicate = SLOTS.some(
    (s) => s.date === input.date && s.start_time === input.start_time
  );
  if (duplicate) {
    return { ok: false, error: "You already have a slot starting at that time on that date." };
  }
  SLOTS.push({
    availability_id: `av${Date.now()}`,
    date: input.date,
    start_time: input.start_time,
    end_time: input.end_time,
    is_available: true,
  });
  return { ok: true };
}

export async function deleteAvailabilitySlot(id: string): Promise<void> {
  SLOTS = SLOTS.filter((s) => s.availability_id !== id);
}
