"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <main
        className="theme-v1 flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground"
        role="status"
      >
        Checking your session…
      </main>
    );
  }

  return children;
}
