"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const vehiclePhotoBucket = "vehicle-submissions";
const maxPhotos = 6;
const maxPhotoSize = 8 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
const fileExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type VehicleSubmission = Tables<"customer_vehicle_submissions"> & {
  imageUrls: string[];
};

export default function MyVehiclesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const version = searchParams.get("version") === "v2" ? "v2" : "v1";
  const showroomPath = version === "v2" ? "/v2" : "/v1";
  const fileInput = useRef<HTMLInputElement>(null);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<VehicleSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from("customer_vehicle_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setLoading(false);
      setError(queryError.message);
      return;
    }

    const nextSubmissions: VehicleSubmission[] = [];
    for (const submission of data) {
      const imageUrls: string[] = [];
      for (const path of submission.image_paths) {
        const { data: signedUrl, error: signedUrlError } = await supabase.storage
          .from(vehiclePhotoBucket)
          .createSignedUrl(path, 60 * 60);
        if (signedUrlError) {
          setLoading(false);
          setError(signedUrlError.message);
          return;
        }
        imageUrls.push(signedUrl.signedUrl);
      }
      nextSubmissions.push({ ...submission, imageUrls });
    }

    setSubmissions(nextSubmissions);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    const urls = photos.map((photo) => URL.createObjectURL(photo));
    setPhotoPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedPhotos = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    setError(null);
    setNotice(null);

    if (selectedPhotos.length > maxPhotos) {
      setError(`Choose no more than ${maxPhotos} photos.`);
      return;
    }
    const invalidType = selectedPhotos.find((photo) => !allowedPhotoTypes.includes(photo.type));
    if (invalidType) {
      setError("Photos must be JPG, PNG, or WebP images.");
      return;
    }
    if (selectedPhotos.some((photo) => photo.size > maxPhotoSize)) {
      setError("Each photo must be 8 MB or smaller.");
      return;
    }

    setPhotos(selectedPhotos);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!user) {
      setError("Please sign in again before submitting your vehicle.");
      return;
    }
    if (photos.length === 0) {
      setError("Add at least one photo of your vehicle.");
      return;
    }

    setBusy(true);
    const submissionId = crypto.randomUUID();
    const uploadResults = await Promise.all(
      photos.map(async (photo) => {
        const path = `${user.id}/${submissionId}/${crypto.randomUUID()}.${fileExtensions[photo.type]}`;
        const { error: uploadError } = await supabase.storage
          .from(vehiclePhotoBucket)
          .upload(path, photo, { contentType: photo.type, upsert: false });
        return { path, error: uploadError };
      }),
    );

    const failedUpload = uploadResults.find((result) => result.error);
    if (failedUpload?.error) {
      const uploadedPaths = uploadResults
        .filter((result) => !result.error)
        .map((result) => result.path);
      let cleanupError: string | null = null;
      if (uploadedPaths.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(vehiclePhotoBucket)
          .remove(uploadedPaths);
        cleanupError = removeError?.message ?? null;
      }
      setBusy(false);
      setError(
        cleanupError
          ? `${failedUpload.error.message} Some uploaded photos could not be removed: ${cleanupError}`
          : failedUpload.error.message,
      );
      return;
    }

    const imagePaths = uploadResults.map((result) => result.path);
    const { error: insertError } = await supabase.from("customer_vehicle_submissions").insert({
      id: submissionId,
      user_id: user.id,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      notes: notes.trim() || null,
      image_paths: imagePaths,
    });

    if (insertError) {
      const { error: removeError } = await supabase.storage
        .from(vehiclePhotoBucket)
        .remove(imagePaths);
      setBusy(false);
      setError(
        removeError
          ? `${insertError.message} Uploaded photos could not be removed: ${removeError.message}`
          : insertError.message,
      );
      return;
    }

    setPhotos([]);
    setMake("");
    setModel("");
    setYear(String(new Date().getFullYear()));
    setNotes("");
    if (fileInput.current) fileInput.current.value = "";
    await loadSubmissions();
    setBusy(false);
    setNotice("Your vehicle and photos have been submitted for review.");
  }

  return (
    <main
      className={`${version === "v2" ? "theme-v2" : "theme-v1"} min-h-screen bg-background px-5 py-12 text-foreground sm:py-16`}
    >
      <div className="mx-auto max-w-5xl">
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

        <header className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand">Your garage</p>
          <h1 className="mt-3 text-4xl text-foreground sm:text-5xl">Submit a vehicle</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Share a few details and photos with the JAY team. Your submission stays private to your
            account while it is reviewed; it will not appear in the public showroom.
          </p>
        </header>

        <section className="mt-8 border border-border bg-surface p-6 shadow-elevate sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="vehicle-make"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Make
                </label>
                <input
                  id="vehicle-make"
                  type="text"
                  required
                  maxLength={80}
                  value={make}
                  onChange={(event) => setMake(event.target.value)}
                  className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="vehicle-model"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Model
                </label>
                <input
                  id="vehicle-model"
                  type="text"
                  required
                  maxLength={80}
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="vehicle-year"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Year
                </label>
                <input
                  id="vehicle-year"
                  type="number"
                  required
                  min={1886}
                  max={2100}
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="vehicle-photos"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Vehicle photos
              </label>
              <input
                ref={fileInput}
                id="vehicle-photos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoSelection}
                className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:border-0 file:bg-brand file:px-4 file:py-3 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-brand-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Add 1–{maxPhotos} JPG, PNG, or WebP photos, up to 8 MB each.
              </p>
              {photoPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photoPreviews.map((preview, index) => (
                    <img
                      key={preview}
                      src={preview}
                      alt={`Selected vehicle photo ${index + 1}`}
                      className="h-36 w-full object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="vehicle-notes"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Additional details
              </label>
              <textarea
                id="vehicle-notes"
                rows={4}
                maxLength={2000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Condition, mileage, or anything else you'd like us to know."
                className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
              {busy ? "Uploading…" : "Submit for review"}
            </button>
          </form>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl text-foreground">Your submissions</h2>
          {loading && <p className="mt-5 text-sm text-muted-foreground">Loading your vehicles…</p>}
          {!loading && !error && submissions.length === 0 && (
            <p className="mt-5 text-sm text-muted-foreground">
              You haven’t submitted any vehicles yet.
            </p>
          )}
          {submissions.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {submissions.map((submission) => (
                <article
                  key={submission.id}
                  className="overflow-hidden border border-border bg-surface"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {submission.imageUrls.map((imageUrl, index) => (
                      <img
                        key={imageUrl}
                        src={imageUrl}
                        alt={`${submission.year} ${submission.make} ${submission.model}, photo ${index + 1}`}
                        loading="lazy"
                        className="h-36 w-full object-cover"
                      />
                    ))}
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-widest text-brand">
                      {submission.status === "pending" ? "Pending review" : submission.status}
                    </p>
                    <h3 className="mt-2 text-xl text-foreground">
                      {submission.year} {submission.make} {submission.model}
                    </h3>
                    {submission.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{submission.notes}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
