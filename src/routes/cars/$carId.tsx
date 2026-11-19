"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

type Car = Tables<"cars">;
type Media = { id: string; storage_path: string; title?: string; alt_text?: string };

export default function CarDetailPage() {
  const { carId } = useParams<{ carId: string }>();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [images, setImages] = useState<Media[]>([]);
  const [videos, setVideos] = useState<Media[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [intent, setIntent] = useState<"enquiry" | "order">("enquiry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Vehicle availability");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [fulfilment, setFulfilment] = useState<"delivery" | "collection">("delivery");
  const [additionalInformation, setAdditionalInformation] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadCar() {
      const { data: carData, error: carError } = await supabase
        .from("cars")
        .select("*")
        .eq("id", carId)
        .maybeSingle();

      if (!active) return;
      if (carError) {
        setError(carError.message);
        setLoading(false);
        return;
      }
      if (!carData) {
        setLoading(false);
        return;
      }

      const [imageResult, videoResult] = await Promise.all([
        supabase.from("car_images").select("*").eq("car_id", carId).order("sort_order"),
        supabase.from("car_videos").select("*").eq("car_id", carId).order("created_at"),
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

      setCar(carData);
      setImages(imageResult.data);
      setVideos(videoResult.data);
      setLoading(false);
    }

    void loadCar();
    return () => {
      active = false;
    };
  }, [carId]);

  useEffect(() => {
    const metadata: Record<string, unknown> = user?.user_metadata ?? {};
    setEmail(user?.email ?? "");
    setName(typeof metadata["full_name"] === "string" ? metadata["full_name"] : "");
    setPhone(typeof metadata["phone"] === "string" ? metadata["phone"] : "");
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!user || !car) {
      setError("Sign in to send a vehicle request.");
      return;
    }

    setBusy(true);
    if (intent === "enquiry") {
      const { error: insertError } = await supabase.from("car_enquiries").insert({
        user_id: user.id,
        car_id: car.id,
        car_name: `${car.year} ${car.brand} ${car.name}`,
        customer_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject,
        message: message.trim(),
      });
      setBusy(false);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setNotice("Your enquiry has been sent. A JAY specialist will be in touch.");
      setMessage("");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("car_orders")
      .insert({
        user_id: user.id,
        car_id: car.id,
        car_name: `${car.year} ${car.brand} ${car.name}`,
        customer_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        city: city.trim(),
        fulfilment,
        additional_information: additionalInformation.trim(),
      })
      .select("order_reference")
      .single();

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNotice(`Your order request was received. Reference: ${data.order_reference}`);
    setAdditionalInformation("");
  }

  if (loading) {
    return (
      <main className="theme-v1 min-h-screen bg-background p-8 text-foreground" role="status">
        Loading vehicle…
      </main>
    );
  }
  if (error && !car) {
    return (
      <main className="theme-v1 min-h-screen bg-background p-8 text-destructive" role="alert">
        {error}
      </main>
    );
  }
  if (!car) {
    return (
      <main className="theme-v1 min-h-screen bg-background p-8 text-foreground">
        <p>This vehicle is unavailable or could not be found.</p>
        <a href="/cars" className="mt-4 inline-block text-brand">
          Back to collection
        </a>
      </main>
    );
  }

  const imageUrl = (image: Media) =>
    supabase.storage.from("vehicle-images").getPublicUrl(image.storage_path).data.publicUrl;
  const videoUrl = (video: Media) =>
    supabase.storage.from("vehicle-videos").getPublicUrl(video.storage_path).data.publicUrl;
  const currencyPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: car.currency,
    maximumFractionDigits: 0,
  }).format(car.price);
  const engineSpecs = Object.entries(asJsonObject(car.engine_specs));
  const specifications = Object.entries(asJsonObject(car.specifications));

  return (
    <main className="page-enter theme-v1 min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">
          <a href="/" className="font-display text-2xl tracking-[0.3em]">
            JAY
          </a>
          <a
            href="/cars"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-brand"
          >
            Back to collection
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-10 lg:grid-cols-[1.4fr_0.8fr] lg:px-10 lg:py-16">
        <section>
          <div className="overflow-hidden bg-surface-2">
            {images[activeImage] ? (
              <img
                src={imageUrl(images[activeImage])}
                alt={images[activeImage].alt_text || `${car.year} ${car.brand} ${car.name}`}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                Vehicle photographs coming soon
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View photo ${index + 1}`}
                  className={`overflow-hidden border ${index === activeImage ? "border-brand" : "border-border"}`}
                >
                  <img
                    src={imageUrl(image)}
                    alt={image.alt_text || `Vehicle photo ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            <p className="text-[11px] uppercase tracking-[0.4em] text-brand">
              {car.brand} · {car.availability}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl">
              {car.year} {car.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{car.model}</p>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {car.description}
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border py-6 sm:grid-cols-3">
            {[
              ["Mileage", `${car.mileage.toLocaleString()} mi`],
              ["Transmission", car.transmission],
              ["Fuel", car.fuel_type],
              ...engineSpecs.map(([key, value]) => [key, String(value)]),
              ...specifications.map(([key, value]) => [key, String(value)]),
            ].map(([label, value]) => (
              <div key={label} className="border-t border-border pt-3">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          {car.features.length > 0 && (
            <section className="mt-8">
              <h2 className="text-2xl">Features</h2>
              <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {car.features.map((feature) => (
                  <li key={feature}>— {feature}</li>
                ))}
              </ul>
            </section>
          )}
          {(car.exterior_details || car.interior_details) && (
            <section className="mt-8 grid gap-6 sm:grid-cols-2">
              {car.exterior_details && (
                <div>
                  <h2 className="text-xl">Exterior</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {car.exterior_details}
                  </p>
                </div>
              )}
              {car.interior_details && (
                <div>
                  <h2 className="text-xl">Interior</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {car.interior_details}
                  </p>
                </div>
              )}
            </section>
          )}
          {videos.map((video) => (
            <figure key={video.id} className="mt-8">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full bg-black"
                aria-label={video.title || `${car.name} presentation`}
              >
                <source src={videoUrl(video)} />
              </video>
              {video.title && (
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {video.title}
                </figcaption>
              )}
            </figure>
          ))}
        </section>

        <aside>
          <div className="sticky top-6 border border-border bg-surface p-6 shadow-elevate sm:p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Asking price</p>
            <p className="mt-2 font-display text-4xl">{currencyPrice}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {car.availability === "available" ? "Available now" : "Currently reserved"}
            </p>

            <div className="mt-7 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIntent("enquiry");
                  setError(null);
                  setNotice(null);
                }}
                className={`h-11 text-xs font-semibold uppercase tracking-widest ${intent === "enquiry" ? "bg-brand text-brand-foreground" : "border border-outline text-foreground"}`}
              >
                Make enquiry
              </button>
              <button
                type="button"
                onClick={() => {
                  setIntent("order");
                  setError(null);
                  setNotice(null);
                }}
                className={`h-11 text-xs font-semibold uppercase tracking-widest ${intent === "order" ? "bg-brand text-brand-foreground" : "border border-outline text-foreground"}`}
              >
                Order request
              </button>
            </div>
            {!user ? (
              <p className="mt-5 text-sm text-muted-foreground">
                <a href="/auth" className="text-brand underline">
                  Sign in
                </a>{" "}
                to send a request and track it in your account.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                  Your name
                  <input
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm text-foreground"
                  />
                </label>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                  Email
                  <input
                    required
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm text-foreground"
                  />
                </label>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                  Phone
                  <input
                    required
                    type="tel"
                    maxLength={30}
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm text-foreground"
                  />
                </label>
                {intent === "enquiry" ? (
                  <>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                      Subject
                      <select
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm text-foreground"
                      >
                        <option>Vehicle availability</option>
                        <option>Request pictures or video</option>
                        <option>Vehicle specifications</option>
                        <option>Pricing information</option>
                        <option>Arrange a test drive</option>
                        <option>Arrange a viewing</option>
                      </select>
                    </label>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                      Message
                      <textarea
                        required
                        maxLength={3000}
                        rows={4}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        Country
                        <input
                          required
                          maxLength={100}
                          value={country}
                          onChange={(event) => setCountry(event.target.value)}
                          className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm text-foreground"
                        />
                      </label>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        City
                        <input
                          required
                          maxLength={100}
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm text-foreground"
                        />
                      </label>
                    </div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                      Preference
                      <select
                        value={fulfilment}
                        onChange={(event) =>
                          setFulfilment(event.target.value as "delivery" | "collection")
                        }
                        className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm text-foreground"
                      >
                        <option value="delivery">Delivery</option>
                        <option value="collection">Collection</option>
                      </select>
                    </label>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                      Additional information
                      <textarea
                        maxLength={3000}
                        rows={3}
                        value={additionalInformation}
                        onChange={(event) => setAdditionalInformation(event.target.value)}
                        className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </label>
                  </>
                )}
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                {notice && (
                  <p role="status" className="text-sm text-brand">
                    {notice}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy || car.availability === "sold"}
                  className="h-12 w-full bg-brand text-xs font-semibold uppercase tracking-[0.18em] text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {busy
                    ? "Sending…"
                    : intent === "enquiry"
                      ? "Send enquiry"
                      : "Submit order request"}
                </button>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Order requests are not purchases; no payment is taken at this stage.
                </p>
              </form>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function asJsonObject(value: Json): Record<string, Json | undefined> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return value;
}
