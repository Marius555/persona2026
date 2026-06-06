import { NextResponse } from "next/server";
import { Account } from "node-appwrite";

import {
  clearSessionCookie,
  createSessionClient,
  getSessionSecret,
} from "@/lib/appwrite/server";

export async function POST() {
  const secret = await getSessionSecret();

  if (secret) {
    try {
      const account = new Account(createSessionClient(secret));
      await account.deleteSession({ sessionId: "current" });
    } catch {
      // Session may already be invalid server-side; clearing the cookie is enough.
    }
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
