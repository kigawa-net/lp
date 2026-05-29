import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { commitSession, destroySession, getSession } from "./session.server";

describe("session.server", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-secret-for-testing");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("getSession returns a session from a request with no cookie", async () => {
    const req = new Request("http://localhost/");
    const session = await getSession(req);
    expect(session).toBeDefined();
  });

  it("commitSession returns a Set-Cookie header string", async () => {
    const req = new Request("http://localhost/");
    const session = await getSession(req);
    const cookie = await commitSession(session);
    expect(cookie).toMatch(/^__session=/);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Max-Age=86400");
  });

  it("destroySession clears the session cookie", async () => {
    const req = new Request("http://localhost/");
    const session = await getSession(req);
    const cookie = await destroySession(session);
    expect(cookie).toMatch(/^__session=/);
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
  });

  it("session data round-trips via cookie", async () => {
    const req = new Request("http://localhost/");
    const session = await getSession(req);
    session.set("oauth_state", "abc123");

    const cookie = await commitSession(session);
    const req2 = new Request("http://localhost/", {
      headers: { Cookie: cookie },
    });
    const session2 = await getSession(req2);
    expect(session2.get("oauth_state")).toBe("abc123");
  });

  it("throws when SESSION_SECRET is not set", async () => {
    vi.stubEnv("SESSION_SECRET", "");
    const req = new Request("http://localhost/");
    await expect(getSession(req)).rejects.toThrow("SESSION_SECRET is not set");
  });
});
