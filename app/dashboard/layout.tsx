import { redirect } from "next/navigation";

import { getLoggedInUser } from "@/lib/appwrite/server";

export default async function DashboardRedirectLayout() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");
  redirect(`/auth/${user.$id}/dashboard`);
}
