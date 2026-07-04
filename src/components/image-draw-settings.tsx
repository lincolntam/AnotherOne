"use client";

import { Check, ImagePlus, Link as LinkIcon, Upload, X } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { DrawImage, getImageDrawLabel, loadDrawImages, saveDrawImages } from "@/utils/image-draw";

type ImageDrawSettingsProps = {
  drawKey: string;
  open: boolean;
  onClose: () => void;
};

export function ImageDrawSettings({ drawKey, open, onClose }: ImageDrawSettingsProps) {
  const [draft, setDraft] = useState<DrawImage[]>([]);

  useEffect(() => {
    if (!open) return;
    const images = loadDrawImages(drawKey);
    setDraft(images.length ? images : [createEmptyImage()]);
  }, [drawKey, open]);

  if (!open) return null;

  function updateImage(id: string, patch: Partial<DrawImage>) {
    setDraft((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addImage() {
    setDraft((current) => [...current, createEmptyImage()]);
  }

  function confirm() {
    saveDrawImages(drawKey, draft);
    onClose();
  }

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-white/78 p-5 backdrop-blur">
      <section className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-journal">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-ink">Setting</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-graphite/40">{getImageDrawLabel(drawKey)} draw</p>
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-paper" aria-label="Close setting" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
          {draft.map((item, index) => (
            <div key={item.id} className="rounded-[18px] bg-paper p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-graphite/45">Image {index + 1}</span>
                <button
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${item.active ? "bg-ink text-white" : "bg-white text-graphite/45"}`}
                  aria-label="Toggle image"
                  onClick={() => updateImage(item.id, { active: !item.active })}
                >
                  <Check size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2">
                <LinkIcon size={14} className="shrink-0 text-graphite/40" />
                <input className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none" value={item.url} onChange={(event) => updateImage(item.id, { url: event.target.value })} placeholder="Image link" />
                <label className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-paper text-ink">
                  <Upload size={14} />
                  <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadImage(event, item.id, updateImage)} />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-paper px-4 py-3 text-sm font-bold text-ink" onClick={addImage}>
          <ImagePlus size={17} />
          Add image
        </button>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="rounded-full bg-paper px-4 py-3 text-sm font-bold text-ink" onClick={onClose}>Cancel</button>
          <button className="rounded-full bg-ink px-4 py-3 text-sm font-bold text-white" onClick={confirm}>Confirm</button>
        </div>
      </section>
    </div>
  );
}

function createEmptyImage(): DrawImage {
  return {
    id: `img-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    url: "",
    active: true
  };
}

function uploadImage(event: ChangeEvent<HTMLInputElement>, id: string, updateImage: (id: string, patch: Partial<DrawImage>) => void) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") updateImage(id, { url: reader.result, active: true });
  };
  reader.readAsDataURL(file);
}
