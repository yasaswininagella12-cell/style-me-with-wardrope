"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, optionLabel } from "@/lib/constants";
import {
  addWishlistItem,
  deleteWishlistItem,
  setMonthlyBudget,
  toggleWishlistPurchased,
  updateWishlistItem,
} from "@/lib/feature-actions";
import type { WishlistSuggestion } from "@/types";

export type WishlistEntry = {
  id: string;
  name: string;
  category: string | null;
  estimatedPrice: number | null;
  priority: "essential" | "nice-to-have" | "dream";
  status: "planned" | "purchased";
  link: string | null;
  imageUrl: string | null;
  note: string | null;
  purchasedAt: string | null;
};

export type WishlistView = {
  items: WishlistEntry[];
  monthlyLimit: number;
  spentThisMonth: number;
  suggestions: WishlistSuggestion[];
};

type Priority = WishlistEntry["priority"];

type WishlistFormState = {
  name: string;
  category: string;
  estimatedPrice: string;
  priority: Priority;
  link: string;
  imageUrl: string;
  note: string;
};

type FormDialogState = {
  item: WishlistEntry | null;
  preset: Partial<WishlistFormState> | null;
};

const PRIORITIES: { value: Priority; label: string; badgeClass: string }[] = [
  {
    value: "essential",
    label: "Essential",
    badgeClass: "border-brand-rose/40 bg-brand-rose/10 text-brand-rose",
  },
  {
    value: "nice-to-have",
    label: "Nice to have",
    badgeClass: "border-brand-gold/40 bg-brand-gold/10 text-brand-gold",
  },
  {
    value: "dream",
    label: "Dream",
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function money(value: number): string {
  return currency.format(value);
}

function formFromItem(item: WishlistEntry): WishlistFormState {
  return {
    name: item.name,
    category: item.category ?? "none",
    estimatedPrice: item.estimatedPrice === null ? "" : String(item.estimatedPrice),
    priority: item.priority,
    link: item.link ?? "",
    imageUrl: item.imageUrl ?? "",
    note: item.note ?? "",
  };
}

function formFromPreset(preset?: Partial<WishlistFormState> | null): WishlistFormState {
  return {
    name: preset?.name ?? "",
    category: preset?.category ?? "none",
    estimatedPrice: preset?.estimatedPrice ?? "",
    priority: preset?.priority ?? "nice-to-have",
    link: preset?.link ?? "",
    imageUrl: preset?.imageUrl ?? "",
    note: preset?.note ?? "",
  };
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITIES.find((option) => option.value === priority);
  return (
    <Badge variant="outline" className={meta?.badgeClass}>
      {meta?.label ?? priority}
    </Badge>
  );
}

function WishlistFormDialog({
  item,
  preset,
  onClose,
}: {
  item: WishlistEntry | null;
  preset: Partial<WishlistFormState> | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<WishlistFormState>(() =>
    item ? formFromItem(item) : formFromPreset(preset),
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const hasCustomCategory =
    form.category !== "none" &&
    form.category.trim() !== "" &&
    !CATEGORIES.some((category) => category.value === form.category);

  function set<K extends keyof WishlistFormState>(key: K, value: WishlistFormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit() {
    const priceInput = form.estimatedPrice.trim();
    const estimatedPrice = priceInput === "" ? null : Number(priceInput);

    if (estimatedPrice !== null && (!Number.isFinite(estimatedPrice) || estimatedPrice < 0)) {
      toast.error("Enter a valid estimated price.");
      return;
    }

    setPending(true);
    setError(null);
    setErrors({});

    const input = {
      name: form.name,
      category: form.category === "none" ? null : form.category,
      estimatedPrice,
      priority: form.priority,
      link: form.link,
      imageUrl: form.imageUrl,
      note: form.note || null,
    };

    const result = item
      ? await updateWishlistItem(item.id, input)
      : await addWishlistItem(input);

    setPending(false);
    if (result.error) {
      setError(result.error);
      setErrors(result.fieldErrors ?? {});
      return;
    }

    toast.success(item ? "Wishlist item updated." : "Added to your wishlist.");
    onClose();
    router.refresh();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {item ? "Edit wishlist item" : "Add an item"}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Update the details of this piece."
              : "Save a piece you are saving toward, and why it matters."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="wishlist-name">Name</Label>
            <Input
              id="wishlist-name"
              maxLength={100}
              placeholder="e.g. Tailored black blazer"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
            />
            <FieldError messages={errors.name} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => set("category", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Other</SelectItem>
                  {hasCustomCategory && (
                    <SelectItem value={form.category}>{optionLabel(form.category)}</SelectItem>
                  )}
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={errors.category} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wishlist-price">Estimated price</Label>
              <Input
                id="wishlist-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.estimatedPrice}
                onChange={(event) => set("estimatedPrice", event.target.value)}
              />
              <FieldError messages={errors.estimatedPrice} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(value) => set("priority", value as Priority)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError messages={errors.priority} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="wishlist-link">Product link</Label>
              <Input
                id="wishlist-link"
                inputMode="url"
                placeholder="https://…"
                value={form.link}
                onChange={(event) => set("link", event.target.value)}
              />
              <FieldError messages={errors.link} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wishlist-image">Image URL</Label>
              <Input
                id="wishlist-image"
                inputMode="url"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={(event) => set("imageUrl", event.target.value)}
              />
              <FieldError messages={errors.imageUrl} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wishlist-note">Note</Label>
            <Textarea
              id="wishlist-note"
              maxLength={300}
              rows={3}
              placeholder="Why do you want this piece?"
              value={form.note}
              onChange={(event) => set("note", event.target.value)}
            />
            <FieldError messages={errors.note} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !form.name.trim()}>
            {pending ? "Saving…" : item ? "Save changes" : "Add item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WishlistCard({
  item,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: WishlistEntry;
  busy: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const purchased = item.status === "purchased";

  return (
    <Card
      className={`flex h-full flex-col overflow-hidden ${
        purchased ? "border-emerald-500/40 bg-emerald-500/5" : ""
      }`}
    >
      <CardContent className="flex flex-1 gap-4 p-4">
        {item.imageUrl ? (
          <span className="relative block size-16 shrink-0 overflow-hidden rounded-xl border bg-muted">
            <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
          </span>
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
            <ShoppingBag className="size-6" aria-hidden="true" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className={`truncate font-heading text-base font-semibold ${
                  purchased ? "text-muted-foreground line-through" : ""
                }`}
              >
                {item.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {optionLabel(item.category, "Uncategorized")}
                {item.estimatedPrice !== null && ` · ${money(item.estimatedPrice)}`}
              </p>
            </div>
            {purchased && (
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
            )}
          </div>

          {item.note && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.note}</p>}

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-gold hover:underline"
            >
              <ExternalLink className="size-3" aria-hidden="true" />
              View link
            </a>
          )}
        </div>
      </CardContent>

      <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          disabled={busy}
          className={purchased ? "text-muted-foreground" : "text-emerald-600 hover:text-emerald-700"}
        >
          {purchased ? (
            <RotateCcw className="mr-1.5 size-3.5" aria-hidden="true" />
          ) : (
            <Check className="mr-1.5 size-3.5" aria-hidden="true" />
          )}
          {purchased ? "Move to planned" : "Mark purchased"}
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            disabled={busy}
            aria-label={`Edit ${item.name}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={busy}
            aria-label={`Delete ${item.name}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function WishlistClient({ data }: { data: WishlistView }) {
  const router = useRouter();
  const [monthlyLimit, setMonthlyLimit] = useState(String(data.monthlyLimit));
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [budgetPending, setBudgetPending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formDialog, setFormDialog] = useState<FormDialogState | null>(null);

  const overspent = data.monthlyLimit > 0 && data.spentThisMonth > data.monthlyLimit;
  const remaining = data.monthlyLimit - data.spentThisMonth;
  const progress =
    data.monthlyLimit > 0
      ? Math.min(100, Math.max(0, (data.spentThisMonth / data.monthlyLimit) * 100))
      : data.spentThisMonth > 0
        ? 100
        : 0;

  function openAdd(preset?: Partial<WishlistFormState>) {
    setFormDialog({ item: null, preset: preset ?? null });
  }

  function openEdit(item: WishlistEntry) {
    setFormDialog({ item, preset: null });
  }

  async function handleBudgetSave() {
    const value = Number(monthlyLimit);
    if (!Number.isFinite(value) || value < 0) {
      setBudgetError("Enter a valid monthly budget.");
      return;
    }

    setBudgetPending(true);
    setBudgetError(null);
    const result = await setMonthlyBudget({ monthlyLimit: value });
    setBudgetPending(false);

    if (result.error) {
      setBudgetError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Monthly budget saved.");
    router.refresh();
  }

  async function handleToggle(item: WishlistEntry) {
    setBusyId(item.id);
    const result = await toggleWishlistPurchased(item.id);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(item.status === "purchased" ? "Moved back to planned." : "Marked as purchased.");
    router.refresh();
  }

  async function handleDelete(item: WishlistEntry) {
    setBusyId(item.id);
    const result = await deleteWishlistItem(item.id);
    setBusyId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Item removed from your wishlist.");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Wallet className="size-4 text-brand-gold" aria-hidden="true" />
              Monthly budget
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Purchases are counted in the month they were marked as bought.
            </p>
          </div>
          <Badge variant={overspent ? "destructive" : "secondary"}>
            {overspent ? "Over budget" : data.monthlyLimit > 0 ? "On track" : "No limit"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="monthly-limit">Monthly limit</Label>
              <Input
                id="monthly-limit"
                type="number"
                min="0"
                step="0.01"
                value={monthlyLimit}
                onChange={(event) => setMonthlyLimit(event.target.value)}
              />
              {budgetError && <p className="text-sm text-destructive">{budgetError}</p>}
            </div>
            <Button onClick={handleBudgetSave} disabled={budgetPending} className="sm:w-fit">
              <Check className="mr-2 size-4" aria-hidden="true" />
              {budgetPending ? "Saving…" : "Save budget"}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Spent this month</span>
              <span className={overspent ? "font-semibold text-destructive" : "font-semibold"}>
                {money(data.spentThisMonth)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  overspent
                    ? "bg-destructive"
                    : "bg-gradient-to-r from-brand-gold to-brand-rose"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
              <span>
                {money(data.spentThisMonth)} of{" "}
                {data.monthlyLimit > 0 ? money(data.monthlyLimit) : "no limit set"}
              </span>
              <span className={remaining < 0 ? "font-medium text-destructive" : ""}>
                {remaining < 0
                  ? `${money(Math.abs(remaining))} over`
                  : `${money(remaining)} left`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.suggestions.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-brand-gold" aria-hidden="true" />
            <h2 className="font-heading text-xl font-bold">Wardrobe gaps to fill</h2>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            A short list of what your closet is missing most right now.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className="flex h-full flex-col border-brand-gold/30 bg-gradient-to-br from-brand-sand/30 to-transparent"
              >
                <CardContent className="flex flex-1 flex-col p-5">
                  <PriorityBadge priority={suggestion.priority} />
                  <h3 className="mt-3 font-heading text-base font-semibold">{suggestion.label}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{suggestion.reason}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      openAdd({
                        name: suggestion.label,
                        category: suggestion.category,
                        priority: suggestion.priority,
                      })
                    }
                  >
                    <Plus className="mr-1.5 size-3.5" aria-hidden="true" />
                    Add
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ShoppingBag className="size-5 text-brand-gold" aria-hidden="true" />
          <h2 className="font-heading text-xl font-bold">Your wishlist</h2>
          <Badge variant="secondary">{data.items.length}</Badge>
          <Button className="sm:ml-auto" onClick={() => openAdd()}>
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Add an item
          </Button>
        </div>

        {data.items.length === 0 && data.suggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
            <p className="font-heading text-lg font-semibold">Nothing on your wishlist yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a piece you have your eye on, and we will help you plan the rest.
            </p>
            <Button className="mt-5" onClick={() => openAdd()}>
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Add an item
            </Button>
          </div>
        ) : data.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            Your wishlist is empty. Add one of the suggestions above to get started.
          </div>
        ) : (
          <div className="space-y-8">
            {PRIORITIES.map((priority) => {
              const group = data.items.filter((item) => item.priority === priority.value);
              if (group.length === 0) return null;

              return (
                <div key={priority.value}>
                  <div className="mb-3 flex items-center gap-2">
                    <PriorityBadge priority={priority.value} />
                    <span className="text-sm text-muted-foreground">
                      {group.length} {group.length === 1 ? "piece" : "pieces"}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((item) => (
                      <WishlistCard
                        key={item.id}
                        item={item}
                        busy={busyId === item.id}
                        onToggle={() => handleToggle(item)}
                        onEdit={() => openEdit(item)}
                        onDelete={() => handleDelete(item)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {formDialog && (
        <WishlistFormDialog
          key={
            formDialog.item
              ? `item-${formDialog.item.id}`
              : `new-${JSON.stringify(formDialog.preset ?? {})}`
          }
          item={formDialog.item}
          preset={formDialog.preset}
          onClose={() => setFormDialog(null)}
        />
      )}
    </div>
  );
}
