import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/components/admin/auth";
import {
  useCreateServiceArea,
  useDeleteServiceArea,
  useServiceAreasAdmin,
  useUpdateServiceArea,
  type ServiceArea,
} from "@/components/admin/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/service-areas")({
  head: () => ({
    meta: [{ title: "Service Areas — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ServiceAreasAdmin,
});

function ServiceAreasAdmin() {
  const { isStaff, isAdmin } = useAdminAuth();
  const query = useServiceAreasAdmin(isStaff);
  const create = useCreateServiceArea();

  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const areas = query.data ?? [];
  const nextSort = (areas.at(-1)?.sort_order ?? 0) + 10;

  function onAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);
    const name = newName.trim();
    if (!name) {
      setAddError("Please enter an area name.");
      return;
    }
    if (name.length > 120) {
      setAddError("Area name is too long.");
      return;
    }
    if (areas.some((row) => row.name.toLowerCase() === name.toLowerCase())) {
      setAddError("This area is already on the list.");
      return;
    }
    create.mutate(
      { name, sortOrder: nextSort },
      {
        onSuccess: () => setNewName(""),
        onError: () => setAddError("Could not add this area. Please try again."),
      },
    );
  }

  return (
    <AdminShell
      title="Service Areas"
      description="Nagpur localities shown on the homepage and on the public Service Areas page. Deactivated areas stay in the database but disappear from the public site."
      actions={
        <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      }
    >
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base">Add a new area</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          New areas appear at the end of the list. Drag order isn't supported yet — use the sort
          number to reorder.
        </p>
        <form onSubmit={onAdd} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <Label
              htmlFor="new-area"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Area name
            </Label>
            <Input
              id="new-area"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="e.g. Ramdaspeth"
              maxLength={120}
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />} Add area
          </Button>
        </form>
        {addError && <p className="mt-3 text-sm text-destructive">{addError}</p>}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base">All areas</h2>
          <p className="text-xs text-muted-foreground">
            {areas.filter((row) => row.is_active).length} active · {areas.length} total
          </p>
        </div>

        {query.isPending ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading service areas…</p>
        ) : query.isError ? (
          <p className="m-5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Could not load the service areas. Please refresh, and check that your account still has
            admin access.
          </p>
        ) : areas.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No service areas yet. Add the first one above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {areas.map((area) => (
              <AreaRow key={area.id} area={area} isAdmin={isAdmin} />
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

function AreaRow({ area, isAdmin }: { area: ServiceArea; isAdmin: boolean }) {
  const update = useUpdateServiceArea();
  const remove = useDeleteServiceArea();

  const [name, setName] = useState(area.name);
  const [sort, setSort] = useState(String(area.sort_order));
  const [rowError, setRowError] = useState<string | null>(null);

  const dirty = name.trim() !== area.name || Number(sort) !== area.sort_order;

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
        id: area.id,
        patch: { name: trimmed, sort_order: parsedSort },
      },
      {
        onError: () =>
          setRowError("Could not save — the name may already be used by another area."),
      },
    );
  }

  function onToggleActive() {
    setRowError(null);
    update.mutate(
      { id: area.id, patch: { is_active: !area.is_active } },
      { onError: () => setRowError("Could not change the visibility.") },
    );
  }

  function onDelete() {
    if (!window.confirm(`Delete "${area.name}"? This cannot be undone.`)) return;
    setRowError(null);
    remove.mutate(area.id, {
      onError: () => setRowError("Could not delete this area."),
    });
  }

  const pending = update.isPending || remove.isPending;

  return (
    <li className={area.is_active ? "px-5 py-4" : "bg-surface/60 px-5 py-4 text-muted-foreground"}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 basis-56">
          <Label htmlFor={`name-${area.id}`} className="sr-only">
            Area name
          </Label>
          <Input
            id={`name-${area.id}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
          />
        </div>

        <div className="w-24">
          <Label htmlFor={`sort-${area.id}`} className="sr-only">
            Sort order
          </Label>
          <Input
            id={`sort-${area.id}`}
            type="number"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            inputMode="numeric"
            title="Sort order (lower numbers appear first)"
          />
        </div>

        <Button size="sm" variant="default" onClick={onSave} disabled={!dirty || pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Check />} Save
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onToggleActive}
          disabled={pending}
          title={area.is_active ? "Hide from public site" : "Show on public site"}
        >
          {area.is_active ? <EyeOff /> : <Eye />}
          {area.is_active ? "Deactivate" : "Activate"}
        </Button>

        {isAdmin && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={pending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>
      {rowError && <p className="mt-2 text-xs text-destructive">{rowError}</p>}
    </li>
  );
}
