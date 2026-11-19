"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/v2/Navbar";
import { Hero } from "@/components/v2/Hero";
import {
  FeaturedCarousel,
  FinancingCta,
  InteractiveCategories,
  Newsletter,
  PerformanceHighlights,
  PopularModels,
  Reviews,
  VehicleDemo,
} from "@/components/v2/Sections";
import { Footer } from "@/components/v2/Footer";

export default function VersionTwo() {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  return (
    <div className="theme-v2 min-h-screen bg-background pb-2 text-foreground">
      <Navbar onSignOut={handleSignOut} />
      <main>
        <Hero />
        <FeaturedCarousel />
        <InteractiveCategories />
        <PopularModels />
        <VehicleDemo />
        <PerformanceHighlights />
        <FinancingCta />
        <Reviews />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
