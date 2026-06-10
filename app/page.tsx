import { redirect } from "next/navigation";

import { Cta } from "@/components/landing/cta";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { Ticker } from "@/components/landing/ticker";
import { getProfileByUserId } from "@/lib/appwrite/profile";
import { getLoggedInUser } from "@/lib/appwrite/server";

export default async function Home() {
  const user = await getLoggedInUser();

  if (user) {
    const profile = await getProfileByUserId(user.$id);
    if (profile?.onboardingComplete) redirect(`/auth/${user.$id}/dashboard`);
    else redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Hero />
      <Ticker />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <Cta />
      <Footer />
    </div>
  );
}
