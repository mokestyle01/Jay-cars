import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { VersionSwitch } from "@/components/shared/VersionSwitch";

const links = ["Models", "Categories", "Demo", "Flagship", "Owners", "Contact"];

export function Navbar({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <a href="#top" className="font-display text-2xl tracking-[0.3em] text-foreground">
          JAY
        </a>

        <nav className="hidden items-center gap-9 xl:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-brand"
            >
              {link}
            </a>
          ))}
          <Link
            href="/cars"
            className="text-xs font-medium uppercase tracking-[0.2em] text-brand transition-colors hover:text-foreground"
          >
            Marketplace
          </Link>
        </nav>

        <div className="hidden items-center gap-4 xl:flex">
          <VersionSwitch current="v1" />
          <Link
            href="/my-vehicles?version=v1"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand"
          >
            Your cars
          </Link>
          <Link
            href="/request?type=consultation&version=v1"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand"
          >
            Get advice
          </Link>
          <Link
            href="/profile?version=v1"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand"
          >
            Profile
          </Link>
          <Link
            href="/my-requests"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand"
          >
            Requests
          </Link>
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand"
          >
            Admin
          </Link>
          <span className="max-w-[16ch] truncate text-xs text-muted-foreground">{user?.email}</span>
          <button
            onClick={onSignOut}
            className="border border-outline px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            Log out
          </button>
        </div>

        <button
          className="border border-outline px-3 py-2 text-xs uppercase tracking-widest xl:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-5 py-6 xl:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-muted-foreground"
              >
                {link}
              </a>
            ))}
          </nav>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <VersionSwitch current="v1" />
            <div className="flex items-center gap-4">
              <Link
                href="/cars"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-widest text-foreground"
              >
                Marketplace
              </Link>
              <Link
                href="/my-vehicles?version=v1"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-widest text-foreground"
              >
                Your cars
              </Link>
              <Link
                href="/request?type=consultation&version=v1"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-widest text-foreground"
              >
                Get advice
              </Link>
              <Link
                href="/profile?version=v1"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-widest text-foreground"
              >
                Profile
              </Link>
              <Link
                href="/my-requests"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-widest text-foreground"
              >
                Requests
              </Link>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-widest text-foreground"
              >
                Admin
              </Link>
              <button
                onClick={onSignOut}
                className="border border-outline px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
