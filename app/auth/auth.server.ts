import crypto from "node:crypto";
import type { UserInfo } from "~/session/session.server";

type KeycloakConfig = {
  url: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
  appUrl: string;
};

type DiscoveryDoc = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
};

function getConfig(): KeycloakConfig {
  const url = process.env.KEYCLOAK_URL;
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const appUrl = process.env.APP_URL;
  if (!url || !realm || !clientId || !appUrl) {
    throw new Error(
      "Missing required env vars: KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, APP_URL"
    );
  }
  return {
    url,
    realm,
    clientId,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    appUrl,
  };
}

async function discover(): Promise<DiscoveryDoc> {
  const { url, realm } = getConfig();
  const res = await fetch(
    `${url}/realms/${realm}/.well-known/openid-configuration`
  );
  if (!res.ok) throw new Error("Failed to fetch Keycloak discovery document");
  return res.json() as Promise<DiscoveryDoc>;
}

export function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export async function getAuthorizationUrl(
  state: string,
  codeChallenge: string
): Promise<string> {
  const config = getConfig();
  const discovery = await discover();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: `${config.appUrl}/auth/callback`,
    scope: "openid profile email",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${discovery.authorization_endpoint}?${params}`;
}

export async function exchangeCode(
  code: string,
  verifier: string
): Promise<{ id_token: string; access_token: string }> {
  const config = getConfig();
  const discovery = await discover();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    redirect_uri: `${config.appUrl}/auth/callback`,
    code,
    code_verifier: verifier,
  });
  if (config.clientSecret) body.set("client_secret", config.clientSecret);

  const res = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }
  return res.json() as Promise<{ id_token: string; access_token: string }>;
}

export function decodeIdToken(idToken: string): UserInfo {
  const payload = idToken.split(".")[1];
  return JSON.parse(
    Buffer.from(payload, "base64url").toString("utf-8")
  ) as UserInfo;
}

export function getKeycloakAccountUrl(): string {
  const { url, realm } = getConfig();
  return `${url}/realms/${realm}/account/`;
}

export async function getLogoutUrl(idTokenHint?: string): Promise<string> {
  const config = getConfig();
  const discovery = await discover();
  const params = new URLSearchParams({
    client_id: config.clientId,
    post_logout_redirect_uri: config.appUrl,
  });
  if (idTokenHint) params.set("id_token_hint", idTokenHint);
  return `${discovery.end_session_endpoint}?${params}`;
}