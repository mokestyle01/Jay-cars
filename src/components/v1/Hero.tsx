import Image from "next/image";
import heroImage from "@/assets/v1-hero.jpg";

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <Image
        src={heroImage}
        alt="Luxury grand tourer in a dark studio"
        fill
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-5 py-24 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.45em] text-brand">JAY Atelier</p>
        <h1 className="mt-6 max-w-2xl text-balance-tight text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
          Drive Beyond Ordinary
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A curated collection of performance and luxury vehicles, prepared to concours standard and
          delivered to your door.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#models"
            className="inline-flex h-13 items-center justify-center bg-brand px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-foreground transition-opacity hover:opacity-90"
          >
            Explore cars
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center border border-outline px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            Book a test drive
          </a>
        </div>
      </div>
    </section>
  );
}
