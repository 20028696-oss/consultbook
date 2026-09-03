"use client";

import { useEffect, useState } from "react";
import LecturerSidebar from "@/components/lecturer/LecturerSidebar";
import LecturerTopbar from "@/components/lecturer/LecturerTopbar";
import ConsultationHistoryTable from "@/components/lecturer/ConsultationHistoryTable";
import { supabase } from "@/lib/supabase/client";

export default function LecturerHistoryPage() {
  const [lecturerName, setLecturerName] = useState("Lecturer");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const name =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Lecturer";

    setLecturerName(name);

    const response = await fetch("/api/history", {
      cache: "no-store",
    });

    const data = await response.json();

    const rows = Array.isArray(data)
      ? data
      : data.history || [];

    setHistory(
      rows.filter(
        (item: any) =>
          !item.lecturer_name ||
          item.lecturer_name.toLowerCase() === name.toLowerCase()
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <LecturerSidebar />

      <main className="flex-1 px-8 py-6">
        <LecturerTopbar
          name={lecturerName}
          title="Consultation History"
        />

        <h1 className="text-2xl font-bold text-[#14244a]">
          Consultation History
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View completed consultations and previous student sessions.
        </p>

        <div className="mt-6">
          <ConsultationHistoryTable
            consultations={history}
          />
        </div>
      </main>
    </div>
  );
}