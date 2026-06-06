import { NextResponse } from "next/server";
import { Account, AppwriteException } from "node-appwrite";

import { createAuthClient, setSessionCookie } from "@/lib/appwrite/server";
import { flattenFieldErrors, loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;
  const account = new Account(createAuthClient());

  try {
    const session = await account.createEmailPasswordSession({ email, password });
    await setSessionCookie(session);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    if (err instanceof AppwriteException) {
      if (err.code === 401) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 },
        );
      }
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
