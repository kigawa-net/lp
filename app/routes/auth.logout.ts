import { redirect } from "react-router";
import { getLogoutUrl } from "~/auth/auth.server";
import { destroySession, getSession } from "~/session/session.server";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request);
  const idToken = session.get("id_token") as string | undefined;

  const logoutUrl = await getLogoutUrl(idToken);

  return redirect(logoutUrl, {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}