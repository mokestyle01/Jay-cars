import { Suspense } from "react";
import RequestPage from "@/routes/_authenticated/request";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background p-8 text-foreground">
          Loading your request form…
        </main>
      }
    >
      <RequestPage />
    </Suspense>
  );
}
