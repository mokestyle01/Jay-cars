import Link from "next/link";
import Image from "next/image";
import type { Car } from "@/data/cars";

export function CarCard({ car, version }: { car: Car; version: "v1" | "v2" }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-surface shadow-elevate transition-transform duration-300 hover:-translate-y-1.5">
      <div className="relative overflow-hidden bg-surface-2">
        <Image
          src={car.image}
          alt={car.name}
          loading="lazy"
          width={1280}
          height={864}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-foreground">
          {car.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-3xl leading-none tracking-wide text-foreground">{car.name}</h3>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {car.year} · {car.fuel} · {car.transmission}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[car.power, car.acceleration, car.topSpeed].map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-foreground"
            >
              {spec}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <p className="font-display text-3xl text-primary">{car.price}</p>
          <Link
            href={`/request?type=order&vehicle=${encodeURIComponent(car.id)}&version=${version}`}
            className="rounded-full border-2 border-outline px-5 py-2 text-sm font-bold transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Order enquiry
          </Link>
        </div>
      </div>
    </article>
  );
}
