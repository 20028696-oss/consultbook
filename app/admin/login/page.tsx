"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    // Temporary frontend login
    router.push("/admin/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1b2a47] px-4 py-10">
      <div className="w-full max-w-[650px]">
        {/* Login Card */}
        <div className="rounded-[35px] bg-[#f8f9fc] px-8 py-12 shadow-2xl sm:px-16">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#c56a00] text-2xl font-bold text-white shadow-lg">
              C
            </div>

            <h1 className="text-3xl font-bold tracking-wide text-[#263451]">
              ConsultBook
            </h1>
          </div>

          {/* Heading */}
          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold text-[#263451] sm:text-4xl">
              Admin Login
            </h2>

            <p className="mt-4 text-lg text-slate-500">
              Sign in to manage the ConsultBook platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-12">
            {/* Email */}
            <div>
              <label className="mb-3 block text-sm font-bold tracking-[0.2em] text-slate-500">
                EMAIL ADDRESS
              </label>

              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg">
                  ✉
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@koi.edu.au"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-5 pl-14 pr-5 text-lg text-slate-700 outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold tracking-[0.2em] text-slate-500">
                  PASSWORD
                </label>

                <Link
                  href="/forgot-password"
                  className="font-semibold text-[#b86b00] hover:text-[#8f5100]"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-5 pr-16 text-lg text-slate-700 outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-orange-200"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-xl"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="mt-10 w-full rounded-2xl bg-gradient-to-r from-[#e58a00] to-[#c96c00] py-5 text-xl font-bold text-white shadow-md transition hover:scale-[1.01] hover:from-[#f59e0b] hover:to-[#b85d00]"
            >
              Login as Administrator
            </button>
          </form>

          {/* Back to Main Login */}
          <div className="mt-9 text-center text-lg text-slate-500">
            Not an administrator?{" "}
            <Link
              href="/login"
              className="font-bold text-[#b86b00] hover:text-[#8f5100]"
            >
              Student Login
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-10 border-t border-slate-200 pt-6 text-center text-base text-slate-400">
            © 2026 ConsultBook
          </div>
        </div>

        {/* Lecturer Login */}
        <div className="mt-8 text-center">
          <p className="text-lg text-slate-300">
            Logging in as a lecturer?
          </p>

          <Link
            href="/lecturer/login"
            className="mt-4 inline-block rounded-xl border border-slate-300 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
          >
            Lecturer Login
          </Link>
        </div>
      </div>
    </main>
  );
}