import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { requireUser } from "@/services/auth-service";

const allowedHosts = ["missav.ws", "missav.live", "jable.tv", "fourhoi.com"];

export async function GET(request: Request) {
  try {
    await requireUser();
    const sourceUrl = new URL(request.url).searchParams.get("url")?.trim();
    if (!sourceUrl) return NextResponse.json({ error: "URL is required." }, { status: 400 });

    const parsed = parseAllowedUrl(sourceUrl);
    if (!parsed) return NextResponse.json({ error: "Unsupported image host." }, { status: 400 });

    const response = await fetch(parsed.href, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: parsed.origin,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
      },
      redirect: "follow"
    });

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: "Image unavailable." }, { status: response.status || 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "image/jpeg");
    headers.set("Cache-Control", "private, max-age=86400");
    return new Response(response.body, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}

function parseAllowedUrl(value: string) {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./u, "");
    if (!allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) return null;
    return parsed;
  } catch {
    return null;
  }
}
