import { NextResponse } from "next/server";

function extractCaptionFromHtml(html: string): string {
  // oEmbed html contains a <blockquote> with the caption text in <p> tags
  const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (pMatch) {
    return pMatch[1]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<a[^>]*>(.*?)<\/a>/g, "$1")
      .replace(/<[^>]+>/g, "")
      .trim();
  }
  return "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "p";

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const postUrl = `https://www.instagram.com/${type}/${id}/`;

  try {
    // Try Facebook Graph API first (requires FACEBOOK_TOKEN env var)
    const fbToken = process.env.FACEBOOK_TOKEN;
    if (fbToken) {
      const graphUrl = `https://graph.facebook.com/v21.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&maxwidth=658&omitscript=true&access_token=${fbToken}`;
      const graphRes = await fetch(graphUrl, {
        next: { revalidate: 3600 },
      });

      if (graphRes.ok) {
        const data = await graphRes.json();
        let title = data.title || "";
        if (!title && data.html) {
          title = extractCaptionFromHtml(data.html);
        }
        return NextResponse.json({
          author_name: data.author_name || "",
          title,
          thumbnail_url: data.thumbnail_url || "",
        });
      }
    }

    // Fallback: public oEmbed API (v1 endpoint)
    const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(postUrl)}&maxwidth=658&omitscript=true`;
    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      redirect: "follow",
      next: { revalidate: 3600 },
    });

    // Check if we got JSON back (not a login redirect)
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("json")) {
      return NextResponse.json({
        author_name: "",
        title: "",
        thumbnail_url: "",
      });
    }

    const data = await res.json();
    let title = data.title || "";
    if (!title && data.html) {
      title = extractCaptionFromHtml(data.html);
    }

    return NextResponse.json({
      author_name: data.author_name || "",
      title,
      thumbnail_url: data.thumbnail_url || "",
    });
  } catch (err) {
    console.error("instagram-meta error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
