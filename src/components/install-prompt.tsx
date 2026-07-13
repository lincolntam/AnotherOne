"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (nextEvent: Event) => {
      nextEvent.preventDefault();
      setEvent(nextEvent as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !event) return null;

  return (
    <button
      className="fixed bottom-2 left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-journal"
      onClick={async () => {
        await event.prompt();
        setVisible(false);
      }}
    >
      <Download size={16} />
      Install AnotherOne
    </button>
  );
}
