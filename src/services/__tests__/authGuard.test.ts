import { getRedirectPathForSession } from "../authGuard";

describe("getRedirectPathForSession", () => {
  test("returns /login when session is null", () => {
    expect(getRedirectPathForSession(null)).toBe("/login");
  });

  test("returns /login when session is undefined", () => {
    expect(getRedirectPathForSession(undefined)).toBe("/login");
  });

  test("returns null when session exists", () => {
    const fakeSession = {
      user: {
        id: "user-123",
        email: "test@test.com",
      },
    };

    expect(getRedirectPathForSession(fakeSession)).toBeNull();
  });
});