"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Car = Tables<"cars">;
type CarImage = Tables<"car_images">;

export default function MarketplacePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [minimumYear, setMinimumYear] = useState("");
  const [maximumYear, setMaximumYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError(
        "Vehicle listings are unavailable until Supabase is configured for this deployment.",
      );
      setLoading(false);
      return;
    }

    let active = true;
    async function loadCars() {
      const { data, error: carsError } = await supabase
        .from("cars")
        .select("*")
        .neq("availability", "sold")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!active) return;
      if (carsError) {
        setError(carsError.message);
        setLoading(false);
        return;
      }

      const carIds = data.map((car) => car.id);
      if (carIds.length > 0) {
        const { data: imageRows, error: imagesError } = await supabase
          .from("car_images")
          .select("*")
          .in("car_id", carIds)
          .order("sort_order", { ascending: true });

        if (!active) return;
        if (imagesError) {
          setError(imagesError.message);
          setLoading(false);
          return;
        }

        const nextImages: Record<string, string> = {};
        for (const image of imageRows as CarImage[]) {
          if (nextImages[image.car_id]) continue;
          nextImages[image.car_id] = supabase.storage
            .from("vehicle-images")
            .getPublicUrl(image.storage_path).data.publicUrl;
        }
        setImages(nextImages);
      }
      setCars(data);
      setLoading(false);
    }

    void loadCars();
    return () => {
      active = false;
    };
  }, []);

  const brands = useMemo(() => [...new Set(cars.map((car) => car.brand))].sort(), [cars]);
  const filteredCars = useMemo(() => {
    const query = search.trim().toLowerCase();
    const minPrice = minimumPrice === "" ? null : Number(minimumPrice);
    const maxPrice = maximumPrice === "" ? null : Number(maximumPrice);
    const minYear = minimumYear === "" ? null : Number(minimumYear);
    const maxYear = maximumYear === "" ? null : Number(maximumYear);

    return cars.filter((car) => {
      const matchesSearch =
        !query || `${car.brand} ${car.name} ${car.model}`.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (brand === "all" || car.brand === brand) &&
        (availability === "all" || car.availability === availability) &&
        (minPrice === null || car.price >= minPrice) &&
        (maxPrice === null || car.price <= maxPrice) &&
        (minYear === null || car.year >= minYear) &&
        (maxYear === null || car.year <= maxYear)
      );
    });
  }, [availability, brand, cars, maximumPrice, maximumYear, minimumPrice, minimumYear, search]);

  return (
    <main className="page-enter theme-v1 min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">
          <a href="/" className="font-display text-2xl tracking-[0.3em]">
            JAY
          </a>
          <nav className="flex items-center gap-5 text-xs font-semibold uppercase tracking-widest">
            <a href="/cars" className="text-brand">
              Collection
            </a>
            <a href="/auth" className="text-muted-foreground transition-colors hover:text-brand">
              Sign in
            </a>
          </nav>
        </div>
      </header>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-20">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand">The JAY collection</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-tight sm:text-6xl">
            Find your next drive.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Browse current arrivals, compare the details, and get in touch with our team when one
            feels right.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <label className="lg:col-span-2">
            <span className="sr-only">Search vehicles</span>
            <input
              type="search"
              placeholder="Search make or model"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 w-full border border-input bg-surface px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label>
            <span className="sr-only">Brand</span>
            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className="h-12 w-full border border-input bg-surface px-3 text-sm"
            >
              <option value="all">All brands</option>
              {brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Availability</span>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="h-12 w-full border border-input bg-surface px-3 text-sm"
            >
              <option value="all">Any status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Minimum year</span>
            <input
              type="number"
              placeholder="Year from"
              value={minimumYear}
              onChange={(event) => setMinimumYear(event.target.value)}
              className="h-12 w-full border border-input bg-surface px-3 text-sm"
            />
          </label>
          <label>
            <span className="sr-only">Maximum year</span>
            <input
              type="number"
              placeholder="Year to"
              value={maximumYear}
              onChange={(event) => setMaximumYear(event.target.value)}
              className="h-12 w-full border border-input bg-surface px-3 text-sm"
            />
          </label>
          <label>
            <span className="sr-only">Minimum price</span>
            <input
              type="number"
              min="0"
              placeholder="Min price"
              value={minimumPrice}
              onChange={(event) => setMinimumPrice(event.target.value)}
              className="h-12 w-full border border-input bg-surface px-3 text-sm"
            />
          </label>
          <label>
            <span className="sr-only">Maximum price</span>
            <input
              type="number"
              min="0"
              placeholder="Max price"
              value={maximumPrice}
              onChange={(event) => setMaximumPrice(event.target.value)}
              className="h-12 w-full border border-input bg-surface px-3 text-sm"
            />
          </label>
        </div>

        <div className="mt-8 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-2xl">Vehicles</h2>
          <p className="text-sm text-muted-foreground">{filteredCars.length} found</p>
        </div>

        {loading && (
          <p role="status" className="py-12 text-sm text-muted-foreground">
            Loading vehicles…
          </p>
        )}
        {error && (
          <p role="alert" className="py-12 text-sm text-destructive">
            {error}
          </p>
        )}
        {!loading && !error && filteredCars.length === 0 && (
          <p className="py-12 text-sm text-muted-foreground">
            No vehicles match those filters yet.
          </p>
        )}
        {!loading && !error && filteredCars.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCars.map((car) => (
              <a
                key={car.id}
                href={`/cars/${car.id}`}
                className="group overflow-hidden border border-border bg-surface transition-colors hover:border-brand/60"
              >
                <div className="relative overflow-hidden bg-surface-2">
                  {images[car.id] ? (
                    <img
                      src={images[car.id]}
                      alt={`${car.year} ${car.brand} ${car.name}`}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                      Photos coming soon
                    </div>
                  )}
                  {car.featured && (
                    <span className="absolute left-4 top-4 bg-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-foreground">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-brand">
                      {car.brand}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {car.availability}
                    </p>
                  </div>
                  <h3 className="mt-2 text-2xl">
                    {car.year} {car.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {car.model} · {car.mileage.toLocaleString()} mi · {car.transmission}
                  </p>
                  <p className="mt-5 border-t border-border pt-4 font-display text-2xl">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: car.currency,
                      maximumFractionDigits: 0,
                    }).format(car.price)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
