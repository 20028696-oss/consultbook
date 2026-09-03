


"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Check fields
    if (!password || !confirmPassword) {
      setMessage("Please fill in both password fields.");
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // Minimum password length
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Password updated successfully! Redirecting to login..."
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (error) {
      console.error("Password update error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#2463eb] text-2xl font-bold text-white">
            C
          </div>

          <h1 className="mt-3 text-xl font-bold text-[#14244a]">
            ConsultBook
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Book & Consult Platform
          </p>
        </div>

        {/* Reset Password Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-[#14244a]">
            Reset Password
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your new password below.
          </p>

          {/* New Password */}
          <div className="mt-7">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Confirm Password */}
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#2463eb] px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Updating Password..." : "Reset Password"}
          </button>

          {/* Message */}
          {message && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 text-center text-sm font-semibold text-green-600">
              {message}
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

