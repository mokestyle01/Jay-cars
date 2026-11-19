import { useState } from "react";

export function NewsletterForm({ rounded = "rounded-md" }: { rounded?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        setState(valid ? "done" : "error");
      }}
      className="w-full max-w-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setState("idle");
          }}
          placeholder="you@example.com"
          aria-invalid={state === "error"}
          className={`h-12 flex-1 border border-input bg-surface px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring ${rounded}`}
        />
        <button
          type="submit"
          className={`h-12 bg-brand px-6 text-sm font-semibold uppercase tracking-wider text-brand-foreground transition-opacity hover:opacity-90 ${rounded}`}
        >
          Subscribe
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-sm text-destructive">Enter a valid email address.</p>
      )}
      {state === "done" && (
        <p className="mt-2 text-sm text-muted-foreground">Thanks — you're on the list.</p>
      )}
    </form>
  );
}
