"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Enquiry = Tables<"car_enquiries">;
type Order = Tables<"car_orders">;

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadRequests() {
      if (!user) {
        setLoading(false);
        return;
      }
      const [enquiryResult, orderResult] = await Promise.all([
        supabase.from("car_enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("car_orders").select("*").order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (enquiryResult.error || orderResult.error) {
        setError(
          enquiryResult.error?.message ??
            orderResult.error?.message ??
            "Could not load your requests.",
        );
        setLoading(false);
        return;
      }
      setEnquiries(enquiryResult.data);
      setOrders(orderResult.data);
      setLoading(false);
    }

    void loadRequests();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <main className="page-enter theme-v1 min-h-screen bg-background px-5 py-12 text-foreground sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/v1" className="font-display text-2xl tracking-[0.3em]">
            JAY
          </Link>
          <Link
            href="/cars"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-brand"
          >
            Browse cars
          </Link>
        </div>
        <header className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand">Your account</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Enquiries & orders</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Follow the latest status of your requests with the JAY team.
          </p>
        </header>

        {loading && (
          <p role="status" className="mt-8 text-sm text-muted-foreground">
            Loading your requests…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-8 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <section className="mt-10">
              <h2 className="text-2xl">Order requests</h2>
              {orders.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  You have no vehicle order requests yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="border border-border bg-surface p-5 sm:flex sm:items-center sm:justify-between sm:gap-6"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-widest text-brand">
                          {order.order_reference}
                        </p>
                        <h3 className="mt-2 text-xl">{order.car_name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {order.fulfilment === "delivery" ? "Delivery" : "Collection"} ·{" "}
                          {order.city}, {order.country} ·{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-4 inline-flex border border-outline px-3 py-2 text-xs font-semibold uppercase tracking-widest sm:mt-0">
                        {order.status}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-12">
              <h2 className="text-2xl">Vehicle enquiries</h2>
              {enquiries.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  You have no vehicle enquiries yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {enquiries.map((enquiry) => (
                    <article
                      key={enquiry.id}
                      className="border border-border bg-surface p-5 sm:flex sm:items-start sm:justify-between sm:gap-6"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-widest text-brand">
                          {enquiry.subject}
                        </p>
                        <h3 className="mt-2 text-xl">{enquiry.car_name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{enquiry.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(enquiry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-4 inline-flex border border-outline px-3 py-2 text-xs font-semibold uppercase tracking-widest sm:mt-0">
                        {enquiry.status}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
