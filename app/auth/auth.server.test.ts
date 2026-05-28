import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  decodeIdToken,
  exchangeCode,
  generatePKCE,
  generateState,
  getAuthorizationUrl,
  getKeycloakAccountUrl,
  getLogoutUrl,
} from "./auth.server";

const ENV = {
  KEYCLOAK_URL: "https://auth.example.com",
  KEYCLOAK_REALM: "myrealm",
  KEYCLOAK_CLIENT_ID: "myapp",
  APP_URL: "http://localhost:5173",
};

const DISCOVERY = {
  authorization_endpoint:
    "https://auth.example.com/realms/myrealm/protocol/openid-connect/auth",
  token_endpoint:
    "https://auth.example.com/realms/myrealm/protocol/openid-connect/token",
  end_session_endpoint:
    "https://auth.example.com/realms/myrealm/protocol/openid-connect/logout",
};

describe("generateState", () => {
  it("returns a 32-char hex string", () => {
    expect(generateState()).toMatch(/^[0-9a-f]{32}$/);
  });

  it("returns a unique value each call", () => {
    expect(generateState()).not.toBe(generateState());
  });
});

describe("generatePKCE", () => {
  it("returns verifier and challenge", () => {
    const { verifier, challenge } = generatePKCE();
    expect(verifier).toBeTruthy();
    expect(challenge).toBeTruthy();
  });

  it("challenge is SHA256(verifier) in base64url", () => {
    const { verifier, challenge } = generatePKCE();
    const expected = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");
    expect(challenge).toBe(expected);
  });

  it("returns unique pairs each call", () => {
    const a = generatePKCE();
    const b = generatePKCE();
    expect(a.verifier).not.toBe(b.verifier);
    expect(a.challenge).not.toBe(b.challenge);
  });
});

describe("decodeIdToken", () => {
  it("decodes a valid JWT payload", () => {
    const payload = {
      sub: "user123",
      email: "test@example.com",
      name: "Test User",
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const token = `header.${encoded}.signature`;
    expect(decodeIdToken(token)).toEqual(payload);
  });
});

describe("getKeycloakAccountUrl", () => {
  beforeEach(() => {
    vi.stubEnv("KEYCLOAK_URL", ENV.KEYCLOAK_URL);
    vi.stubEnv("KEYCLOAK_REALM", ENV.KEYCLOAK_REALM);
    vi.stubEnv("KEYCLOAK_CLIENT_ID", ENV.KEYCLOAK_CLIENT_ID);
    vi.stubEnv("APP_URL", ENV.APP_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the correct account URL", () => {
    expect(getKeycloakAccountUrl()).toBe(
      "https://auth.example.com/realms/myrealm/account/"
    );
  });

  it("throws when KEYCLOAK_URL is missing", () => {
    vi.stubEnv("KEYCLOAK_URL", "");
    expect(() => getKeycloakAccountUrl()).toThrow("Missing required env vars");
  });

  it("throws when KEYCLOAK_REALM is missing", () => {
    vi.stubEnv("KEYCLOAK_REALM", "");
    expect(() => getKeycloakAccountUrl()).toThrow("Missing required env vars");
  });
});

describe("getAuthorizationUrl", () => {
  beforeEach(() => {
    vi.stubEnv("KEYCLOAK_URL", ENV.KEYCLOAK_URL);
    vi.stubEnv("KEYCLOAK_REALM", ENV.KEYCLOAK_REALM);
    vi.stubEnv("KEYCLOAK_CLIENT_ID", ENV.KEYCLOAK_CLIENT_ID);
    vi.stubEnv("APP_URL", ENV.APP_URL);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => DISCOVERY })
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("builds URL with required OAuth2 PKCE params", async () => {
    const url = await getAuthorizationUrl("mystate", "mychallenge");
    const p = new URL(url).searchParams;
    expect(p.get("response_type")).toBe("code");
    expect(p.get("client_id")).toBe("myapp");
    expect(p.get("state")).toBe("mystate");
    expect(p.get("code_challenge")).toBe("mychallenge");
    expect(p.get("code_challenge_method")).toBe("S256");
    expect(p.get("redirect_uri")).toBe("http://localhost:5173/auth/callback");
    expect(p.get("scope")).toContain("openid");
  });

  it("throws when discovery fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false })
    );
    await expect(getAuthorizationUrl("state", "challenge")).rejects.toThrow(
      "Failed to fetch Keycloak discovery document"
    );
  });
});

describe("exchangeCode", () => {
  beforeEach(() => {
    vi.stubEnv("KEYCLOAK_URL", ENV.KEYCLOAK_URL);
    vi.stubEnv("KEYCLOAK_REALM", ENV.KEYCLOAK_REALM);
    vi.stubEnv("KEYCLOAK_CLIENT_ID", ENV.KEYCLOAK_CLIENT_ID);
    vi.stubEnv("APP_URL", ENV.APP_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns tokens on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => DISCOVERY })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id_token: "idtok", access_token: "acctok" }),
        })
    );
    const tokens = await exchangeCode("code", "verifier");
    expect(tokens.id_token).toBe("idtok");
    expect(tokens.access_token).toBe("acctok");
  });

  it("throws when token endpoint returns error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => DISCOVERY })
        .mockResolvedValueOnce({
          ok: false,
          text: async () => "invalid_grant",
        })
    );
    await expect(exchangeCode("badcode", "verifier")).rejects.toThrow(
      "Token exchange failed: invalid_grant"
    );
  });

  it("includes client_secret in request body when configured", async () => {
    vi.stubEnv("KEYCLOAK_CLIENT_SECRET", "mysecret");
    let capturedBody: URLSearchParams | null = null;
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => DISCOVERY })
        .mockImplementationOnce(async (_url, opts: RequestInit) => {
          capturedBody = opts.body as URLSearchParams;
          return { ok: true, json: async () => ({ id_token: "t", access_token: "t" }) };
        })
    );
    await exchangeCode("code", "verifier");
    expect(capturedBody!.get("client_secret")).toBe("mysecret");
  });
});

describe("getLogoutUrl", () => {
  beforeEach(() => {
    vi.stubEnv("KEYCLOAK_URL", ENV.KEYCLOAK_URL);
    vi.stubEnv("KEYCLOAK_REALM", ENV.KEYCLOAK_REALM);
    vi.stubEnv("KEYCLOAK_CLIENT_ID", ENV.KEYCLOAK_CLIENT_ID);
    vi.stubEnv("APP_URL", ENV.APP_URL);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => DISCOVERY })
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("builds logout URL with client_id and post_logout_redirect_uri", async () => {
    const url = await getLogoutUrl();
    const p = new URL(url).searchParams;
    expect(p.get("client_id")).toBe("myapp");
    expect(p.get("post_logout_redirect_uri")).toBe("http://localhost:5173");
  });

  it("includes id_token_hint when provided", async () => {
    const url = await getLogoutUrl("myhint");
    expect(new URL(url).searchParams.get("id_token_hint")).toBe("myhint");
  });

  it("omits id_token_hint when not provided", async () => {
    const url = await getLogoutUrl();
    expect(new URL(url).searchParams.has("id_token_hint")).toBe(false);
  });
});
