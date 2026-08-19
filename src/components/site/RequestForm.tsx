import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, LocateFixed, MapPin, MessageCircle, Phone, Upload, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { telHref, whatsappHref } from "@/lib/business";
import { services, type ServiceValue } from "@/lib/services";

const MAX_PHOTOS = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  service: z.enum(["Electrical", "Plumbing", "Carpenter", "RO / Water Filter", "Cleaning"]),
  problem_description: z
    .string()
    .trim()
    .min(5, "Please describe the problem")
    .max(2000, "Please keep the description under 2000 characters"),
  full_address: z.string().trim().min(5, "Please enter your full address").max(500),
  area: z.string().trim().max(120).optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
});

type Result = {
  request_number: string;
  full_name: string;
  service: string;
  mobile: string;
};

export function RequestForm({ initialService }: { initialService?: ServiceValue | undefined }) {
  const [service, setService] = useState<ServiceValue>(initialService ?? "Electrical");
  const [photos, setPhotos] = useState<File[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const next: File[] = [...photos];
    let error = "";
    for (const file of incoming) {
      if (next.length >= MAX_PHOTOS) {
        error = `You can upload a maximum of ${MAX_PHOTOS} photos.`;
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        error = "Only JPG, PNG, WEBP or HEIC images are allowed.";
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        error = "Each photo must be smaller than 5 MB.";
        continue;
      }
      next.push(file);
    }
    setPhotos(next);
    setErrors((e) => ({ ...e, photos: error }));
  }

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setErrors((e) => ({ ...e, location: "Location is not supported on this device." }));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setErrors((e) => ({ ...e, location: "" }));
        setLocating(false);
      },
      () => {
        setErrors((e) => ({
          ...e,
          location: "Could not get your location. You can type the address instead.",
        }));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const fd = new FormData(event.currentTarget);
    const values = {
      full_name: String(fd.get("full_name") ?? ""),
      mobile: String(fd.get("mobile") ?? "").replace(/\s|-/g, ""),
      service,
      problem_description: String(fd.get("problem_description") ?? ""),
      full_address: String(fd.get("full_address") ?? ""),
      area: String(fd.get("area") ?? ""),
      preferred_date: String(fd.get("preferred_date") ?? ""),
      preferred_time: String(fd.get("preferred_time") ?? ""),
    };

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const photoPaths: string[] = [];
      const folder = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      for (const [index, file] of photos.entries()) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${folder}/${index + 1}.${ext}`;
        const { error } = await supabase.storage.from("request-photos").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (error) throw error;
        photoPaths.push(path);
      }

      const { data, error } = await supabase.rpc("submit_service_request", {
        p_full_name: parsed.data.full_name,
        p_mobile: parsed.data.mobile,
        p_service: parsed.data.service,
        p_problem_description: parsed.data.problem_description,
        p_full_address: parsed.data.full_address,
        p_photo_paths: photoPaths,
        ...(parsed.data.area ? { p_area: parsed.data.area } : {}),
        ...(coords ? { p_latitude: coords.lat, p_longitude: coords.lng } : {}),
        ...(parsed.data.preferred_date ? { p_preferred_date: parsed.data.preferred_date } : {}),
        ...(parsed.data.preferred_time ? { p_preferred_time: parsed.data.preferred_time } : {}),
      });


      if (error) throw error;
      setResult({
        request_number: data as string,
        full_name: parsed.data.full_name,
        service: parsed.data.service,
        mobile: parsed.data.mobile,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError(
        "Sorry, we could not submit your request. Please try again, or call / WhatsApp us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <SuccessCard result={result} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <fieldset className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <legend className="px-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
          Your details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" error={errors["full_name"]} htmlFor="full_name">
            <Input id="full_name" name="full_name" autoComplete="name" placeholder="e.g. Rahul Deshmukh" required />
          </Field>
          <Field label="Mobile Number" error={errors["mobile"]} htmlFor="mobile">
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              placeholder="10-digit mobile number"
              required
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <legend className="px-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
          Service needed
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <button
              type="button"
              key={s.value}
              onClick={() => setService(s.value)}
              aria-pressed={service === s.value}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                service === s.value
                  ? "border-primary bg-secondary"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  service === s.value ? "border-primary bg-primary" : "border-muted-foreground/40"
                }`}
              >
                {service === s.value && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{s.value}</span>
                <span className="block text-xs text-muted-foreground">{s.short}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5">
          <Field
            label="Please describe your problem"
            error={errors["problem_description"]}
            htmlFor="problem_description"
          >
            <Textarea
              id="problem_description"
              name="problem_description"
              rows={4}
              maxLength={2000}
              placeholder="Example: Kitchen tap is leaking and needs repair."
              required
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <legend className="px-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
          Address
        </legend>
        <div className="space-y-4">
          <Field label="Full Address" error={errors["full_address"]} htmlFor="full_address">
            <Textarea
              id="full_address"
              name="full_address"
              rows={3}
              placeholder="House / flat no., building, street, landmark"
              autoComplete="street-address"
              required
            />
          </Field>
          <Field label="Area / Locality" error={errors["area"]} htmlFor="area">
            <Input id="area" name="area" placeholder="e.g. Manish Nagar" />
          </Field>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-medium text-foreground">Location (optional)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sharing your location helps our technician find your home faster.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={useCurrentLocation} disabled={locating}>
                {locating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
                Use current location
              </Button>
              <Button type="button" variant="ghost" asChild>
                <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                  <MapPin /> Open Google Maps
                </a>
              </Button>
            </div>
            {coords && (
              <p className="mt-3 text-xs font-medium text-whatsapp">
                Location captured ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)})
              </p>
            )}
            {errors["location"] && (
              <p className="mt-3 text-xs text-destructive">{errors["location"]}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <legend className="px-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
          Preferred visit
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preferred Date" htmlFor="preferred_date">
            <Input id="preferred_date" name="preferred_date" type="date" />
          </Field>
          <Field label="Preferred Time" htmlFor="preferred_time">
            <Input id="preferred_time" name="preferred_time" type="time" />
          </Field>
        </div>
        <p className="mt-4 rounded-lg bg-accent/15 p-3 text-sm text-foreground">
          Your preferred time is a request only. Our team will call you to confirm the visit.
        </p>
      </fieldset>

      <fieldset className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <legend className="px-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
          Photos (optional)
        </legend>
        <p className="text-sm text-muted-foreground">
          Add up to {MAX_PHOTOS} photos of the problem — for example a broken switch, leaking pipe,
          damaged furniture or your RO unit. Max 5 MB each.
        </p>
        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-6 text-sm font-medium text-foreground">
          <Upload className="h-4 w-4 text-primary" />
          Choose photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            className="hidden"
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {errors["photos"] && <p className="mt-2 text-xs text-destructive">{errors["photos"]}</p>}
        {photos.length > 0 && (
          <ul className="mt-4 space-y-2">
            {photos.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setPhotos(photos.filter((_, index) => index !== i))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {formError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" variant="accent" size="xl" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="animate-spin" />}
        {submitting ? "Submitting…" : "Submit Service Request"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        No account needed. We only use your details to contact you about this request.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string | undefined;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SuccessCard({ result }: { result: Result }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)] sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp/15">
        <CheckCircle2 className="h-7 w-7 text-whatsapp" />
      </span>
      <h2 className="mt-5 text-2xl">Request Received!</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Thank you. We have received your service request. Our team will call you shortly to confirm
        the details and service time.
      </p>

      <dl className="mx-auto mt-6 grid max-w-md gap-px overflow-hidden rounded-xl border border-border bg-border text-left text-sm">
        <Row label="Request ID" value={result.request_number} />
        <Row label="Name" value={result.full_name} />
        <Row label="Service" value={result.service} />
        <Row label="Phone" value={result.mobile} />
      </dl>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button size="lg" asChild>
          <a href={telHref}>
            <Phone /> Call Us
          </a>
        </Button>
        <Button variant="whatsapp" size="lg" asChild>
          <a
            href={whatsappHref(`Hi, I submitted service request ${result.request_number}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle /> WhatsApp Us
          </a>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-card px-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}
