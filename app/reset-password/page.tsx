"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("info");

  /* =====================================================
     CHECK RECOVERY SESSION + MFA LEVEL
  ===================================================== */

  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        setCheckingSession(true);

        /* Check logged-in/recovery session */

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Session error:",
            sessionError
          );

          setMessageType("error");
          setMessage(
            "Unable to verify your password recovery session."
          );

          return;
        }

        if (!session) {
          setMessageType("error");
          setMessage(
            "Your password reset session is missing or has expired. Please request a new reset link."
          );

          return;
        }

        /* Check MFA assurance level */

        const {
          data: aalData,
          error: aalError,
        } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aalError) {
          console.error(
            "AAL check error:",
            aalError
          );

          setMessageType("error");
          setMessage(
            "Unable to check two-factor authentication."
          );

          return;
        }

        /*
          If Supabase says AAL2 is required
          but current session is only AAL1,
          send user to Two-Factor page.
        */

        if (
          aalData.nextLevel === "aal2" &&
          aalData.currentLevel !== "aal2"
        ) {
          router.replace(
            "/two-factor?redirect=/reset-password"
          );

          return;
        }

        /*
          Session is ready to reset password.
        */

        setMessage("");
      } catch (error) {
        console.error(
          "Recovery session check error:",
          error
        );

        setMessageType("error");
        setMessage(
          "Something went wrong while checking your reset session."
        );
      } finally {
        setCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, [router]);

  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const handleResetPassword = async () => {
    setMessage("");

    /* Check fields */

    if (!password || !confirmPassword) {
      setMessageType("error");
      setMessage(
        "Please fill in both password fields."
      );

      return;
    }

    /* Check passwords */

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage(
        "Passwords do not match."
      );

      return;
    }

    /* Password length */

    if (password.length < 6) {
      setMessageType("error");
      setMessage(
        "Password must be at least 6 characters."
      );

      return;
    }

    setLoading(true);

    try {
      /* =================================================
         CHECK SESSION AGAIN
      ================================================= */

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setMessageType("error");
        setMessage(
          "Your password reset session has expired. Please request a new reset link."
        );

        return;
      }

      /* =================================================
         CHECK MFA AGAIN BEFORE PASSWORD UPDATE
      ================================================= */

      const {
        data: aalData,
        error: aalError,
      } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        console.error(
          "AAL error:",
          aalError
        );

        setMessageType("error");
        setMessage(
          "Unable to verify your two-factor authentication status."
        );

        return;
      }

      /*
        Account has MFA but user has not
        completed MFA in this session.
      */

      if (
        aalData.nextLevel === "aal2" &&
        aalData.currentLevel !== "aal2"
      ) {
        router.push(
          "/two-factor?redirect=/reset-password"
        );

        return;
      }

      /* =================================================
         UPDATE PASSWORD
      ================================================= */

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        console.error(
          "Password update error:",
          error
        );

        /*
          Extra protection in case Supabase
          still reports AAL2 requirement.
        */

        if (
          error.message
            .toLowerCase()
            .includes("aal2")
        ) {
          router.push(
            "/two-factor?redirect=/reset-password"
          );

          return;
        }

        setMessageType("error");
        setMessage(error.message);

        return;
      }

      /* =================================================
         SUCCESS
      ================================================= */

      setMessageType("success");

      setMessage(
        "Password updated successfully! Redirecting to login..."
      );

      setPassword("");
      setConfirmPassword("");

      /*
        Sign out recovery session before
        returning to login.
      */

      setTimeout(async () => {
        await supabase.auth.signOut();

        router.push("/");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      setMessageType("error");
      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-4">
        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#2463eb] text-2xl font-bold text-white">
            C
          </div>

          <h1 className="mt-4 text-xl font-bold text-[#14244a]">
            ConsultBook
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Checking password recovery session...
          </p>

        </div>
      </main>
    );
  }

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
            Reset Password
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your new password below.
          </p>

          {/* Password */}

          <div className="mt-7">

            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
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
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm new password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Button */}

          <button
            type="button"
            onClick={
              handleResetPassword
            }
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#2463eb] px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading
              ? "Updating Password..."
              : "Reset Password"}
          </button>

          {/* Message */}

          {message && (
            <div
              className={`mt-4 rounded-lg p-4 text-center text-sm font-semibold ${
                messageType ===
                "success"
                  ? "bg-green-50 text-green-600"
                  : messageType ===
                    "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {message}
            </div>
          )}

          {/* Login */}

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


