import { redirect } from "react-router";
import {
  generatePKCE,
  generateState,
  getAuthorizationUrl,
} from "~/auth/auth.server";
import { commitSession, getSession } from "~/session/session.server";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request);
  const state = generateState();
  const { verifier, challenge } = generatePKCE();

  session.set("oauth_state", state);
  session.set("pkce_verifier", verifier);

  const authUrl = await getAuthorizationUrl(state, challenge);
  return redirect(authUrl, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}