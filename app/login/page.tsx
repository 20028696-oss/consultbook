"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type LoginRole = "student" | "lecturer" | "admin";

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] =
    useState<LoginRole>("student");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const roleLabel: Record<LoginRole, string> = {
    student: "Student",
    lecturer: "Lecturer",
    admin: "Admin",
  };

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");

    // Check fields
    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // 1. LOGIN WITH SUPABASE
      // ==========================================

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.user) {
        setMessage("Login failed. Please try again.");
        return;
      }

      // ==========================================
      // 2. GET USER ROLE
      // ==========================================

      const userRole =
        data.user.user_metadata?.role
          ?.toString()
          .toLowerCase();

      // Make sure role is valid
      if (
        userRole !== "student" &&
        userRole !== "lecturer" &&
        userRole !== "admin"
      ) {
        await supabase.auth.signOut();

        setMessage(
          "User role was not found. Please contact the administrator."
        );

        return;
      }

      // TypeScript now knows this is a valid LoginRole
      const typedUserRole: LoginRole = userRole;

      // ==========================================
      // 3. CHECK SELECTED LOGIN TYPE
      // ==========================================

      if (typedUserRole !== selectedRole) {
        await supabase.auth.signOut();

        setMessage(
          `This account is registered as ${
            roleLabel[typedUserRole]
          }. Please select ${
            roleLabel[typedUserRole]
          } Login.`
        );

        return;
      }

      // ==========================================
      // 4. CHECK MFA / TWO-FACTOR
      // ==========================================

      const {
        data: factorsData,
        error: factorsError,
      } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error(
          "MFA factor error:",
          factorsError
        );

        setMessage(
          "Could not check two-factor authentication."
        );

        return;
      }

      // ==========================================
      // 5. CHECK FOR VERIFIED TOTP FACTOR
      // ==========================================

      const verifiedFactor =
        factorsData.totp.find(
          (factor) =>
            factor.status === "verified"
        );

      // ==========================================
      // 6. MFA ALREADY SET UP
      // ==========================================

      if (verifiedFactor) {
        router.push("/two-factor");
        return;
      }

      // ==========================================
      // 7. MFA NOT SET UP
      // ==========================================

      router.push("/two-factor/setup");
      return;

    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role: LoginRole) => {
    setSelectedRole(role);
    setMessage("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#14213d] px-4 py-10">

      {/* LOGIN CARD */}
      <div className="w-full max-w-[585px] rounded-[28px] bg-[#f8f9fb] px-10 py-11 shadow-2xl sm:px-12">

        {/* LOGO */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2f63c8] text-xl font-bold text-white">
            C
          </div>

          <h1 className="text-2xl font-bold text-[#263451]">
            ConsultBook
          </h1>
        </div>

        {/* HEADING */}
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-[#263451]">
            Welcome Back!
          </h2>

          <p className="mt-3 text-base text-slate-500">
            Sign in to manage your consultations
          </p>
        </div>

        {/* CURRENT LOGIN TYPE */}
        <div className="mt-7 rounded-xl bg-blue-50 px-4 py-3 text-center">

          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Logging in as
          </p>

          <p className="mt-1 font-bold text-blue-700">
            {roleLabel[selectedRole]}
          </p>

        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleLogin}
          className="mt-7"
        >

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-bold tracking-[0.15em] text-slate-500">
              EMAIL ADDRESS
            </label>

            <div className="relative">

              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                ✉
              </span>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-4 text-base text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

            </div>
          </div>

          {/* PASSWORD */}
          <div className="mt-7">

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-bold tracking-[0.15em] text-slate-500">
                PASSWORD
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Forgot password?
              </Link>

            </div>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-14 text-base text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-5 top-1/2 -translate-y-1/2 text-lg"
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>
          </div>

          {/* ERROR MESSAGE */}
          {message && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
              {message}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-[#2f63c8] py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading
              ? "Logging in..."
              : `Login as ${roleLabel[selectedRole]}`}
          </button>

        </form>

        {/* REGISTER */}
        <div className="mt-7 text-center text-base text-slate-500">

          Don't have an account?{" "}

          <Link
            href="/register"
            className="font-bold text-[#315ca8] hover:text-blue-700"
          >
            Register
          </Link>

        </div>

        {/* FOOTER */}
        <div className="mt-8 border-t border-slate-200 pt-5 text-center text-sm text-slate-400">
          © 2026 ConsultBook
        </div>

      </div>

      {/* ROLE SELECTION */}
      <div className="mt-7 text-center">

        <p className="text-base text-slate-300">
          Choose your login type
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-4">

          {/* STUDENT */}
          <button
            type="button"
            onClick={() =>
              selectRole("student")
            }
            className={`rounded-xl border px-6 py-3 font-semibold transition ${
              selectedRole === "student"
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-slate-300 text-white hover:bg-white/10"
            }`}
          >
            Student Login
          </button>

          {/* LECTURER */}
          <button
            type="button"
            onClick={() =>
              selectRole("lecturer")
            }
            className={`rounded-xl border px-6 py-3 font-semibold transition ${
              selectedRole === "lecturer"
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-slate-300 text-white hover:bg-white/10"
            }`}
          >
            Lecturer Login
          </button>

          {/* ADMIN */}
          <button
            type="button"
            onClick={() =>
              selectRole("admin")
            }
            className={`rounded-xl border px-6 py-3 font-semibold transition ${
              selectedRole === "admin"
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-slate-300 text-white hover:bg-white/10"
            }`}
          >
            Admin Login
          </button>

        </div>
      </div>

    </main>
  );
}