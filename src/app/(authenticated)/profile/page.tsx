import { Suspense } from "react";
import ProfilePage from "@/routes/_authenticated/profile";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background p-8 text-foreground">
          Loading your profile…
        </main>
      }
    >
      <ProfilePage />
    </Suspense>
  );
}
