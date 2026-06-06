import { NextResponse } from "next/server";
import { Account, AppwriteException, ID } from "node-appwrite";

import { createAuthClient, setSessionCookie } from "@/lib/appwrite/server";
import { flattenFieldErrors, signupSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;
  const account = new Account(createAuthClient());

  try {
    await account.create({ userId: ID.unique(), email, password });
    const session = await account.createEmailPasswordSession({ email, password });
    await setSessionCookie(session);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof AppwriteException) {
      if (err.code === 409) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
