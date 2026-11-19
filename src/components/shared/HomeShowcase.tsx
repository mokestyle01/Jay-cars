import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Car = Tables<"cars">;
type Media = Pick<Tables<"car_images">, "car_id" | "storage_path">;
type Video = Pick<Tables<"car_videos">, "car_id" | "storage_path" | "title">;

export function HomeShowcase() {
  const [cars, setCars] = useState<Car[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [videos, setVideos] = useState<Record<string, Video>>({});
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
    async function loadShowcase() {
      const { data: carRows, error: carError } = await supabase
        .from("cars")
        .select("*")
        .neq("availability", "sold")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);
      if (!active) return;
      if (carError) {
        setError(carError.message);
        setLoading(false);
        return;
      }
      if (!carRows.length) {
        setCars([]);
        setLoading(false);
        return;
      }

      const ids = carRows.map((car) => car.id);
      const [imageResult, videoResult] = await Promise.all([
        supabase
          .from("car_images")
          .select("car_id, storage_path")
          .in("car_id", ids)
          .order("sort_order"),
        supabase
          .from("car_videos")
          .select("car_id, storage_path, title")
          .in("car_id", ids)
          .order("created_at"),
      ]);
      if (!active) return;
      if (imageResult.error || videoResult.error) {
        setError(
          imageResult.error?.message ??
            videoResult.error?.message ??
            "Could not load vehicle media.",
        );
        setLoading(false);
        return;
      }

      const imageMap: Record<string, string> = {};
      for (const image of imageResult.data as Media[]) {
        if (imageMap[image.car_id]) continue;
        imageMap[image.car_id] = supabase.storage
          .from("vehicle-images")
          .getPublicUrl(image.storage_path).data.publicUrl;
      }
      const videoMap: Record<string, Video> = {};
      for (const video of videoResult.data as Video[]) {
        if (!videoMap[video.car_id]) videoMap[video.car_id] = video;
      }
      setCars(carRows);
      setImages(imageMap);
      setVideos(videoMap);
      setLoading(false);
    }

    void loadShowcase();
    return () => {
      active = false;
    };
  }, []);

  const filmCar = cars.find((car) => videos[car.id]) ?? cars[0];
  const film = filmCar ? videos[filmCar.id] : undefined;

  return (
    <section className="page-enter bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-brand">The collection</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Arrivals worth a closer look.</h2>
          </div>
          <a
            href="/cars"
            className="text-xs font-semibold uppercase tracking-widest text-brand hover:underline"
          >
            View all vehicles
          </a>
        </div>

        {error && (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {error}
          </p>
        )}
        {loading && (
          <p role="status" className="mt-8 text-sm text-muted-foreground">
            Loading recent arrivals…
          </p>
        )}
        {!error && filmCar && film && (
          <article className="relative mt-10 overflow-hidden border border-border bg-surface">
            <video
              controls
              playsInline
              preload="metadata"
              poster={images[filmCar.id]}
              className="aspect-video max-h-[72vh] w-full bg-black object-cover"
              aria-label={film.title || `${filmCar.name} showcase`}
            >
              <source
                src={
                  supabase.storage.from("vehicle-videos").getPublicUrl(film.storage_path).data
                    .publicUrl
                }
              />
            </video>
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-7">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-brand">
                  JAY showcase film
                </p>
                <h3 className="mt-2 text-2xl">
                  {filmCar.year} {filmCar.brand} {filmCar.name}
                </h3>
              </div>
              <a
                href={`/cars/${filmCar.id}`}
                className="border border-outline px-5 py-3 text-xs font-semibold uppercase tracking-widest hover:border-brand hover:text-brand"
              >
                Explore vehicle
              </a>
            </div>
          </article>
        )}

        {cars.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cars.slice(0, 3).map((car) => (
              <a
                key={car.id}
                href={`/cars/${car.id}`}
                className="group overflow-hidden border border-border bg-surface transition-colors hover:border-brand/60"
              >
                {images[car.id] ? (
                  <img
                    src={images[car.id]}
                    alt={`${car.year} ${car.brand} ${car.name}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-surface-2 text-xs uppercase tracking-widest text-muted-foreground">
                    Photos coming soon
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-widest text-brand">
                    {car.featured ? "Featured" : "Latest arrival"} · {car.brand}
                  </p>
                  <h3 className="mt-2 text-2xl">
                    {car.year} {car.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {car.model} · {car.availability}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
        {!loading && !error && cars.length === 0 && (
          <p className="mt-8 border border-border bg-surface p-6 text-sm text-muted-foreground">
            New arrivals will appear here as soon as the JAY team adds them to the collection.
          </p>
        )}
      </div>
    </section>
  );
}
