import { supabase } from "../lib/supabase";

export type LoginResult =
  | {
      success: true;
      session: unknown;
    }
  | {
      success: false;
      message: string;
    };

export function validateLoginInput(email: string, password: string): string | null {
  if (!email.trim()) {
    return "Email is required";
  }

  if (!password.trim()) {
    return "Password is required";
  }

  if (!email.includes("@")) {
    return "Please enter a valid email";
  }

  return null;
}

export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<LoginResult> {
  const validationError = validateLoginInput(email, password);

  if (validationError) {
    return {
      success: false,
      message: validationError,
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }

    if (!data.session) {
      return {
        success: false,
        message: "Login failed. No session returned.",
      };
    }

    return {
      success: true,
      session: data.session,
    };
  } catch {
    return {
      success: false,
      message: "Unexpected login error"
    };
  }
}