import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Loader2, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/components/admin/auth";
import {
  useCreateRoBrand,
  useDeleteRoBrand,
  useRoBrandsAdmin,
  useUpdateRoBrand,
  type RoBrand,
} from "@/components/admin/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/ro-brands")({
  head: () => ({
    meta: [{ title: "RO Brands — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: RoBrandsAdmin,
});

const MAX_FEATURES = 8;

function RoBrandsAdmin() {
  const { isStaff, isAdmin } = useAdminAuth();
  const query = useRoBrandsAdmin(isStaff);
  const create = useCreateRoBrand();

  const [newName, setNewName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const brands = query.data ?? [];
  const nextSort = (brands.at(-1)?.sort_order ?? 0) + 10;

  function onAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);
    const name = newName.trim();
    if (!name) {
      setAddError("Please enter the brand name.");
      return;
    }
    if (brands.some((row) => row.name.toLowerCase() === name.toLowerCase())) {
      setAddError("This brand is already on the list.");
      return;
    }
    create.mutate(
      {
        name,
        tagline: newTagline.trim() || undefined,
        sortOrder: nextSort,
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewTagline("");
        },
        onError: () => setAddError("Could not add this brand. Please try again."),
      },
    );
  }

  return (
    <AdminShell
      title="RO Brands"
      description="Water purifier brands shown on the New RO Installation page. Add a brand here with the basics, then expand each row to add features, price, stages, warranty and an image URL."
      actions={
        <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      }
    >
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base">Add a new brand</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Only name is required. You can add the tagline, description, features, image, stages,
          warranty and starting price by expanding the brand row below.
        </p>
        <form onSubmit={onAdd} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div>
            <Label
              htmlFor="new-name"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Brand name
            </Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="e.g. Kent"
              maxLength={80}
              autoComplete="off"
            />
          </div>
          <div>
            <Label
              htmlFor="new-tagline"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Tagline (optional)
            </Label>
            <Input
              id="new-tagline"
              value={newTagline}
              onChange={(event) => setNewTagline(event.target.value)}
              placeholder="e.g. Multi-stage RO for larger homes"
              maxLength={160}
              autoComplete="off"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />} Add
            </Button>
          </div>
        </form>
        {addError && <p className="mt-3 text-sm text-destructive">{addError}</p>}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base">All brands</h2>
          <p className="text-xs text-muted-foreground">
            {brands.filter((row) => row.is_active).length} active · {brands.length} total
          </p>
        </div>

        {query.isPending ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading brands…</p>
        ) : query.isError ? (
          <p className="m-5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Could not load the brands. Please refresh, and check that your account still has admin
            access.
          </p>
        ) : brands.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No brands yet. Add the first one above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {brands.map((brand) => (
              <BrandRow key={brand.id} brand={brand} isAdmin={isAdmin} />
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

function BrandRow({ brand, isAdmin }: { brand: RoBrand; isAdmin: boolean }) {
  const update = useUpdateRoBrand();
  const remove = useDeleteRoBrand();

  const [name, setName] = useState(brand.name);
  const [tagline, setTagline] = useState(brand.tagline ?? "");
  const [description, setDescription] = useState(brand.description ?? "");
  const [imageUrl, setImageUrl] = useState(brand.image_url ?? "");
  const [features, setFeatures] = useState<string[]>(brand.features ?? []);
  const [newFeature, setNewFeature] = useState("");
  const [stages, setStages] = useState(brand.stages == null ? "" : String(brand.stages));
  const [warranty, setWarranty] = useState(
    brand.warranty_months == null ? "" : String(brand.warranty_months),
  );
  const [price, setPrice] = useState(
    brand.starting_price_inr == null ? "" : String(brand.starting_price_inr),
  );
  const [sort, setSort] = useState(String(brand.sort_order));
  const [rowError, setRowError] = useState<string | null>(null);

  const dirty = useMemo(() => {
    const sameFeatures =
      features.length === (brand.features?.length ?? 0) &&
      features.every((entry, index) => entry === brand.features?.[index]);
    return (
      name.trim() !== brand.name ||
      (tagline.trim() || null) !== brand.tagline ||
      (description.trim() || null) !== brand.description ||
      (imageUrl.trim() || null) !== brand.image_url ||
      !sameFeatures ||
      parsedNullableInt(stages) !== brand.stages ||
      parsedNullableInt(warranty) !== brand.warranty_months ||
      parsedNullableInt(price) !== brand.starting_price_inr ||
      Number(sort) !== brand.sort_order
    );
  }, [name, tagline, description, imageUrl, features, stages, warranty, price, sort, brand]);

  function addFeature() {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    if (features.length >= MAX_FEATURES) {
      setRowError(`You can list up to ${MAX_FEATURES} features.`);
      return;
    }
    if (features.some((entry) => entry.toLowerCase() === trimmed.toLowerCase())) {
      setNewFeature("");
      return;
    }
    setFeatures([...features, trimmed]);
    setNewFeature("");
    setRowError(null);
  }

  function removeFeature(index: number) {
    setFeatures(features.filter((_, i) => i !== index));
  }

  function onSave() {
    const trimmed = name.trim();
    const parsedSort = Number.parseInt(sort, 10);
    if (!trimmed) {
      setRowError("Name cannot be empty.");
      return;
    }
    if (Number.isNaN(parsedSort)) {
      setRowError("Sort order must be a number.");
      return;
    }
    setRowError(null);
    update.mutate(
      {
        id: brand.id,
        patch: {
          name: trimmed,
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          features,
          stages: parsedNullableInt(stages),
          warranty_months: parsedNullableInt(warranty),
          starting_price_inr: parsedNullableInt(price),
          sort_order: parsedSort,
        },
      },
      {
        onError: () =>
          setRowError("Could not save. Check the values — name and image URL must be unique."),
      },
    );
  }

  function onToggleActive() {
    setRowError(null);
    update.mutate(
      { id: brand.id, patch: { is_active: !brand.is_active } },
      { onError: () => setRowError("Could not change the visibility.") },
    );
  }

  function onDelete() {
    if (!window.confirm(`Delete "${brand.name}"? This cannot be undone.`)) return;
    setRowError(null);
    remove.mutate(brand.id, {
      onError: () => setRowError("Could not delete this brand."),
    });
  }

  const pending = update.isPending || remove.isPending;

  return (
    <li className={brand.is_active ? "space-y-4 px-5 py-5" : "space-y-4 bg-surface/60 px-5 py-5"}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem]">
        <Field label="Name" htmlFor={`name-${brand.id}`}>
          <Input
            id={`name-${brand.id}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
          />
        </Field>
        <Field label="Tagline" htmlFor={`tagline-${brand.id}`}>
          <Input
            id={`tagline-${brand.id}`}
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            maxLength={160}
            placeholder="Optional one-liner shown under the name"
          />
        </Field>
        <Field label="Sort" htmlFor={`sort-${brand.id}`}>
          <Input
            id={`sort-${brand.id}`}
            type="number"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            inputMode="numeric"
          />
        </Field>
      </div>

      <Field label="Image URL" htmlFor={`image-${brand.id}`}>
        <Input
          id={`image-${brand.id}`}
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          maxLength={500}
          placeholder="https://…  (leave blank to show the styled placeholder)"
        />
      </Field>

      <Field label="Description" htmlFor={`description-${brand.id}`}>
        <Textarea
          id={`description-${brand.id}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          maxLength={600}
          placeholder="A short paragraph the customer sees on the brand card."
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Purification stages" htmlFor={`stages-${brand.id}`}>
          <Input
            id={`stages-${brand.id}`}
            type="number"
            min={1}
            max={20}
            value={stages}
            onChange={(event) => setStages(event.target.value)}
            inputMode="numeric"
            placeholder="e.g. 7"
          />
        </Field>
        <Field label="Warranty (months)" htmlFor={`warranty-${brand.id}`}>
          <Input
            id={`warranty-${brand.id}`}
            type="number"
            min={0}
            max={240}
            value={warranty}
            onChange={(event) => setWarranty(event.target.value)}
            inputMode="numeric"
            placeholder="e.g. 12"
          />
        </Field>
        <Field label="Starting price (₹)" htmlFor={`price-${brand.id}`}>
          <Input
            id={`price-${brand.id}`}
            type="number"
            min={0}
            step={100}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="numeric"
            placeholder="e.g. 9000"
          />
        </Field>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Features ({features.length}/{MAX_FEATURES}) — shown as chips on the card
        </p>
        <ul className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <li
              key={`${feature}-${index}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground"
            >
              {feature}
              <button
                type="button"
                aria-label={`Remove ${feature}`}
                onClick={() => removeFeature(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
        {features.length < MAX_FEATURES && (
          <div className="mt-3 flex gap-2">
            <Input
              value={newFeature}
              onChange={(event) => setNewFeature(event.target.value)}
              placeholder="e.g. 10 L detachable tank"
              maxLength={60}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addFeature();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addFeature}>
              <Plus /> Add
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onSave} disabled={!dirty || pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Check />} Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleActive}
          disabled={pending}
          title={brand.is_active ? "Hide from public site" : "Show on public site"}
        >
          {brand.is_active ? <EyeOff /> : <Eye />}
          {brand.is_active ? "Deactivate" : "Activate"}
        </Button>
        {isAdmin && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={pending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 /> Delete
          </Button>
        )}
        {rowError && <p className="text-xs text-destructive">{rowError}</p>}
      </div>
    </li>
  );
}

function parsedNullableInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
