import { redirect } from "next/navigation";

import { getProfileByUserId } from "@/lib/appwrite/profile";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";

export default async function OnboardingPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const profile = await getProfileByUserId(user.$id);
  if (profile?.onboardingComplete) redirect("/");

  return <OnboardingStepper initialProfile={profile} />;
}
