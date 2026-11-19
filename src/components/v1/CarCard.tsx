import Link from "next/link";
import Image from "next/image";
import type { Car } from "@/data/cars";

export function CarCard({ car, version }: { car: Car; version: "v1" | "v2" }) {
  return (
    <article className="group overflow-hidden border border-border bg-surface transition-colors hover:border-brand/60">
      <div className="overflow-hidden bg-surface-2">
        <Image
          src={car.image}
          alt={car.name}
          loading="lazy"
          width={1280}
          height={864}
          className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-brand">{car.category}</p>
        <h3 className="mt-3 text-xl text-foreground">{car.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{car.year}</p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Fuel</dt>
            <dd className="text-foreground">{car.fuel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Gearbox</dt>
            <dd className="text-foreground">{car.transmission}</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Starting at</p>
            <p className="font-display text-2xl text-foreground">{car.price}</p>
          </div>
          <Link
            href={`/request?type=order&vehicle=${encodeURIComponent(car.id)}&version=${version}`}
            className="border border-outline px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:border-brand hover:text-brand"
          >
            Order enquiry
          </Link>
        </div>
      </div>
    </article>
  );
}
