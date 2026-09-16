"use client";

import { useEffect, useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

import { supabase } from "@/lib/supabase/client";

export default function AdminProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  /* =====================================================
     LOAD ADMIN PROFILE
  ===================================================== */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setMessage("Admin is not authenticated.");
        return;
      }

      const role = user.user_metadata?.role
        ?.toString()
        .toLowerCase();

      if (role !== "admin") {
        setMessage(
          "This account is not an administrator."
        );
        return;
      }

      /*
       * First try to load the admin from profiles.
       */
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Admin profile table error:",
          profileError
        );
      }

      /*
       * If profile exists, use it.
       * Otherwise use Auth information.
       */
      const adminName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Admin User";

      const adminEmail =
        profile?.email ||
        user.email ||
        "";

      setName(adminName);
      setEmail(adminEmail);

      /*
       * IMPORTANT:
       * Create the profiles row automatically if
       * this registered admin does not have one.
       */
      if (!profile) {
        const {
          error: createProfileError,
        } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              full_name: adminName,
              email: user.email || null,
              student_id: null,
              course: null,
              role: "admin",
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

        if (createProfileError) {
          console.error(
            "Create admin profile error:",
            createProfileError
          );

          setMessage(
            "Admin account loaded, but the profile table could not be updated: " +
              createProfileError.message
          );
        }
      }
    } catch (error) {
      console.error(
        "Admin profile error:",
        error
      );

      setMessage(
        "Failed to load admin profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SAVE ADMIN PROFILE
  ===================================================== */

  const saveProfile = async () => {
    if (!name.trim()) {
      setMessage("Please enter your name.");
      setSuccess(false);
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setSuccess(false);

      /*
       * Get logged-in admin.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage(
          "Admin is not authenticated."
        );
        return;
      }

      /*
       * Update Supabase Auth metadata.
       */
      const {
        data,
        error,
      } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          role: "admin",
        },
      });

      if (error) {
        console.error(
          "Admin Auth update error:",
          error
        );

        setMessage(error.message);
        return;
      }

      /*
       * Also create/update public.profiles.
       */
      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: name.trim(),
            email: user.email || null,
            student_id: null,
            course: null,
            role: "admin",
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) {
        console.error(
          "Admin profiles update error:",
          profileError
        );

        setMessage(
          "Authentication profile was updated, but profiles table update failed: " +
            profileError.message
        );

        return;
      }

      setName(
        data.user.user_metadata
          ?.full_name ||
          name.trim()
      );

      setEmail(
        data.user.email ||
        email
      );

      setSuccess(true);

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Save admin profile error:",
        error
      );

      setMessage(
        "Something went wrong while updating the profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">

      <AdminSidebar
        name={name || "Admin User"}
      />

      <div className="ml-[240px] min-h-screen">

        <AdminTopbar
          name={name || "Admin User"}
          title="Profile"
        />

        <main className="p-8">

          <div className="mx-auto max-w-4xl">

            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

              <h1 className="text-2xl font-bold text-[#14244a]">
                Administrator Profile
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View and update your administrator information.
              </p>

              {loading ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Loading profile...
                </div>
              ) : (
                <div className="mt-8 space-y-6">

                  {/* Full Name */}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(
                          e.target.value
                        );

                        setMessage("");
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-4 text-[#263451] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Email */}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      disabled
                      className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-4 text-slate-600"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Email is linked to your login account and cannot be changed here.
                    </p>
                  </div>

                  {/* Role */}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Role
                    </label>

                    <input
                      type="text"
                      value="Administrator"
                      disabled
                      className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-4 text-slate-600"
                    />
                  </div>

                  {/* Message */}

                  {message && (
                    <div
                      className={`rounded-lg p-4 text-sm font-semibold ${
                        success
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  {/* Save */}

                  <div className="border-t border-slate-200 pt-6">

                    <button
                      type="button"
                      onClick={saveProfile}
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}