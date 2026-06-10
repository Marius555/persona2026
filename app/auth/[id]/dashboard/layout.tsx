import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/appwrite/config";
import { STORAGE_ID } from "@/lib/appwrite/db";
import { getProfileByUserId } from "@/lib/appwrite/profile";
import { getLoggedInUser } from "@/lib/appwrite/server";

function fileViewUrl(fileId: string | null | undefined): string | null {
  if (!fileId) return null;
  return `${APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getLoggedInUser();

  if (!user) redirect("/login");
  if (user.$id !== id) redirect(`/auth/${user.$id}/dashboard`);

  const profile = await getProfileByUserId(user.$id);

  const displayName =
    user.name || profile?.username || user.email.split("@")[0] || "Account";

  return (
    <DashboardShell
      userId={user.$id}
      displayName={displayName}
      email={user.email}
      avatarUrl={fileViewUrl(profile?.avatarFileId)}
    >
      {children}
    </DashboardShell>
  );
}
