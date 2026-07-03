"use client";

import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Import, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useWebsiteStore } from "@/stores/website-store";
import { parseBookmarksHtml } from "@/utils/bookmarks";
import type { WebsiteShortcut } from "@/types/app";

const emptyForm = {
  title: "",
  description: "",
  url: "",
  imageUrl: "",
  category: "General",
  active: true,
  favorite: false,
  pinned: false
};

export default function WebsitesPage() {
  const { hydrate, user } = useAuthStore();
  const { websites, load } = useWebsiteStore();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<WebsiteShortcut | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    hydrate();
    load(true);
  }, [hydrate, load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      await api<boolean>(`/api/websites/${editing.id}`, { method: "PATCH", body: JSON.stringify(form) });
    } else {
      await api<{ id: string }>("/api/websites", { method: "POST", body: JSON.stringify(form) });
    }
    setForm(emptyForm);
    setEditing(null);
    await load(true);
  }

  async function remove(id: string) {
    await api<boolean>(`/api/websites/${id}`, { method: "DELETE" });
    await load(true);
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = Array.from(websites);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    await Promise.all(reordered.map((item, index) => api<boolean>(`/api/websites/${item.id}`, { method: "PATCH", body: JSON.stringify({ displayOrder: index + 1 }) })));
    await load(true);
  }

  async function importFile(file: File) {
    const html = await file.text();
    const items = parseBookmarksHtml(html);
    const result = await api<{ inserted: number; skipped: number; total: number }>("/api/websites/import", {
      method: "POST",
      body: JSON.stringify({ items, overwrite: false })
    });
    setMessage(`Imported ${result.inserted}, skipped ${result.skipped}, total ${result.total}.`);
    await load(true);
  }

  if (user && user.role !== "admin") {
    return (
      <AppShell websites={websites}>
        <div className="ao-card p-6 text-center">
          <h1 className="text-xl font-semibold">Admin only</h1>
          <p className="mt-2 text-sm opacity-60">Website management is restricted to admin users.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell websites={websites}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-graphite/50">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Websites</h1>
        </div>
        <label className="ao-icon-button cursor-pointer" aria-label="Import bookmarks">
          <Import size={18} />
          <input className="hidden" type="file" accept=".html,text/html" onChange={(event) => event.target.files?.[0] && importFile(event.target.files[0])} />
        </label>
      </div>

      <form className="ao-card mb-6 grid gap-3 p-5 md:grid-cols-2" onSubmit={save}>
        <input className="ao-input" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input className="ao-input" placeholder="URL" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} required />
        <input className="ao-input" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input className="ao-input" placeholder="Image URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        <input className="ao-input" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {(["active", "favorite", "pinned"] as const).map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input type="checkbox" checked={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} />
              {key}
            </label>
          ))}
        </div>
        <button className="ao-button md:col-span-2">
          <Plus size={17} />
          {editing ? "Update Website" : "Add Website"}
        </button>
      </form>

      {message ? <p className="mb-4 rounded-2xl bg-sage px-4 py-3 text-sm">{message}</p> : null}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="websites">
          {(provided) => (
            <div className="space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
              {websites.map((website, index) => (
                <Draggable key={website.id} draggableId={website.id} index={index}>
                  {(dragProvided) => (
                    <div className="ao-card flex items-center gap-3 p-3" ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{website.title}</p>
                        <p className="truncate text-xs opacity-60">{website.url}</p>
                      </div>
                      <button className="ao-icon-button h-10 w-10" onClick={() => { setEditing(website); setForm(website); }} aria-label="Edit">
                        <Pencil size={16} />
                      </button>
                      <button className="ao-icon-button h-10 w-10" onClick={() => remove(website.id)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </AppShell>
  );
}
