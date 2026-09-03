


"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "If this email is registered, a password reset link has been sent. Please check your inbox."
      );
    } catch (error) {
      console.error("Password reset error:", error);
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

        {/* Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#14244a]">
            Forgot Password?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your email address and we will send you a password reset link.
          </p>

          {/* Email */}
          <div className="mt-7">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#2463eb] px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {/* Message */}
          {message && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 text-center text-sm font-semibold text-green-600">
              {message}
            </div>
          )}

          {/* Back */}
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

