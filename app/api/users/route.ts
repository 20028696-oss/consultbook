import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* =====================================================
   GET ACCESS TOKEN
===================================================== */

function getAccessToken(request: NextRequest) {
  const authorization =
    request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "");
}

/* =====================================================
   SUPABASE CLIENTS
===================================================== */

function getClients() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const adminKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing."
    );
  }

  if (!anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing."
    );
  }

  if (!adminKey) {
    throw new Error(
      "Supabase server key is missing."
    );
  }

  const supabase = createClient(
    supabaseUrl,
    anonKey
  );

  const supabaseAdmin = createClient(
    supabaseUrl,
    adminKey
  );

  return {
    supabase,
    supabaseAdmin,
  };
}

/* =====================================================
   VERIFY ADMIN
===================================================== */

async function verifyAdmin(
  request: NextRequest
) {
  const token =
    getAccessToken(request);

  if (!token) {
    return {
      error: NextResponse.json(
        {
          message:
            "Admin is not authenticated.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const {
    supabase,
  } = getClients();

  const {
    data: { user },
    error,
  } =
    await supabase.auth.getUser(
      token
    );

  if (error || !user) {
    return {
      error: NextResponse.json(
        {
          message:
            "Admin is not authenticated.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const role =
    user.user_metadata?.role
      ?.toString()
      .toLowerCase();

  if (role !== "admin") {
    return {
      error: NextResponse.json(
        {
          message:
            "Only administrators can manage users.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    user,
  };
}

/* =====================================================
   GET USERS
===================================================== */

export async function GET(
  request: NextRequest
) {
  try {
    const auth =
      await verifyAdmin(
        request
      );

    if (auth.error) {
      return auth.error;
    }

    const {
      supabaseAdmin,
    } = getClients();

    const {
      data,
      error,
    } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (error) {
      console.error(
        "List users error:",
        error
      );

      return NextResponse.json(
        {
          message:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    const users =
      data.users
        .filter((user) => {
          const role =
            user.user_metadata?.role
              ?.toString()
              .toLowerCase();

          return (
            role === "student" ||
            role === "lecturer"
          );
        })
        .map((user) => ({
          id:
            user.id,

          email:
            user.email || "",

          full_name:
            user.user_metadata
              ?.full_name ||
            user.email?.split(
              "@"
            )[0] ||
            "User",

          role:
            user.user_metadata
              ?.role ||
            "unknown",

          created_at:
            user.created_at,
        }));

    return NextResponse.json(
      {
        users,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/users error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load users.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   CREATE USER
===================================================== */

export async function POST(
  request: NextRequest
) {
  try {
    const auth =
      await verifyAdmin(
        request
      );

    if (auth.error) {
      return auth.error;
    }

    const {
      supabaseAdmin,
    } = getClients();

    const body =
      await request.json();

    const {
      email,
      password,
      full_name,
      role,
      student_id,
      course,
      subject,
    } = body;

    if (
      !email ||
      !password ||
      !full_name ||
      !role
    ) {
      return NextResponse.json(
        {
          message:
            "Email, password, full name and role are required.",
        },
        {
          status: 400,
        }
      );
    }

    const normalisedRole =
      role
        .toString()
        .toLowerCase();

    if (
      normalisedRole !==
        "student" &&
      normalisedRole !==
        "lecturer"
    ) {
      return NextResponse.json(
        {
          message:
            "Role must be student or lecturer.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      password.length < 6
    ) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 6 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==============================================
       CREATE AUTH ACCOUNT
    ============================================== */

    const {
      data: createData,
      error: createError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email:
          email.trim(),

        password,

        email_confirm:
          true,

        user_metadata: {
          full_name:
            full_name.trim(),

          role:
            normalisedRole,
        },
      });

    if (
      createError ||
      !createData.user
    ) {
      console.error(
        "Create user error:",
        createError
      );

      return NextResponse.json(
        {
          message:
            createError?.message ||
            "Failed to create account.",
        },
        {
          status: 500,
        }
      );
    }

    const newUser =
      createData.user;

    /* ==============================================
       CREATE PROFILE
    ============================================== */

    const {
      error: profileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id:
              newUser.id,

            full_name:
              full_name.trim(),

            email:
              email.trim(),

            student_id:
              normalisedRole ===
              "student"
                ? student_id ||
                  null
                : null,

            course:
              normalisedRole ===
              "lecturer"
                ? subject ||
                  course ||
                  null
                : course ||
                  null,

            role:
              normalisedRole,
          },
          {
            onConflict:
              "id",
          }
        );

    if (profileError) {
      console.error(
        "Create profile error:",
        profileError
      );

      // Remove Auth account if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(
        newUser.id
      );

      return NextResponse.json(
        {
          message:
            "Failed to create profile: " +
            profileError.message,
        },
        {
          status: 500,
        }
      );
    }

    /* ==============================================
       IF LECTURER → ADD TO LECTURERS TABLE
    ============================================== */

    if (
      normalisedRole ===
      "lecturer"
    ) {
      const {
        error: lecturerError,
      } =
        await supabaseAdmin
          .from("lecturers")
          .upsert(
            {
              full_name:
                full_name.trim(),

              email:
                email.trim(),

              subject:
                subject ||
                course ||
                null,
            },
            {
              onConflict:
                "email",
            }
          );

      if (lecturerError) {
        console.error(
          "Create lecturer error:",
          lecturerError
        );

        // Clean up profile
        await supabaseAdmin
          .from("profiles")
          .delete()
          .eq(
            "id",
            newUser.id
          );

        // Clean up Auth account
        await supabaseAdmin.auth.admin.deleteUser(
          newUser.id
        );

        return NextResponse.json(
          {
            message:
              "Failed to create lecturer record: " +
              lecturerError.message,
          },
          {
            status: 500,
          }
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "User created successfully.",

        user: {
          id:
            newUser.id,

          email:
            newUser.email,

          full_name:
            full_name.trim(),

          role:
            normalisedRole,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/users error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create user.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   UPDATE USER
===================================================== */

export async function PATCH(
  request: NextRequest
) {
  try {
    const auth =
      await verifyAdmin(
        request
      );

    if (auth.error) {
      return auth.error;
    }

    const {
      supabaseAdmin,
    } = getClients();

    const body =
      await request.json();

    const {
      id,
      full_name,
      role,
      student_id,
      course,
      subject,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !full_name ||
      !role
    ) {
      return NextResponse.json(
        {
          message:
            "Full name and role are required.",
        },
        {
          status: 400,
        }
      );
    }

    const normalisedRole =
      role
        .toString()
        .toLowerCase();

    if (
      normalisedRole !==
        "student" &&
      normalisedRole !==
        "lecturer"
    ) {
      return NextResponse.json(
        {
          message:
            "Role must be student or lecturer.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==============================================
       UPDATE AUTH METADATA
    ============================================== */

    const {
      data,
      error,
    } =
      await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          user_metadata: {
            full_name:
              full_name.trim(),

            role:
              normalisedRole,
          },
        }
      );

    if (error) {
      console.error(
        "Update Auth user error:",
        error
      );

      return NextResponse.json(
        {
          message:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    const userEmail =
      data.user.email || "";

    /* ==============================================
       UPDATE PROFILE
    ============================================== */

    const {
      error: profileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id,

            full_name:
              full_name.trim(),

            email:
              userEmail,

            student_id:
              normalisedRole ===
              "student"
                ? student_id ||
                  null
                : null,

            course:
              normalisedRole ===
              "lecturer"
                ? subject ||
                  course ||
                  null
                : course ||
                  null,

            role:
              normalisedRole,
          },
          {
            onConflict:
              "id",
          }
        );

    if (profileError) {
      console.error(
        "Update profile error:",
        profileError
      );

      return NextResponse.json(
        {
          message:
            profileError.message,
        },
        {
          status: 500,
        }
      );
    }

    /* ==============================================
       IF LECTURER → CREATE/UPDATE LECTURERS TABLE
    ============================================== */

    if (
      normalisedRole ===
      "lecturer"
    ) {
      const {
        error: lecturerError,
      } =
        await supabaseAdmin
          .from("lecturers")
          .upsert(
            {
              full_name:
                full_name.trim(),

              email:
                userEmail,

              subject:
                subject ||
                course ||
                null,
            },
            {
              onConflict:
                "email",
            }
          );

      if (lecturerError) {
        console.error(
          "Update lecturer error:",
          lecturerError
        );

        return NextResponse.json(
          {
            message:
              lecturerError.message,
          },
          {
            status: 500,
          }
        );
      }
    }

    /* ==============================================
       IF CHANGED TO STUDENT
       REMOVE FROM LECTURERS TABLE
    ============================================== */

    if (
      normalisedRole ===
      "student" &&
      userEmail
    ) {
      const {
        error: deleteLecturerError,
      } =
        await supabaseAdmin
          .from("lecturers")
          .delete()
          .eq(
            "email",
            userEmail
          );

      if (deleteLecturerError) {
        console.error(
          "Remove old lecturer record error:",
          deleteLecturerError
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "User updated successfully.",

        user: {
          id:
            data.user.id,

          email:
            data.user.email,

          full_name:
            full_name.trim(),

          role:
            normalisedRole,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH /api/users error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update user.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   DELETE USER
===================================================== */

export async function DELETE(
  request: NextRequest
) {
  try {
    const auth =
      await verifyAdmin(
        request
      );

    if (auth.error) {
      return auth.error;
    }

    const {
      supabaseAdmin,
    } = getClients();

    const {
      searchParams,
    } =
      new URL(request.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message:
            "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* ==============================================
       GET USER BEFORE DELETING
       We need the email to remove lecturer record
    ============================================== */

    const {
      data: existingUserData,
      error: existingUserError,
    } =
      await supabaseAdmin.auth.admin.getUserById(
        id
      );

    if (
      existingUserError ||
      !existingUserData.user
    ) {
      console.error(
        "Get user before delete error:",
        existingUserError
      );

      return NextResponse.json(
        {
          message:
            existingUserError?.message ||
            "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const userEmail =
      existingUserData.user.email ||
      "";

    /* ==============================================
       DELETE FROM LECTURERS TABLE
       Safe even if user was a student
    ============================================== */

    if (userEmail) {
      const {
        error: lecturerDeleteError,
      } =
        await supabaseAdmin
          .from("lecturers")
          .delete()
          .eq(
            "email",
            userEmail
          );

      if (lecturerDeleteError) {
        console.error(
          "Delete lecturer error:",
          lecturerDeleteError
        );
      }
    }

    /* ==============================================
       DELETE PROFILE
    ============================================== */

    const {
      error: profileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq(
          "id",
          id
        );

    if (profileError) {
      console.error(
        "Delete profile error:",
        profileError
      );
    }

    /* ==============================================
       DELETE AUTH ACCOUNT
    ============================================== */

    const {
      error,
    } =
      await supabaseAdmin.auth.admin.deleteUser(
        id
      );

    if (error) {
      console.error(
        "Delete Auth user error:",
        error
      );

      return NextResponse.json(
        {
          message:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "User deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE /api/users error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete user.",
      },
      {
        status: 500,
      }
    );
  }
}