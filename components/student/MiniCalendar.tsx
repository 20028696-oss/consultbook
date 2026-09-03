"use client";

import { useState } from "react";

export default function MiniCalendar() {
  const [selectedDay, setSelectedDay] = useState<number>(19);

  const weeks: (number | null)[][] = [
    [null, null, null, null, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
    [null, null, null, null, null, null, null],
  ];

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:w-60">
      {/* Month Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ‹
        </button>

        <h3 className="text-sm font-bold text-[#14244a]">
          May 2026
        </h3>

        <button
          type="button"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ›
        </button>
      </div>

      {/* Week Days */}
      <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold text-slate-500">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Calendar Days */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 text-center"
          >
            {week.map((day, dayIndex) => (
              <button
                key={`${weekIndex}-${dayIndex}`}
                type="button"
                disabled={day === null}
                onClick={() => {
                  if (day !== null) {
                    setSelectedDay(day);
                  }
                }}
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  day !== null && selectedDay === day
                    ? "bg-[#2463eb] font-bold text-white"
                    : "text-[#263451] hover:bg-slate-100"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}