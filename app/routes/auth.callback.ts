import { redirect } from "react-router";
import { decodeIdToken, exchangeCode } from "~/auth/auth.server";
import { commitSession, getSession } from "~/session/session.server";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const session = await getSession(request);
  const savedState = session.get("oauth_state") as string | undefined;
  const verifier = session.get("pkce_verifier") as string | undefined;

  if (!code || !state || state !== savedState || !verifier) {
    throw new Response("Invalid OAuth callback", { status: 400 });
  }

  session.unset("oauth_state");
  session.unset("pkce_verifier");

  const tokens = await exchangeCode(code, verifier);
  const user = decodeIdToken(tokens.id_token);

  session.set("user", user);
  session.set("id_token", tokens.id_token);

  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}