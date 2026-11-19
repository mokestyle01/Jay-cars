"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth, type OAuthProvider } from "@/hooks/useAuth";

const oauthProviders: { id: OAuthProvider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "discord", label: "Discord" },
  { id: "twitter", label: "X" },
];

export default function AuthPage() {
  const { user, loading, signIn, signInWithProvider, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/v1");
  }, [loading, user, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    if (mode === "signup") {
      const result = await signUp(email, password);
      setBusy(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.needsConfirmation) {
        setNotice("Check your inbox and click the confirmation link, then log in.");
        setMode("login");
        setPassword("");
        return;
      }
      router.replace("/v1");
      return;
    }

    const result = await signIn(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace("/v1");
  }

  async function handleProviderSignIn(provider: OAuthProvider) {
    setError(null);
    setNotice(null);
    setBusy(true);

    const result = await signInWithProvider(provider);
    if (result.error) {
      setBusy(false);
      setError(result.error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-2xl tracking-[0.3em] text-foreground">
          JAY
        </Link>

        <div className="mt-8 border border-border bg-surface p-8 shadow-elevate">
          <h1 className="text-3xl text-foreground">
            {mode === "login" ? "Log in" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Access the JAY collection."
              : "Create your account with email or your preferred sign-in provider."}
          </p>
          {!isSupabaseConfigured && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              Sign-in is unavailable because Supabase is not configured. Set
              NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the deployment
              environment.
            </p>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3">
            {oauthProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => handleProviderSignIn(provider.id)}
                disabled={busy || !isSupabaseConfigured}
                className="h-12 border border-input bg-background text-sm font-medium text-foreground transition-colors hover:border-brand disabled:opacity-60"
              >
                {busy ? "Please wait…" : `Continue with ${provider.label}`}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {notice && <p className="text-sm text-brand">{notice}</p>}

            <button
              type="submit"
              disabled={busy || !isSupabaseConfigured}
              className="h-12 w-full bg-brand text-xs font-semibold uppercase tracking-[0.2em] text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setNotice(null);
            }}
            className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {mode === "login" ? "No account yet? Create one" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
