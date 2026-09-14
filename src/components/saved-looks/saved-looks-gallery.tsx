"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SavedLookCard, type SavedLookItem } from "@/components/saved-looks/saved-look-card";

export function SavedLooksGallery({ looks }: { looks: SavedLookItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? looks.filter((look) =>
        `${look.name} ${look.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : looks;

  return (
    <div>
      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved looks…"
          className="pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">
            {looks.length === 0 ? "No saved looks yet" : `No saved looks match “${query.trim()}”`}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {looks.length === 0
              ? "Generate a look with Style My Outfit, then hit “Save this look” to keep it here."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((look) => (
            <SavedLookCard key={look.id} look={look} />
          ))}
        </div>
      )}
    </div>
  );
}