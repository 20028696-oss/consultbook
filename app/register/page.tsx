


"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!fullName || !email || !role || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user) {
        alert(
          "Registration successful! Please check your email to confirm your account."
        );

        router.push("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="mb-6 text-center text-3xl font-bold text-blue-600">
          Create Account
        </h1>

        <p className="mb-6 text-center text-gray-600">
          Consultation Booking & Scheduling Platform
        </p>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-gray-700">
              User Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            >
              <option value="">
                Select Role
              </option>

              <option value="student">
  Student
</option>

<option value="lecturer">
  Lecturer
</option>

<option value="admin">
  Admin
</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?

          <Link
            href="/"
            className="ml-2 cursor-pointer text-blue-600"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}

