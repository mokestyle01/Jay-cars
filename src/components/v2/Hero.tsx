import Image from "next/image";
import heroImage from "@/assets/v2-hero.jpg";
import { performanceHighlights } from "@/data/cars";

export function Hero() {
  return (
    <section id="top" className="px-3 pt-6 sm:px-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-surface shadow-elevate">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:p-14">
          <div>
            <span className="inline-flex rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-foreground">
              2026 lineup is live
            </span>
            <h1 className="mt-6 text-6xl leading-[0.95] tracking-wide text-foreground sm:text-7xl lg:text-8xl">
              Built to
              <span className="block text-primary">move fast</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Performance cars, electric crossovers and weekend machines — priced transparently and
              delivered in days, not months.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lineup"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Explore cars
              </a>
              <a
                href="#financing"
                className="inline-flex items-center justify-center rounded-full border-2 border-outline px-8 py-4 text-sm font-bold text-foreground transition-colors hover:bg-surface-2"
              >
                Book a test drive
              </a>
            </div>
          </div>

          <div className="relative">
            <Image
              src={heroImage}
              alt="Bright green sports car on a coastal road"
              width={1920}
              height={1088}
              className="w-full rounded-3xl object-cover"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {performanceHighlights.map((item) => (
                <div key={item.label} className="rounded-2xl bg-surface-2 p-4">
                  <p className="font-display text-2xl text-foreground">{item.value}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
