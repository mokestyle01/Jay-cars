"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { requestableVehicles } from "@/data/cars";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type RequestType = "order" | "consultation";
type ShowroomVersion = "v1" | "v2";

export default function RequestPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "order" ? "order" : "consultation";
  const queryVehicle = searchParams.get("vehicle") ?? "";
  const vehicle = requestableVehicles.some((item) => item.id === queryVehicle) ? queryVehicle : "";
  const version = searchParams.get("version") === "v2" ? "v2" : "v1";
  const [requestType, setRequestType] = useState<RequestType>(type);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicle);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const showroomPath = version === "v2" ? "/v2" : "/v1";
  const selectedVehicle = requestableVehicles.find(({ id }) => id === selectedVehicleId);

  useEffect(() => {
    setRequestType(type);
    setSelectedVehicleId(vehicle);
  }, [type, vehicle]);

  useEffect(() => {
    setEmail(user?.email ?? "");
    const metadata: Record<string, unknown> = user?.user_metadata ?? {};
    setCustomerName(typeof metadata["full_name"] === "string" ? metadata["full_name"] : "");
    setPhone(typeof metadata["phone"] === "string" ? metadata["phone"] : "");
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!user) {
      setError("Please sign in again before sending your request.");
      return;
    }
    setBusy(true);

    const { error: insertError } = await supabase.from("customer_requests").insert({
      user_id: user.id,
      request_type: requestType,
      vehicle_id: selectedVehicle?.id ?? null,
      vehicle_name: selectedVehicle?.name ?? null,
      customer_name: customerName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      budget: budget.trim() || null,
      intended_use: intendedUse.trim() || null,
      message: message.trim() || null,
    });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setNotice("Your request has been sent. A JAY specialist will follow up with you.");
    setMessage("");
  }

  return (
    <main
      className={`${version === "v2" ? "theme-v2" : "theme-v1"} min-h-screen bg-background px-5 py-12 text-foreground sm:py-16`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={showroomPath}
            className="font-display text-2xl tracking-[0.3em] text-foreground"
          >
            JAY
          </Link>
          <Link
            href={showroomPath}
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand"
          >
            Back to showroom
          </Link>
        </div>

        <section className="mt-10 border border-border bg-surface p-6 shadow-elevate sm:p-10">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand">Personal service</p>
          <h1 className="mt-3 text-4xl text-foreground">
            {requestType === "order" ? "Enquire about a car" : "Find your right car"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {requestType === "order"
              ? "Send an order enquiry to our team. This is a request, not a payment or confirmed purchase."
              : "Tell a JAY specialist what you need, and we’ll help shortlist the right vehicle."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="request-type"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                What can we help with?
              </label>
              <select
                id="request-type"
                value={requestType}
                onChange={(event) => {
                  setRequestType(event.target.value === "order" ? "order" : "consultation");
                  setError(null);
                  setNotice(null);
                }}
                className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="order">Order enquiry</option>
                <option value="consultation">Car-buying consultation</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="vehicle"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Vehicle
              </label>
              <select
                id="vehicle"
                required={requestType === "order"}
                value={selectedVehicleId}
                onChange={(event) => setSelectedVehicleId(event.target.value)}
                className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">
                  {requestType === "order" ? "Choose a vehicle" : "Help me choose"}
                </option>
                {requestableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="customer-name"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Your name
                </label>
                <input
                  id="customer-name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="request-email"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Email
                </label>
                <input
                  id="request-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="request-phone"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Phone number
              </label>
              <input
                id="request-phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {requestType === "consultation" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="budget"
                    className="text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    Budget range
                  </label>
                  <input
                    id="budget"
                    type="text"
                    maxLength={100}
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    placeholder="e.g. $50,000–$80,000"
                    className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label
                    htmlFor="intended-use"
                    className="text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    How will you use it?
                  </label>
                  <input
                    id="intended-use"
                    type="text"
                    maxLength={250}
                    value={intendedUse}
                    onChange={(event) => setIntendedUse(event.target.value)}
                    placeholder="e.g. daily commute, family trips"
                    className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="request-message"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                {requestType === "order"
                  ? "Questions or preferences"
                  : "Anything else we should know?"}
              </label>
              <textarea
                id="request-message"
                rows={4}
                maxLength={2000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

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
              disabled={busy}
              className="h-12 bg-brand px-8 text-xs font-semibold uppercase tracking-[0.2em] text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy
                ? "Sending…"
                : requestType === "order"
                  ? "Send order enquiry"
                  : "Request consultation"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
