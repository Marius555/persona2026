import "server-only";

import { cookies } from "next/headers";
import { Account, Client, type Models } from "node-appwrite";

import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, SESSION_COOKIE } from "./config";

/**
 * Client used to create sessions (signup/login). Session creation is a public
 * operation, so this works keyless. If `APPWRITE_API_KEY` is present it upgrades
 * to an admin client, which bypasses server-IP rate limits.
 */
export function createAuthClient(): Client {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  if (process.env.APPWRITE_API_KEY) {
    client.setKey(process.env.APPWRITE_API_KEY);
  }

  return client;
}

/** Client scoped to a logged-in user's session secret. */
export function createSessionClient(sessionSecret: string): Client {
  return new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setSession(sessionSecret);
}

/** Persist an Appwrite session as a secure, httpOnly cookie. */
export async function setSessionCookie(session: Models.Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(session.expire),
    path: "/",
  });
}

/** Remove the session cookie (logout). */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Read the current session secret from the request cookies, if any. */
export async function getSessionSecret(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/** Returns the logged-in user, or null when there is no valid session. */
export async function getLoggedInUser(): Promise<Models.User<Models.Preferences> | null> {
  const secret = await getSessionSecret();
  if (!secret) return null;

  try {
    const account = new Account(createSessionClient(secret));
    return await account.get();
  } catch {
    return null;
  }
}
