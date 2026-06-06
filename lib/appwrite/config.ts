/**
 * Shared Appwrite configuration read from environment variables.
 * The `NEXT_PUBLIC_*` values are safe to expose to the browser; the API key
 * (optional) is server-only and never imported into client code.
 */

export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

/**
 * Appwrite's SSR session cookie. The name MUST be `a_session_<PROJECT_ID>`
 * so the Appwrite SDK/endpoint recognises it.
 */
export const SESSION_COOKIE = `a_session_${APPWRITE_PROJECT_ID}`;
