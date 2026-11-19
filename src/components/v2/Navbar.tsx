import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { VersionSwitch } from "@/components/shared/VersionSwitch";

const links = ["Lineup", "Categories", "Specs", "Demo", "Performance", "Reviews"];

export function Navbar({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="mx-auto max-w-7xl rounded-3xl border border-border bg-surface/90 shadow-elevate backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <a href="#top" className="font-display text-3xl tracking-wide text-foreground">
            <span className="text-primary">JAY</span>
          </a>

          <nav className="hidden items-center gap-2 xl:flex" aria-label="Main">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {link}
              </a>
            ))}
            <Link
              href="/cars"
              className="rounded-full px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-2"
            >
              Marketplace
            </Link>
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <VersionSwitch current="v2" />
            <Link
              href="/my-vehicles?version=v2"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Your cars
            </Link>
            <Link
              href="/request?type=consultation&version=v2"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Get advice
            </Link>
            <Link
              href="/profile?version=v2"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Profile
            </Link>
            <Link
              href="/my-requests"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Requests
            </Link>
            <Link
              href="/admin"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin
            </Link>
            <span className="max-w-[14ch] truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
            <button
              onClick={onSignOut}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Log out
            </button>
          </div>

          <button
            className="rounded-full border border-outline px-4 py-2 text-sm font-semibold xl:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {open && (
          <div className="border-t border-border px-4 py-5 xl:hidden">
            <nav className="grid gap-2" aria-label="Mobile">
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-surface-2 px-4 py-3 text-sm font-semibold text-foreground"
                >
                  {link}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <VersionSwitch current="v2" />
              <div className="flex items-center gap-3">
                <Link
                  href="/cars"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-foreground"
                >
                  Marketplace
                </Link>
                <Link
                  href="/my-vehicles?version=v2"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-foreground"
                >
                  Your cars
                </Link>
                <Link
                  href="/request?type=consultation&version=v2"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-foreground"
                >
                  Get advice
                </Link>
                <Link
                  href="/profile?version=v2"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-foreground"
                >
                  Profile
                </Link>
                <Link
                  href="/my-requests"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-foreground"
                >
                  Requests
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-foreground"
                >
                  Admin
                </Link>
                <button
                  onClick={onSignOut}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
