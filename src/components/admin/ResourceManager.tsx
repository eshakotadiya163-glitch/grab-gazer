import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export type FieldType = "text" | "textarea" | "number" | "select" | "switch" | "tags";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  step?: string;
  span?: 1 | 2;
}

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Repo<T> {
  list: (opts?: { order?: string; ascending?: boolean; filters?: Array<[string, string, unknown]> }) => Promise<T[]>;
  create: (row: Partial<T>) => Promise<T>;
  update: (id: string, row: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

interface Props<T extends { id: string }> {
  title: string;
  description?: string;
  repo: Repo<T>;
  queryKey: string;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  filters?: Array<[string, string, unknown]>;
  order?: string;
  ascending?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  toFormValues?: (row: T) => Record<string, unknown>;
  toPayload?: (values: Record<string, unknown>, existing?: T) => Record<string, unknown>;
  toolbar?: ReactNode;
}

export function ResourceManager<T extends { id: string }>({
  title, description, repo, queryKey, columns, fields, filters, order = "created_at", ascending = false,
  canCreate = true, canEdit = true, canDelete = true, toFormValues, toPayload, toolbar,
}: Props<T>) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => repo.list({ order, ascending, filters }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey] });

  const createMut = useMutation({
    mutationFn: (values: Record<string, unknown>) => repo.create((toPayload ? toPayload(values) : values) as Partial<T>),
    onSuccess: () => { toast.success(`Created`); invalidate(); setCreating(false); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) =>
      repo.update(id, (toPayload ? toPayload(values, editing!) : values) as Partial<T>),
    onSuccess: () => { toast.success(`Saved`); invalidate(); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => repo.remove(id),
    onSuccess: () => { toast.success("Deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          {canCreate && (
            <Button onClick={() => setCreating(true)} className="gap-2 bg-sage text-white hover:bg-sage-deep">
              <Plus className="h-4 w-4" /> Add
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => <th key={String(c.key)} className={`px-4 py-3 text-left font-medium ${c.className ?? ""}`}>{c.label}</th>)}
                {(canEdit || canDelete) && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={columns.length + 1} className="p-10 text-center text-muted-foreground">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" /> Loading…
                </td></tr>
              ) : (data ?? []).length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="p-10 text-center text-muted-foreground">No records yet.</td></tr>
              ) : (
                (data ?? []).map((row) => (
                  <tr key={row.id} className="border-t hover:bg-muted/20">
                    {columns.map((c) => (
                      <td key={String(c.key)} className={`px-4 py-3 ${c.className ?? ""}`}>
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key as string] ?? "—")}
                      </td>
                    ))}
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {canEdit && (
                          <Button size="sm" variant="ghost" onClick={() => setEditing(row)} className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => { if (confirm("Delete this record?")) deleteMut.mutate(row.id); }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FormDialog
        open={creating || !!editing}
        title={creating ? `New ${title.replace(/s$/, "")}` : `Edit ${title.replace(/s$/, "")}`}
        fields={fields}
        initial={editing ? (toFormValues ? toFormValues(editing) : (editing as unknown as Record<string, unknown>)) : {}}
        saving={createMut.isPending || updateMut.isPending}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSubmit={(v) => editing ? updateMut.mutate({ id: editing.id, values: v }) : createMut.mutate(v)}
      />
    </div>
  );
}

function FormDialog({
  open, title, fields, initial, onClose, onSubmit, saving,
}: {
  open: boolean; title: string; fields: FieldDef[]; initial: Record<string, unknown>;
  onClose: () => void; onSubmit: (values: Record<string, unknown>) => void; saving: boolean;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  // Reset when dialog opens with new initial
  const key = JSON.stringify(initial);
  const [lastKey, setLastKey] = useState(key);
  if (open && lastKey !== key) { setValues(initial); setLastKey(key); }

  const set = (n: string, v: unknown) => setValues((p) => ({ ...p, [n]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(values); }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {fields.map((f) => (
            <div key={f.name} className={f.span === 2 ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
              <Label className="text-sm">{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
              {f.type === "textarea" ? (
                <textarea
                  required={f.required}
                  placeholder={f.placeholder}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="w-full min-h-24 rounded-md border border-input bg-transparent p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              ) : f.type === "select" ? (
                <select
                  required={f.required}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">— Select —</option>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === "switch" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(values[f.name])}
                    onChange={(e) => set(f.name, e.target.checked)}
                  />
                  Enabled
                </label>
              ) : f.type === "tags" ? (
                <Input
                  placeholder="comma,separated,tags"
                  value={Array.isArray(values[f.name]) ? (values[f.name] as string[]).join(",") : String(values[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                />
              ) : (
                <Input
                  type={f.type === "number" ? "number" : "text"}
                  step={f.step}
                  required={f.required}
                  placeholder={f.placeholder}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => set(f.name, f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
                />
              )}
            </div>
          ))}
          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-sage text-white hover:bg-sage-deep">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving…</> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
