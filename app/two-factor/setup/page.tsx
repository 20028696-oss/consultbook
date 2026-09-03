"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type UserRole = "student" | "lecturer" | "admin";

export default function TwoFactorSetupPage() {
  const router = useRouter();

  const setupStarted = useRef(false);

  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (setupStarted.current) {
      return;
    }

    setupStarted.current = true;

    setupMfa();
  }, []);

  const redirectByRole = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      setMessage("Could not identify the logged-in user.");
      return;
    }

    const role =
      user.user_metadata?.role?.toLowerCase() as
        | UserRole
        | undefined;

    if (role === "student") {
      router.push("/student/dashboard");
    } else if (role === "lecturer") {
      router.push("/lecturer/dashboard");
    } else if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      setMessage(
        "User role was not found. Please contact the administrator."
      );

      return;
    }

    router.refresh();
  };

  const setupMfa = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Check user session
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("User is not authenticated.");
        return;
      }

      // Check whether MFA is already verified
      const {
        data: factorsData,
        error: factorsError,
      } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error("MFA factors error:", factorsError);

        setMessage(factorsError.message);
        return;
      }

      const verifiedFactor = factorsData.totp.find(
        (factor) => factor.status === "verified"
      );

      // Already configured
      if (verifiedFactor) {
        router.push("/two-factor");
        return;
      }

      // Create ONE new TOTP factor.
      // Do not give it a fixed friendlyName, which avoids
      // the duplicate-name error from previous failed attempts.
      const {
        data: enrollData,
        error: enrollError,
      } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (enrollError) {
        console.error("MFA enroll error:", enrollError);

        setMessage(enrollError.message);
        return;
      }

      setFactorId(enrollData.id);
      setQrCode(enrollData.totp.qr_code);
      setSecret(enrollData.totp.secret);
    } catch (error) {
      console.error("MFA setup error:", error);

      setMessage(
        "Something went wrong while setting up two-factor authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setMessage("Please enter the 6-digit verification code.");
      return;
    }

    if (!factorId) {
      setMessage(
        "Two-factor authentication setup is not ready yet."
      );

      return;
    }

    try {
      setVerifying(true);
      setMessage("");

      const { error } =
        await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code,
        });

      if (error) {
        console.error("MFA verification error:", error);

        setMessage(
          error.message ||
            "Invalid verification code. Please try again."
        );

        return;
      }

      setMessage(
        "Two-factor authentication enabled successfully."
      );

      setTimeout(() => {
        redirectByRole();
      }, 700);
    } catch (error) {
      console.error("MFA verification error:", error);

      setMessage(
        "Something went wrong while verifying the code."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#14213d] px-4 py-10">
      <div className="w-full max-w-lg">

        <div className="mb-7 text-center">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-center text-2xl font-bold text-[#14244a]">
            Set Up Two-Factor Authentication
          </h2>

          <p className="mt-3 text-center text-sm leading-6 text-slate-500">
            Scan the QR code using Google Authenticator,
            Microsoft Authenticator, Authy, or another
            authenticator app.
          </p>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Preparing two-factor authentication...
            </div>
          ) : (
            <>
              {qrCode && (
                <div className="mt-7 flex justify-center">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <img
                      src={qrCode}
                      alt="Two-factor authentication QR code"
                      className="h-52 w-52"
                    />
                  </div>
                </div>
              )}

              {secret && (
                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Manual Setup Key
                  </p>

                  <p className="mt-2 text-center text-sm text-slate-500">
                    If you cannot scan the QR code, enter this key
                    manually in your authenticator app.
                  </p>

                  <div className="mt-3 break-all rounded-lg border border-slate-200 bg-white p-3 text-center font-mono text-sm font-semibold text-[#14244a]">
                    {secret}
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  Setup instructions
                </p>

                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-blue-700">
                  <li>Open your authenticator app.</li>
                  <li>Add a new account.</li>
                  <li>Scan the QR code above.</li>
                  <li>
                    Enter the current 6-digit code generated by the app.
                  </li>
                </ol>
              </div>

              <div className="mt-6">
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
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="000000"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-4 text-center text-xl font-bold tracking-[0.5em] text-[#14244a] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying || !factorId}
                className="mt-6 w-full rounded-lg bg-[#2463eb] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {verifying
                  ? "Verifying..."
                  : "Enable Two-Factor Authentication"}
              </button>
            </>
          )}

          {message && (
            <div
              className={`mt-5 rounded-lg p-4 text-center text-sm font-semibold ${
                message.toLowerCase().includes("success")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold text-slate-500 hover:text-red-600"
            >
              Cancel and Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}