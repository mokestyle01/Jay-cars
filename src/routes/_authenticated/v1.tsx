"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/v1/Navbar";
import { Hero } from "@/components/v1/Hero";
import {
  Categories,
  FeaturedCars,
  Flagship,
  Newsletter,
  Testimonials,
  VehicleDemo,
  WhyJay,
} from "@/components/v1/Sections";
import { Footer } from "@/components/v1/Footer";

export default function VersionOne() {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  return (
    <div className="theme-v1 min-h-screen bg-background text-foreground">
      <Navbar onSignOut={handleSignOut} />
      <main>
        <Hero />
        <FeaturedCars />
        <WhyJay />
        <Categories />
        <Flagship />
        <VehicleDemo />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
