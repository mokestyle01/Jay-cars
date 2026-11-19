import { Suspense } from "react";
import MyVehiclesPage from "@/routes/_authenticated/my-vehicles";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background p-8 text-foreground">
          Loading your vehicles…
        </main>
      }
    >
      <MyVehiclesPage />
    </Suspense>
  );
}
