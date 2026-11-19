"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const avatarBucket = "avatars";
const maxAvatarSize = 3 * 1024 * 1024;
const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];

export default function ProfilePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const version = searchParams.get("version") === "v2" ? "v2" : "v1";
  const showroomPath = version === "v2" ? "/v2" : "/v1";
  const fileInput = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const metadata: Record<string, unknown> = user?.user_metadata ?? {};

    setFullName(typeof metadata["full_name"] === "string" ? metadata["full_name"] : "");
    setPhone(typeof metadata["phone"] === "string" ? metadata["phone"] : "");
    setAvatarUrl(typeof metadata["avatar_url"] === "string" ? metadata["avatar_url"] : null);

    const avatarPath = metadata["avatar_path"];
    if (typeof avatarPath === "string") {
      void supabase.storage
        .from(avatarBucket)
        .createSignedUrl(avatarPath, 60 * 60)
        .then(({ data, error: signedUrlError }) => {
          if (cancelled) return;
          if (signedUrlError) {
            setError(signedUrlError.message);
            return;
          }
          setAvatarUrl(data.signedUrl);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user?.user_metadata,
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
    });

    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice("Your profile has been updated.");
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || !user) return;

    setError(null);
    setNotice(null);
    if (!allowedAvatarTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      input.value = "";
      return;
    }
    if (file.size > maxAvatarSize) {
      setError("Profile photos must be 3 MB or smaller.");
      input.value = "";
      return;
    }

    setBusy(true);
    const avatarPath = `${user.id}/profile`;
    const { error: uploadError } = await supabase.storage
      .from(avatarBucket)
      .upload(avatarPath, file, { cacheControl: "3600", contentType: file.type, upsert: true });

    if (uploadError) {
      setBusy(false);
      setError(uploadError.message);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(avatarBucket)
      .createSignedUrl(avatarPath, 60 * 60);
    if (signedUrlError) {
      setBusy(false);
      setError(signedUrlError.message);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, avatar_path: avatarPath },
    });

    setBusy(false);
    if (fileInput.current) fileInput.current.value = "";
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setAvatarUrl(signedUrlData.signedUrl);
    setNotice("Your profile photo has been updated.");
  }

  const displayName = fullName.trim() || user?.email || "JAY member";

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
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand">Account</p>
          <h1 className="mt-3 text-4xl text-foreground">Your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep your contact details up to date for enquiries and consultations.
          </p>

          <div className="mt-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName}'s profile`}
                className="h-24 w-24 rounded-full border border-outline object-cover"
              />
            ) : (
              <div
                aria-label="No profile photo"
                className="flex h-24 w-24 items-center justify-center rounded-full border border-outline bg-surface-2 font-display text-3xl text-brand"
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">{displayName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="sr-only"
                aria-label="Choose a profile photo"
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={busy}
                className="mt-4 border border-outline px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
              >
                {busy ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, or WebP up to 3 MB.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="full-name"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Full name
              </label>
              <input
                id="full-name"
                type="text"
                autoComplete="name"
                maxLength={100}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="profile-email"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="mt-2 h-12 w-full border border-input bg-surface-2 px-4 text-sm text-muted-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Email changes are managed through your sign-in provider.
              </p>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
