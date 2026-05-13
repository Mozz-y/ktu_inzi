export function getRedirectPathForSession(session: unknown): string | null {
  if (!session) {
    return "/login";
  }

  return null;
}