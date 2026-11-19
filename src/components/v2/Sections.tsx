import { useState } from "react";
import Image from "next/image";
import { cars, categories, flagshipCar, performanceHighlights, testimonials } from "@/data/cars";
import { CarCard } from "./CarCard";
import { PowertrainDemo } from "@/components/shared/PowertrainDemo";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import Link from "next/link";

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">{kicker}</p>
      <h2 className="mt-3 text-5xl leading-none tracking-wide text-foreground sm:text-6xl">
        {title}
      </h2>
    </div>
  );
}

export function FeaturedCarousel() {
  const [index, setIndex] = useState(0);
  const car = cars[index]!;

  return (
    <section id="specs" className="mx-auto max-w-7xl px-5 py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Heading kicker="Featured" title="Spotlight vehicle" />
        <div className="flex gap-2">
          <button
            aria-label="Previous vehicle"
            onClick={() => setIndex((value) => (value - 1 + cars.length) % cars.length)}
            className="h-12 w-12 rounded-full border-2 border-outline text-lg font-bold transition-colors hover:bg-surface-2"
          >
            ‹
          </button>
          <button
            aria-label="Next vehicle"
            onClick={() => setIndex((value) => (value + 1) % cars.length)}
            className="h-12 w-12 rounded-full border-2 border-outline text-lg font-bold transition-colors hover:bg-surface-2"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-8 overflow-hidden rounded-[2rem] bg-surface p-6 shadow-elevate lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-10">
        <Image
          key={car.id}
          src={car.image}
          alt={car.name}
          loading="lazy"
          width={1280}
          height={864}
          className="animate-in fade-in w-full rounded-3xl object-cover duration-500"
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-foreground">
            <span className="rounded-full bg-brand px-3 py-1">{car.category}</span>
          </p>
          <h3 className="mt-5 text-5xl leading-none tracking-wide text-foreground">{car.name}</h3>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: "Power", value: car.power },
              { label: "0–60 mph", value: car.acceleration },
              { label: "Top speed", value: car.topSpeed },
              { label: "Gearbox", value: car.transmission },
            ].map((spec) => (
              <div key={spec.label} className="rounded-2xl bg-surface-2 p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {spec.label}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 font-display text-4xl text-primary">{car.price}</p>
          <Link
            href={`/request?type=order&vehicle=${encodeURIComponent(car.id)}&version=v2`}
            className="mt-6 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Order enquiry
          </Link>
        </div>
      </div>
    </section>
  );
}

export function InteractiveCategories() {
  const [active, setActive] = useState(categories[0]!.name);
  const current = categories.find((category) => category.name === active)!;

  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-20">
      <Heading kicker="Categories" title="Pick your kind of fast" />
      <div className="mt-10 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActive(category.name)}
            aria-pressed={active === category.name}
            className={`rounded-full px-6 py-3 text-sm font-bold transition-colors ${
              active === category.name
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground hover:bg-surface-2"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="mt-8 rounded-[2rem] bg-surface p-8 shadow-elevate sm:p-12">
        <p className="font-display text-6xl leading-none text-foreground">{current.name}</p>
        <p className="mt-4 max-w-lg text-base text-muted-foreground">{current.blurb}</p>
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-primary">
          {current.count} models available
        </p>
      </div>
    </section>
  );
}

export function PopularModels() {
  return (
    <section id="lineup" className="mx-auto max-w-7xl px-5 py-20">
      <Heading kicker="Popular models" title="Most requested this month" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} version="v2" />
        ))}
      </div>
    </section>
  );
}

export function VehicleDemo() {
  return <PowertrainDemo version="v2" />;
}

export function PerformanceHighlights() {
  return (
    <section id="performance" className="px-3 py-10 sm:px-5">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-primary p-8 sm:p-14">
        <h2 className="max-w-2xl text-5xl leading-none tracking-wide text-primary-foreground sm:text-6xl">
          Numbers we are happy to publish
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {performanceHighlights.map((item) => (
            <div key={item.label} className="border-t-2 border-primary-foreground/30 pt-4">
              <p className="font-display text-5xl text-primary-foreground">{item.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary-foreground/80">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinancingCta() {
  return (
    <section id="financing" className="mx-auto max-w-7xl px-5 py-20">
      <div className="grid gap-8 overflow-hidden rounded-[2rem] bg-surface p-6 shadow-elevate lg:grid-cols-2 lg:items-center lg:p-12">
        <div>
          <Heading kicker="Financing & test drives" title={flagshipCar.name} />
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            Split it over 36 months or book a 48-hour test drive first. No deposit required to
            reserve a slot.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/request?type=order&vehicle=sovereign-coupe&version=v2"
              className="rounded-full bg-primary px-8 py-4 text-center text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Enquire about this car
            </Link>
            <Link
              href="/request?type=consultation&vehicle=sovereign-coupe&version=v2"
              className="rounded-full border-2 border-outline px-8 py-4 text-center text-sm font-bold text-foreground transition-colors hover:bg-surface-2"
            >
              Get expert advice
            </Link>
          </div>
        </div>
        <Image
          src={flagshipCar.image}
          alt={flagshipCar.name}
          loading="lazy"
          width={1600}
          height={912}
          className="w-full rounded-3xl object-cover"
        />
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section id="reviews" className="mx-auto max-w-7xl px-5 py-20">
      <Heading kicker="Reviews" title="Straight from customers" />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {testimonials.map((item) => (
          <figure
            key={item.name}
            className="rounded-3xl bg-surface p-8 shadow-elevate transition-transform hover:-translate-y-1"
          >
            <p className="text-sm font-bold text-brand-foreground">
              <span className="rounded-full bg-brand px-3 py-1">★★★★★</span>
            </p>
            <blockquote className="mt-5 text-base leading-relaxed text-foreground">
              “{item.quote}”
            </blockquote>
            <figcaption className="mt-6 text-sm font-semibold text-foreground">
              {item.name}
              <span className="block text-xs font-normal uppercase tracking-widest text-muted-foreground">
                {item.role}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20">
      <div className="flex flex-col gap-8 rounded-[2rem] bg-surface p-8 shadow-elevate sm:p-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <h2 className="text-5xl leading-none tracking-wide text-foreground">Get drop alerts</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            New arrivals, price drops and test-drive weekends — twice a month.
          </p>
        </div>
        <NewsletterForm rounded="rounded-full" />
      </div>
    </section>
  );
}
