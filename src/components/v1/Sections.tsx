import Image from "next/image";
import { cars, categories, flagshipCar, testimonials, whyJay } from "@/data/cars";
import { CarCard } from "./CarCard";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { PowertrainDemo } from "@/components/shared/PowertrainDemo";
import Link from "next/link";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.4em] text-brand">{eyebrow}</p>
      <h2 className="mt-4 text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
    </div>
  );
}

export function FeaturedCars() {
  return (
    <section id="models" className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
      <SectionHeading eyebrow="Featured cars" title="This season's selection" />
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} version="v1" />
        ))}
      </div>
    </section>
  );
}

export function WhyJay() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
        <SectionHeading eyebrow="Why JAY" title="A dealership that behaves like a private club" />
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {whyJay.map((item, index) => (
            <div key={item.title}>
              <p className="font-display text-3xl text-brand">0{index + 1}</p>
              <h3 className="mt-4 text-lg text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
      <SectionHeading eyebrow="Categories" title="Find your shape" />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => {
              document.getElementById("models")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group border border-border bg-surface p-6 text-left transition-colors hover:border-brand"
          >
            <p className="font-display text-2xl text-foreground">{category.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{category.blurb}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-brand">
              {category.count} models
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Flagship() {
  return (
    <section id="flagship" className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:items-center lg:px-10">
        <Image
          src={flagshipCar.image}
          alt={flagshipCar.name}
          loading="lazy"
          width={1600}
          height={912}
          className="w-full object-cover shadow-elevate"
        />
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand">{flagshipCar.tagline}</p>
          <h2 className="mt-4 text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {flagshipCar.name}
          </h2>
          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {flagshipCar.specs.map((spec) => (
              <div key={spec.label} className="border-t border-border pt-3">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  {spec.label}
                </dt>
                <dd className="mt-1 font-display text-xl text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 font-display text-3xl text-foreground">{flagshipCar.price}</p>
          <Link
            href="/request?type=order&vehicle=sovereign-coupe&version=v1"
            className="mt-6 inline-flex items-center justify-center bg-brand px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-foreground transition-opacity hover:opacity-90"
          >
            Send an order enquiry
          </Link>
        </div>
      </div>
    </section>
  );
}

export function VehicleDemo() {
  return <PowertrainDemo version="v1" />;
}

export function Testimonials() {
  return (
    <section id="owners" className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
      <SectionHeading eyebrow="Owners" title="Words from the driveway" />
      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {testimonials.map((item) => (
          <figure key={item.name} className="border border-border bg-surface p-8">
            <blockquote className="text-base leading-relaxed text-foreground">
              “{item.quote}”
            </blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="text-foreground">{item.name}</span>
              <span className="block text-xs uppercase tracking-widest text-muted-foreground">
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
    <section className="border-y border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="max-w-lg">
          <h2 className="text-3xl text-foreground sm:text-4xl">Private allocations, first</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            One email each month: new arrivals, allocation openings and invitation-only events.
          </p>
        </div>
        <NewsletterForm />
      </div>
    </section>
  );
}
