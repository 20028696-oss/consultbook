// Two-Factor Authentication Verification Page

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function TwoFactorPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [code, setCode] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /*
    Example:

    /two-factor?redirect=/reset-password

    redirectTo becomes:

    /reset-password
  */

  const redirectTo =
    searchParams.get("redirect");

  /* =====================================================
     NORMAL LOGIN REDIRECT
  ===================================================== */

  const redirectByRole =
    async () => {

      const {
        data: { user },
        error,
      } =
        await supabase.auth.getUser();

      if (error || !user) {
        setMessage(
          "Could not identify the logged-in user."
        );

        return;
      }

      const role =
        user.user_metadata?.role
          ?.toString()
          .toLowerCase();

      if (role === "student") {

        router.push(
          "/student/dashboard"
        );

      } else if (
        role === "lecturer"
      ) {

        router.push(
          "/lecturer/dashboard"
        );

      } else if (
        role === "admin"
      ) {

        router.push(
          "/admin/dashboard"
        );

      } else {

        setMessage(
          "User role was not found. Please contact the administrator."
        );

        return;
      }

      router.refresh();
    };

  /* =====================================================
     VERIFY MFA
  ===================================================== */

  const handleVerify =
    async () => {

      setMessage("");

      if (code.length !== 6) {
        setMessage(
          "Please enter the 6-digit verification code."
        );

        return;
      }

      setLoading(true);

      try {
        /* ===============================================
           GET MFA FACTORS
        =============================================== */

        const {
          data: factorsData,
          error: factorsError,
        } =
          await supabase.auth.mfa.listFactors();

        if (factorsError) {

          console.error(
            "MFA factors error:",
            factorsError
          );

          setMessage(
            factorsError.message
          );

          return;
        }

        /* ===============================================
           FIND VERIFIED TOTP FACTOR
        =============================================== */

        const factor =
          factorsData.totp.find(
            (item) =>
              item.status ===
              "verified"
          );

        if (!factor) {

          setMessage(
            "Two-factor authentication has not been set up for this account."
          );

          return;
        }

        /* ===============================================
           CREATE MFA CHALLENGE
        =============================================== */

        const {
          data: challengeData,
          error: challengeError,
        } =
          await supabase.auth.mfa.challenge(
            {
              factorId:
                factor.id,
            }
          );

        if (challengeError) {

          console.error(
            "MFA challenge error:",
            challengeError
          );

          setMessage(
            challengeError.message
          );

          return;
        }

        /* ===============================================
           VERIFY AUTHENTICATOR CODE
        =============================================== */

        const {
          error: verifyError,
        } =
          await supabase.auth.mfa.verify(
            {
              factorId:
                factor.id,

              challengeId:
                challengeData.id,

              code,
            }
          );

        if (verifyError) {

          console.error(
            "MFA verify error:",
            verifyError
          );

          setMessage(
            "Invalid verification code. Please try again."
          );

          return;
        }

        /* ===============================================
           CONFIRM SESSION IS NOW AAL2
        =============================================== */

        const {
          data: aalData,
          error: aalError,
        } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aalError) {

          console.error(
            "AAL verification error:",
            aalError
          );

          setMessage(
            "Unable to verify the authentication level."
          );

          return;
        }

        if (
          aalData.currentLevel !==
          "aal2"
        ) {

          setMessage(
            "Two-factor verification was completed, but the secure session could not be established."
          );

          return;
        }

        setMessage(
          "Verification successful."
        );

        /* ===============================================
           PASSWORD RECOVERY FLOW
        =============================================== */

        if (
          redirectTo ===
          "/reset-password"
        ) {

          /*
            IMPORTANT:
            Do NOT sign out.

            The AAL2 session must remain active
            so reset-password can call updateUser.
          */

          router.replace(
            "/reset-password"
          );

          router.refresh();

          return;
        }

        /* ===============================================
           NORMAL LOGIN FLOW
        =============================================== */

        await redirectByRole();

      } catch (error) {

        console.error(
          "Two-factor authentication error:",
          error
        );

        setMessage(
          "Something went wrong. Please try again."
        );

      } finally {

        setLoading(false);

      }
    };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
    async () => {

      await supabase.auth.signOut();

      router.push("/");
      router.refresh();
    };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#14213d] px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#2463eb] text-2xl font-bold text-white">
            C
          </div>

          <h1 className="mt-3 text-xl font-bold text-white">
            ConsultBook
          </h1>

          <p className="mt-1 text-xs text-slate-300">
            Book & Consult Platform
          </p>

        </div>

        {/* Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

          <h2 className="text-center text-2xl font-bold text-[#14244a]">
            Two-Factor Authentication
          </h2>

          <p className="mt-3 text-center text-sm leading-6 text-slate-500">
            Enter the 6-digit verification code from your authenticator app.
          </p>

          {/* Recovery information */}

          {redirectTo ===
            "/reset-password" && (

            <div className="mt-5 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700">

              For security, verify your two-factor authentication before changing your password.

            </div>

          )}

          {/* Code */}

          <div className="mt-7">

            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Verification Code
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="000000"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-4 text-center text-xl font-bold tracking-[0.5em] text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Verify */}

          <button
            type="button"
            onClick={
              handleVerify
            }
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#2463eb] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading
              ? "Verifying..."
              : "Verify Code"}
          </button>

          {/* Message */}

          {message && (
            <div
              className={`mt-4 rounded-lg p-3 text-center text-sm font-semibold ${
                message.includes(
                  "successful"
                )
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          {/* Cancel */}

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="text-sm font-semibold text-slate-500 hover:text-red-600"
            >
              ← Cancel and Logout
            </button>

          </div>

        </div>

        {/* Login */}

        <div className="mt-6 text-center">

          <Link
            href="/"
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            Back to Login
          </Link>

        </div>

      </div>

    </main>
  );
}