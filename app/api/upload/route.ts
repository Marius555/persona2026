import { NextResponse } from "next/server";
import { AppwriteException, ID, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import { createAdminStorage, STORAGE_ID } from "@/lib/appwrite/db";
import { getLoggedInUser } from "@/lib/appwrite/server";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const KINDS = ["avatar", "banner", "content"] as const;
type Kind = (typeof KINDS)[number];

/**
 * Multipart upload for onboarding media.
 * Body: `file` (Blob) + `kind` (avatar|banner|content).
 * Returns `{ fileId }`; the row only ever stores that id.
 */
export async function POST(request: Request) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const kind = String(form.get("kind") ?? "") as Kind;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be between 1 byte and 50 MB" },
      { status: 413 },
    );
  }

  // Avatars/banners are images; content may also be a short video.
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const allowed = kind === "content" ? isImage || isVideo : isImage;
  if (!allowed) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 415 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = createAdminStorage();
    const created = await storage.createFile({
      bucketId: STORAGE_ID,
      fileId: ID.unique(),
      file: InputFile.fromBuffer(buffer, file.name || `${kind}-${Date.now()}`),
      // Profile imagery is shown publicly; vault content stays private.
      permissions:
        kind === "content"
          ? [Permission.read(Role.user(user.$id))]
          : [Permission.read(Role.any())],
    });

    return NextResponse.json({ fileId: created.$id }, { status: 201 });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
