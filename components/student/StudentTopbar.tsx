"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function StudentTopbar() {
  const [name, setName] = useState("Student");
  const [initials, setInitials] = useState("ST");

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        const studentName =
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Student";

        setName(studentName);

        const studentInitials = studentName
          .split(" ")
          .filter(Boolean)
          .map((word: string) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        setInitials(studentInitials || "ST");
      } catch (error) {
        console.error("Student topbar error:", error);
      }
    };

    loadStudent();
  }, []);

  return (
    <header className="fixed left-60 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-7">
      <h1 className="text-xl font-bold text-[#14244a]">
        Student Dashboard
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2463eb] text-sm font-bold text-white">
          {initials}
        </div>

        <div>
          <p className="text-sm font-bold text-[#14244a]">
            {name}
          </p>

          <p className="text-xs text-slate-400">
            Student
          </p>
        </div>
      </div>
    </header>
  );
}