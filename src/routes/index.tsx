"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/v1-hero.jpg";
import { HomeShowcase } from "@/components/shared/HomeShowcase";

export default function Landing() {
  const { user, loading } = useAuth();

  return (
    <>
      <div className="relative isolate flex min-h-[85vh] flex-col bg-background">
        <Image
          src={heroImage}
          alt="Luxury car in a dark studio"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />

        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-8 lg:px-10">
          <span className="font-display text-2xl tracking-[0.3em] text-foreground">JAY</span>
          {!loading && (
            <Link
              href="/cars"
              className="border border-outline px-5 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              Browse collection
            </Link>
          )}
        </header>

        <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-16 lg:px-10">
          <p className="text-[11px] uppercase tracking-[0.45em] text-brand">
            Curated automotive marketplace
          </p>
          <h1 className="mt-6 max-w-3xl text-balance-tight text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
            Find the car that moves you.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Explore a considered collection of performance and luxury vehicles, compare the details,
            and connect with a JAY specialist.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center bg-brand px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-foreground transition-opacity hover:opacity-90"
            >
              Explore vehicles
            </Link>
            <Link
              href={user ? "/v1" : "/auth"}
              className="inline-flex items-center justify-center border border-outline px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              {user ? "Open showroom" : "Sign in or create account"}
            </Link>
          </div>
        </main>
      </div>
      <HomeShowcase />
    </>
  );
}
