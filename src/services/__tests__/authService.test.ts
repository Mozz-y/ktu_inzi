import {
    loginWithEmailAndPassword,
    validateLoginInput,
} from "../authService";

import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe("validateLoginInput", () => {
  test("returns error when email is empty", () => {
    expect(validateLoginInput("", "password123")).toBe("Email is required");
  });

  test("returns error when password is empty", () => {
    expect(validateLoginInput("test@test.com", "")).toBe("Password is required");
  });

  test("returns error when email format is invalid", () => {
    expect(validateLoginInput("bad-email", "password123")).toBe(
      "Please enter a valid email"
    );
  });

  test("returns null when input is valid", () => {
    expect(validateLoginInput("test@test.com", "password123")).toBeNull();
  });
});

describe("loginWithEmailAndPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls Supabase signInWithPassword with valid credentials", async () => {
    const fakeSession = {
      access_token: "fake-token",
      user: {
        id: "user-123",
        email: "test@test.com",
      },
    };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        session: fakeSession,
      },
      error: null,
    });

    const result = await loginWithEmailAndPassword(
      "test@test.com",
      "password123"
    );

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123",
    });

    expect(result).toEqual({
      success: true,
      session: fakeSession,
    });
  });

  test("returns error message when Supabase rejects login", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        session: null,
      },
      error: {
        message: "Invalid login credentials",
      },
    });

    const result = await loginWithEmailAndPassword(
      "wrong@test.com",
      "wrongpassword"
    );

    expect(result).toEqual({
      success: false,
      message: "Invalid login credentials",
    });
  });

  test("does not call Supabase when validation fails", async () => {
    const result = await loginWithEmailAndPassword("", "password123");

    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();

    expect(result).toEqual({
      success: false,
      message: "Email is required",
    });
  });

  test("returns error when Supabase throws unexpected exception", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const result = await loginWithEmailAndPassword(
      "test@test.com",
      "password123"
    );

    expect(result).toEqual({
      success: false,
      message: "Unexpected login error",
    });
  });
  test("returns error when Supabase returns no session", async () => {
  (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
    data: {
      session: null,
    },
    error: null,
  });

  const result = await loginWithEmailAndPassword(
    "test@test.com",
    "password123"
  );

  expect(result).toEqual({
    success: false,
    message: "Login failed. No session returned.",
  });
});
test("returns fallback error message when Supabase error message is missing", async () => {
  (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
    data: {
      session: null,
    },
    error: {},
  });

  const result = await loginWithEmailAndPassword(
    "test@test.com",
    "password123"
  );

  expect(result).toEqual({
    success: false,
    message: "Login failed",
  });
});
});