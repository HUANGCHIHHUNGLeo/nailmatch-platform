import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "p";

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const url = `https://www.instagram.com/${type}/${id}/`;
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`;

    const res = await fetch(oembedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch oEmbed" }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      author_name: data.author_name || "",
      title: data.title || "",
      thumbnail_url: data.thumbnail_url || "",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
