"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables, TablesInsert } from "@/integrations/supabase/types";

type Car = Tables<"cars">;
type Profile = Tables<"profiles">;
type Enquiry = Tables<"car_enquiries">;
type Order = Tables<"car_orders">;
type CarImage = Tables<"car_images">;
type CarVideo = Tables<"car_videos">;
type Panel = "vehicles" | "enquiries" | "orders" | "users";

type CarForm = {
  brand: string;
  name: string;
  model: string;
  year: string;
  price: string;
  currency: string;
  mileage: string;
  transmission: string;
  fuelType: string;
  engineSpecs: string;
  exteriorDetails: string;
  interiorDetails: string;
  description: string;
  features: string;
  specifications: string;
  availability: string;
  featured: boolean;
};

const emptyCarForm: CarForm = {
  brand: "",
  name: "",
  model: "",
  year: String(new Date().getFullYear()),
  price: "",
  currency: "USD",
  mileage: "0",
  transmission: "",
  fuelType: "",
  engineSpecs: "{}",
  exteriorDetails: "",
  interiorDetails: "",
  description: "",
  features: "",
  specifications: "{}",
  availability: "available",
  featured: false,
};

const enquiryStatuses = ["Pending", "Contacted", "Completed", "Cancelled"];
const orderStatuses = [
  "Pending",
  "Under Review",
  "Contacted",
  "Approved",
  "Completed",
  "Cancelled",
];
const photoExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export default function AdminPage() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("vehicles");
  const [cars, setCars] = useState<Car[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState<CarForm>(emptyCarForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<CarImage[]>([]);
  const [existingVideos, setExistingVideos] = useState<CarVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
      if (!profile || !["Admin", "Superadmin"].includes(profile.role)) {
        setRole(profile?.role ?? null);
        setLoading(false);
        return;
      }
      setRole(profile.role);

      const [carsResult, enquiriesResult, ordersResult, profilesResult] = await Promise.all([
        supabase.from("cars").select("*").order("created_at", { ascending: false }),
        supabase.from("car_enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("car_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      const queryError =
        carsResult.error ?? enquiriesResult.error ?? ordersResult.error ?? profilesResult.error;
      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }
      setCars(carsResult.data ?? []);
      setEnquiries(enquiriesResult.data ?? []);
      setOrders(ordersResult.data ?? []);
      setProfiles(profilesResult.data ?? []);
      setLoading(false);
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [user]);

  function resetForm() {
    setForm(emptyCarForm);
    setEditingId(null);
    setPendingImages([]);
    setPendingVideo(null);
    setExistingImages([]);
    setExistingVideos([]);
  }

  function updateForm(field: keyof CarForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    setError(null);
    if (files.some((file) => !photoExtensions[file.type] || file.size > 12 * 1024 * 1024)) {
      setError("Vehicle photos must be JPG, PNG, WebP, or AVIF and no larger than 12 MB each.");
      return;
    }
    setPendingImages((current) => [...current, ...files]);
  }

  function handleVideoSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    setError(null);
    if (
      file &&
      (!["video/mp4", "video/webm"].includes(file.type) || file.size > 50 * 1024 * 1024)
    ) {
      setError("Promotional videos must be MP4 or WebM and no larger than 50 MB.");
      return;
    }
    setPendingVideo(file);
  }

  async function handleEdit(car: Car) {
    setError(null);
    setNotice(null);
    setEditingId(car.id);
    setForm({
      brand: car.brand,
      name: car.name,
      model: car.model,
      year: String(car.year),
      price: String(car.price),
      currency: car.currency,
      mileage: String(car.mileage),
      transmission: car.transmission,
      fuelType: car.fuel_type,
      engineSpecs: JSON.stringify(car.engine_specs, null, 2),
      exteriorDetails: car.exterior_details,
      interiorDetails: car.interior_details,
      description: car.description,
      features: car.features.join("\n"),
      specifications: JSON.stringify(car.specifications, null, 2),
      availability: car.availability,
      featured: car.featured,
    });

    const [imageResult, videoResult] = await Promise.all([
      supabase.from("car_images").select("*").eq("car_id", car.id).order("sort_order"),
      supabase.from("car_videos").select("*").eq("car_id", car.id).order("created_at"),
    ]);
    if (imageResult.error || videoResult.error) {
      setError(
        imageResult.error?.message ?? videoResult.error?.message ?? "Could not load vehicle media.",
      );
      return;
    }
    setExistingImages(imageResult.data);
    setExistingVideos(videoResult.data);
    document.getElementById("car-editor")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSaveCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    let engineSpecs: Json;
    let specifications: Json;
    try {
      const engineValue: unknown = JSON.parse(form.engineSpecs);
      const specificationValue: unknown = JSON.parse(form.specifications);
      if (!engineValue || Array.isArray(engineValue) || typeof engineValue !== "object") {
        setError("Engine specifications must be a JSON object.");
        return;
      }
      if (
        !specificationValue ||
        Array.isArray(specificationValue) ||
        typeof specificationValue !== "object"
      ) {
        setError("Vehicle specifications must be a JSON object.");
        return;
      }
      engineSpecs = engineValue as Json;
      specifications = specificationValue as Json;
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? `Invalid JSON: ${parseError.message}`
          : "Specifications must contain valid JSON.",
      );
      return;
    }

    if (!user) {
      setError("Your session expired. Sign in again before saving this vehicle.");
      return;
    }

    setBusy(true);
    const carId = editingId ?? crypto.randomUUID();
    const carPayload: TablesInsert<"cars"> = {
      brand: form.brand.trim(),
      name: form.name.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      price: Number(form.price),
      currency: form.currency.toUpperCase(),
      mileage: Number(form.mileage),
      transmission: form.transmission.trim(),
      fuel_type: form.fuelType.trim(),
      engine_specs: engineSpecs,
      exterior_details: form.exteriorDetails.trim(),
      interior_details: form.interiorDetails.trim(),
      description: form.description.trim(),
      features: form.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
      specifications,
      availability: form.availability,
      featured: form.featured,
      updated_at: new Date().toISOString(),
    };

    const carResult = editingId
      ? await supabase.from("cars").update(carPayload).eq("id", carId)
      : await supabase.from("cars").insert({ ...carPayload, id: carId });
    if (carResult.error) {
      setBusy(false);
      setError(carResult.error.message);
      return;
    }
    if (!editingId) setEditingId(carId);

    const uploadedImages: { path: string; altText: string; sortOrder: number }[] = [];
    const imageUploads = pendingImages.map(async (file, index) => {
      const path = `${carId}/${crypto.randomUUID()}.${photoExtensions[file.type]}`;
      const { error: uploadError } = await supabase.storage
        .from("vehicle-images")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      return {
        path,
        sortOrder: existingImages.length + index,
        type: "image" as const,
        error: uploadError,
      };
    });
    const videoUpload = pendingVideo
      ? (async () => {
          const path = `${carId}/${crypto.randomUUID()}.${pendingVideo.type === "video/mp4" ? "mp4" : "webm"}`;
          const { error: uploadError } = await supabase.storage
            .from("vehicle-videos")
            .upload(path, pendingVideo, {
              contentType: pendingVideo.type,
              cacheControl: "31536000",
              upsert: false,
            });
          return { path, sortOrder: 0, type: "video" as const, error: uploadError };
        })()
      : null;
    const uploads = await Promise.all([...imageUploads, ...(videoUpload ? [videoUpload] : [])]);

    const failedUpload = uploads.find((result) => result.error);
    if (failedUpload) {
      const paths = uploads.filter((result) => !result.error).map((result) => result.path);
      const imagePaths = uploads
        .filter((result) => !result.error && result.type === "image")
        .map((result) => result.path);
      const videoPaths = uploads
        .filter((result) => !result.error && result.type === "video")
        .map((result) => result.path);
      const cleanupResults = await Promise.all([
        ...(imagePaths.length ? [supabase.storage.from("vehicle-images").remove(imagePaths)] : []),
        ...(videoPaths.length ? [supabase.storage.from("vehicle-videos").remove(videoPaths)] : []),
      ]);
      const cleanupError = cleanupResults.find((result) => result.error)?.error;
      setBusy(false);
      setError(
        cleanupError
          ? `${failedUpload.error?.message ?? "Media upload failed."} Cleanup failed for ${paths.length} uploaded file(s): ${cleanupError.message}`
          : (failedUpload.error?.message ?? "Media upload failed."),
      );
      return;
    }

    uploadedImages.push(
      ...uploads
        .filter((result) => result.type === "image")
        .map((result) => ({
          path: result.path,
          altText: `${form.year} ${form.brand} ${form.name}`,
          sortOrder: result.sortOrder,
        })),
    );

    if (uploadedImages.length) {
      const { error: imageInsertError } = await supabase.from("car_images").insert(
        uploadedImages.map((image) => ({
          car_id: carId,
          storage_path: image.path,
          alt_text: image.altText,
          sort_order: image.sortOrder,
        })),
      );
      if (imageInsertError) {
        const paths = uploadedImages.map((image) => image.path);
        const { error: cleanupError } = await supabase.storage.from("vehicle-images").remove(paths);
        setBusy(false);
        setError(
          cleanupError
            ? `${imageInsertError.message} Uploaded images could not be removed: ${cleanupError.message}`
            : imageInsertError.message,
        );
        return;
      }
    }

    const uploadedVideo = uploads.find((result) => result.type === "video");
    if (uploadedVideo) {
      const { error: videoInsertError } = await supabase.from("car_videos").insert({
        car_id: carId,
        storage_path: uploadedVideo.path,
        title: `${form.year} ${form.brand} ${form.name} presentation`,
      });
      if (videoInsertError) {
        const { error: cleanupError } = await supabase.storage
          .from("vehicle-videos")
          .remove([uploadedVideo.path]);
        setBusy(false);
        setError(
          cleanupError
            ? `${videoInsertError.message} The uploaded video could not be removed: ${cleanupError.message}`
            : videoInsertError.message,
        );
        return;
      }
    }

    resetForm();
    await reloadCars();
    setBusy(false);
    setNotice("Vehicle listing saved.");
  }

  async function reloadCars() {
    const { data, error: queryError } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      setError(queryError.message);
      return;
    }
    setCars(data);
  }

  async function handleDeleteCar(car: Car) {
    if (!window.confirm(`Delete ${car.year} ${car.brand} ${car.name}?`)) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    const [imageResult, videoResult] = await Promise.all([
      supabase.from("car_images").select("storage_path").eq("car_id", car.id),
      supabase.from("car_videos").select("storage_path").eq("car_id", car.id),
    ]);
    if (imageResult.error || videoResult.error) {
      setBusy(false);
      setError(
        imageResult.error?.message ?? videoResult.error?.message ?? "Could not load vehicle media.",
      );
      return;
    }
    const { error: deleteError } = await supabase.from("cars").delete().eq("id", car.id);
    if (deleteError) {
      setBusy(false);
      setError(deleteError.message);
      return;
    }
    setCars((current) => current.filter((item) => item.id !== car.id));
    const [imageCleanup, videoCleanup] = await Promise.all([
      imageResult.data.length
        ? supabase.storage
            .from("vehicle-images")
            .remove(imageResult.data.map((item) => item.storage_path))
        : Promise.resolve({ error: null }),
      videoResult.data.length
        ? supabase.storage
            .from("vehicle-videos")
            .remove(videoResult.data.map((item) => item.storage_path))
        : Promise.resolve({ error: null }),
    ]);
    setBusy(false);
    if (imageCleanup.error || videoCleanup.error) {
      setError(
        `Vehicle listing deleted, but media cleanup failed: ${imageCleanup.error?.message ?? videoCleanup.error?.message}`,
      );
      return;
    }
    setNotice("Vehicle listing deleted.");
  }

  async function removeExistingMedia(kind: "image" | "video", media: CarImage | CarVideo) {
    setError(null);
    setBusy(true);
    const bucket = kind === "image" ? "vehicle-images" : "vehicle-videos";
    const table = kind === "image" ? "car_images" : "car_videos";
    const { error: rowError } = await supabase.from(table).delete().eq("id", media.id);
    if (rowError) {
      setBusy(false);
      setError(rowError.message);
      return;
    }
    if (kind === "image")
      setExistingImages((items) => items.filter((item) => item.id !== media.id));
    else setExistingVideos((items) => items.filter((item) => item.id !== media.id));
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([media.storage_path]);
    setBusy(false);
    if (storageError) {
      setError(
        `Media record removed, but the stored file could not be deleted: ${storageError.message}`,
      );
      return;
    }
    setNotice("Vehicle media removed.");
  }

  async function updateStatus(kind: "enquiry" | "order", id: string, status: string) {
    setError(null);
    const table = kind === "enquiry" ? "car_enquiries" : "car_orders";
    const { error: updateError } = await supabase.from(table).update({ status }).eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (kind === "enquiry")
      setEnquiries((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    else setOrders((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  async function updateProfileRole(profile: Profile, targetRole: string) {
    setError(null);
    setNotice(null);
    const { error: roleError } = await supabase.rpc("set_profile_role", {
      target_user_id: profile.id,
      target_role: targetRole,
    });
    if (roleError) {
      setError(roleError.message);
      return;
    }
    setProfiles((items) =>
      items.map((item) => (item.id === profile.id ? { ...item, role: targetRole } : item)),
    );
    setNotice(`Updated ${profile.email ?? "user"} to ${targetRole}.`);
  }

  if (loading) {
    return (
      <main className="theme-v1 min-h-screen bg-background p-8 text-foreground" role="status">
        Loading dashboard…
      </main>
    );
  }
  if (!role || !["Admin", "Superadmin"].includes(role)) {
    return (
      <main className="theme-v1 min-h-screen bg-background px-5 py-16 text-foreground">
        <div className="mx-auto max-w-xl border border-border bg-surface p-8">
          <h1 className="text-3xl">Admin access required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {error ?? "Your account does not have permission to manage the marketplace."}
          </p>
          <Link href="/v1" className="mt-6 inline-block text-sm text-brand">
            Back to JAY
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-enter theme-v1 min-h-screen bg-background px-5 py-10 text-foreground sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/v1" className="font-display text-2xl tracking-[0.3em]">
            JAY
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest text-brand">{role}</span>
            <Link
              href="/cars"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-brand"
            >
              Marketplace
            </Link>
          </div>
        </div>
        <header className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand">Operations</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Admin dashboard</h1>
        </header>

        <nav
          className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4"
          aria-label="Admin sections"
        >
          {(["vehicles", "enquiries", "orders", "users"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPanel(item)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest ${panel === item ? "bg-brand text-brand-foreground" : "border border-outline text-muted-foreground hover:text-foreground"}`}
            >
              {item}
            </button>
          ))}
        </nav>

        {error && (
          <p role="alert" className="mt-5 text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-5 text-sm text-brand">
            {notice}
          </p>
        )}

        {panel === "vehicles" && (
          <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <section>
              <h2 className="text-2xl">Vehicle listings</h2>
              <div className="mt-4 space-y-3">
                {cars.map((car) => (
                  <article
                    key={car.id}
                    className="border border-border bg-surface p-5 sm:flex sm:items-center sm:justify-between sm:gap-5"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-brand">
                        {car.brand} · {car.availability}
                        {car.featured ? " · Featured" : ""}
                      </p>
                      <h3 className="mt-2 text-xl">
                        {car.year} {car.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {car.model} ·{" "}
                        {new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: car.currency,
                          maximumFractionDigits: 0,
                        }).format(car.price)}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => void handleEdit(car)}
                        className="border border-outline px-3 py-2 text-xs uppercase tracking-widest hover:border-brand"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleDeleteCar(car)}
                        className="border border-outline px-3 py-2 text-xs uppercase tracking-widest text-destructive hover:border-destructive disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
                {cars.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No listings yet. Add the first vehicle.
                  </p>
                )}
              </div>
            </section>

            <section id="car-editor" className="border border-border bg-surface p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl">{editingId ? "Edit vehicle" : "Add a vehicle"}</h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-brand"
                  >
                    New listing
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveCar} className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Brand"
                    value={form.brand}
                    required
                    onChange={(value) => updateForm("brand", value)}
                  />
                  <Field
                    label="Name"
                    value={form.name}
                    required
                    onChange={(value) => updateForm("name", value)}
                  />
                  <Field
                    label="Model"
                    value={form.model}
                    required
                    onChange={(value) => updateForm("model", value)}
                  />
                  <Field
                    label="Year"
                    type="number"
                    min="1886"
                    max="2100"
                    value={form.year}
                    required
                    onChange={(value) => updateForm("year", value)}
                  />
                  <Field
                    label="Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    required
                    onChange={(value) => updateForm("price", value)}
                  />
                  <Field
                    label="Currency (ISO)"
                    maxLength={3}
                    value={form.currency}
                    required
                    onChange={(value) => updateForm("currency", value)}
                  />
                  <Field
                    label="Mileage"
                    type="number"
                    min="0"
                    value={form.mileage}
                    required
                    onChange={(value) => updateForm("mileage", value)}
                  />
                  <Field
                    label="Transmission"
                    value={form.transmission}
                    required
                    onChange={(value) => updateForm("transmission", value)}
                  />
                  <Field
                    label="Fuel type"
                    value={form.fuelType}
                    required
                    onChange={(value) => updateForm("fuelType", value)}
                  />
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                    Availability
                    <select
                      value={form.availability}
                      onChange={(event) => updateForm("availability", event.target.value)}
                      className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm text-foreground"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </label>
                </div>
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) => updateForm("featured", event.target.checked)}
                  />
                  Feature this vehicle
                </label>
                <TextField
                  label="Description"
                  value={form.description}
                  rows={4}
                  onChange={(value) => updateForm("description", value)}
                />
                <TextField
                  label="Exterior details"
                  value={form.exteriorDetails}
                  rows={2}
                  onChange={(value) => updateForm("exteriorDetails", value)}
                />
                <TextField
                  label="Interior details"
                  value={form.interiorDetails}
                  rows={2}
                  onChange={(value) => updateForm("interiorDetails", value)}
                />
                <TextField
                  label="Features (one per line)"
                  value={form.features}
                  rows={3}
                  onChange={(value) => updateForm("features", value)}
                />
                <TextField
                  label="Engine specifications (JSON object)"
                  value={form.engineSpecs}
                  rows={3}
                  onChange={(value) => updateForm("engineSpecs", value)}
                />
                <TextField
                  label="Specifications (JSON object)"
                  value={form.specifications}
                  rows={3}
                  onChange={(value) => updateForm("specifications", value)}
                />

                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                    Add photographs
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    onChange={handlePhotoSelection}
                    className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-brand-foreground"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pendingImages.length} new image(s) selected; up to 12 MB each.
                  </p>
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      className="mt-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <a
                        href={
                          supabase.storage.from("vehicle-images").getPublicUrl(image.storage_path)
                            .data.publicUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-brand"
                      >
                        {image.storage_path}
                      </a>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeExistingMedia("image", image)}
                        className="text-destructive disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                    Promotional video (MP4/WebM)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoSelection}
                    className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-brand-foreground"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pendingVideo?.name ?? "No new video selected"}; maximum 50 MB.
                  </p>
                  {existingVideos.map((video) => (
                    <div
                      key={video.id}
                      className="mt-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <a
                        href={
                          supabase.storage.from("vehicle-videos").getPublicUrl(video.storage_path)
                            .data.publicUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-brand"
                      >
                        {video.title || video.storage_path}
                      </a>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeExistingMedia("video", video)}
                        className="text-destructive disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-11 bg-brand px-5 text-xs font-semibold uppercase tracking-widest text-brand-foreground disabled:opacity-60"
                  >
                    {busy ? "Saving…" : editingId ? "Save changes" : "Add vehicle"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="h-11 border border-outline px-5 text-xs uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          </div>
        )}

        {panel === "enquiries" && (
          <section className="mt-8">
            <h2 className="text-2xl">Customer enquiries</h2>
            <div className="mt-4 space-y-3">
              {enquiries.map((item) => (
                <article key={item.id} className="border border-border bg-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-brand">
                        {item.subject} · {item.car_name}
                      </p>
                      <h3 className="mt-2 text-xl">{item.customer_name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.email} · {item.phone}
                      </p>
                      <p className="mt-3 text-sm">{item.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusSelect
                      value={item.status}
                      statuses={enquiryStatuses}
                      onChange={(status) => void updateStatus("enquiry", item.id, status)}
                    />
                  </div>
                </article>
              ))}
              {enquiries.length === 0 && (
                <p className="text-sm text-muted-foreground">No enquiries received.</p>
              )}
            </div>
          </section>
        )}

        {panel === "orders" && (
          <section className="mt-8">
            <h2 className="text-2xl">Vehicle order requests</h2>
            <div className="mt-4 space-y-3">
              {orders.map((item) => (
                <article key={item.id} className="border border-border bg-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-brand">
                        {item.order_reference} · {item.car_name}
                      </p>
                      <h3 className="mt-2 text-xl">{item.customer_name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.email} · {item.phone}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.city}, {item.country} · {item.fulfilment}
                      </p>
                      {item.additional_information && (
                        <p className="mt-3 text-sm">{item.additional_information}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusSelect
                      value={item.status}
                      statuses={orderStatuses}
                      onChange={(status) => void updateStatus("order", item.id, status)}
                    />
                  </div>
                </article>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-muted-foreground">No order requests received.</p>
              )}
            </div>
          </section>
        )}

        {panel === "users" && (
          <section className="mt-8">
            <h2 className="text-2xl">Registered users</h2>
            {role !== "Superadmin" && (
              <p className="mt-2 text-sm text-muted-foreground">
                Only superadmins can change account roles.
              </p>
            )}
            <div className="mt-4 space-y-2">
              {profiles.map((profile) => (
                <article
                  key={profile.id}
                  className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface p-4"
                >
                  <div>
                    <p className="font-medium">{profile.full_name || "JAY member"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile.email ?? "No email recorded"}
                    </p>
                  </div>
                  {role === "Superadmin" ? (
                    <select
                      value={profile.role}
                      onChange={(event) => void updateProfileRole(profile, event.target.value)}
                      className="h-10 border border-input bg-background px-3 text-sm"
                    >
                      <option>Member</option>
                      <option>Admin</option>
                      <option>Superadmin</option>
                    </select>
                  ) : (
                    <span className="text-xs uppercase tracking-widest text-brand">
                      {profile.role}
                    </span>
                  )}
                </article>
              ))}
              {profiles.length === 0 && (
                <p className="text-sm text-muted-foreground">No profiles found.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
  maxLength,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  maxLength?: number;
  step?: string;
}) {
  return (
    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
      {label}
      <input
        type={type}
        required={required}
        min={min}
        max={max}
        maxLength={maxLength}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm text-foreground"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
      {label}
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
    </label>
  );
}

function StatusSelect({
  value,
  statuses,
  onChange,
}: {
  value: string;
  statuses: string[];
  onChange: (status: string) => void;
}) {
  return (
    <label className="text-xs uppercase tracking-widest text-muted-foreground">
      Status
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 border border-input bg-background px-3 text-sm text-foreground"
      >
        {statuses.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
    </label>
  );
}
