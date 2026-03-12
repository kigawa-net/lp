import {createCookieSessionStorage, type SessionData} from "react-router";

export type UserInfo = {
  sub: string;
  name?: string;
  email?: string;
  preferred_username?: string;
};

function createStorage() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createCookieSessionStorage<SessionData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 86400,
      path: "/",
      sameSite: "lax",
      secrets: [secret],
      secure: process.env.NODE_ENV === "production",
    },
  });
}

export async function getSession(request: Request) {
  return createStorage().getSession(request.headers.get("Cookie"));
}

export type AppSession = Awaited<ReturnType<typeof getSession>>;

export function commitSession(session: AppSession) {
  return createStorage().commitSession(session);
}

export function destroySession(session: AppSession) {
  return createStorage().destroySession(session);
}
