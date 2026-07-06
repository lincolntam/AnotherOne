"use client";

import { AppShell } from "@/components/app-shell";

export function LtravelLogRouteEmbed() {
  return (
    <AppShell showHeader={false} showBottomNav={false}>
      <iframe
        title="LTravelLog Route"
        src="/ltravellog-route"
        className="block h-[100dvh] min-h-[100svh] w-full border-0 bg-white"
        allow="geolocation; fullscreen"
      />
    </AppShell>
  );
}
