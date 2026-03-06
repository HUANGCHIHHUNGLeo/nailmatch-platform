import { messagingApi } from "@line/bot-sdk";
import sharp from "sharp";

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

const blobClient = new messagingApi.MessagingApiBlobClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nailmatch-platform.vercel.app";
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";

// ─── Brand colors ───
const BRAND = "#D4A0A0";
const BRAND_DARK = "#B88A8A";
const BRAND_LIGHT = "#F5E6E0";
const TEXT_DARK = "#4A3535";
const TEXT_MUTED = "#9B8585";
const FONT = "'Noto Sans TC', 'Helvetica Neue', Arial, sans-serif";

// ─── SVG icons (24x24 viewBox, stroke style) ───
const ICONS: Record<string, string> = {
  sparkles: `<path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5" stroke-linejoin="round"/>`,
  users: `<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="7" r="4" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5"/><path d="M22 21v-2a4 4 0 00-3-3.87" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5" stroke-linecap="round"/><path d="M16 3.13a4 4 0 010 7.75" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5" stroke-linecap="round"/>`,
  user: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="7" r="4" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5"/>`,
  dashboard: `<rect x="3" y="3" width="7" height="9" rx="1" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5"/><rect x="14" y="3" width="7" height="5" rx="1" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5"/><rect x="14" y="12" width="7" height="9" rx="1" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5"/><rect x="3" y="16" width="7" height="5" rx="1" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5"/>`,
  settings: `<circle cx="12" cy="12" r="3" fill="none" stroke="${TEXT_DARK}" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke="${TEXT_DARK}" stroke-width="1.2"/>`,
};

/** Decorative background SVG elements */
function bgDecorations(W: number, H: number): string {
  return `
    <!-- soft gradient background -->
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FCF5F3"/>
        <stop offset="50%" stop-color="#F8EDE8"/>
        <stop offset="100%" stop-color="#F0DDD6"/>
      </linearGradient>
      <linearGradient id="card-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="white" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="white" stop-opacity="0.78"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <!-- decorative circles -->
    <circle cx="${W * 0.05}" cy="${H * 0.2}" r="120" fill="${BRAND_LIGHT}" opacity="0.4"/>
    <circle cx="${W * 0.95}" cy="${H * 0.8}" r="160" fill="${BRAND_LIGHT}" opacity="0.35"/>
    <circle cx="${W * 0.5}" cy="${H * 0.1}" r="80" fill="${BRAND}" opacity="0.08"/>
    <circle cx="${W * 0.15}" cy="${H * 0.85}" r="60" fill="${BRAND}" opacity="0.1"/>
    <circle cx="${W * 0.85}" cy="${H * 0.15}" r="90" fill="${BRAND_LIGHT}" opacity="0.3"/>
    <!-- subtle dots pattern -->
    ${Array.from({ length: 12 }, (_, i) => {
      const x = 100 + (i % 4) * ((W - 200) / 3);
      const y = 80 + Math.floor(i / 4) * ((H - 160) / 2);
      return `<circle cx="${x}" cy="${y}" r="4" fill="${BRAND}" opacity="0.12"/>`;
    }).join("\n    ")}
  `;
}

/** Render a card with rounded corners, icon, English title, and Chinese subtitle */
function renderCard(opts: {
  x: number;
  y: number;
  w: number;
  h: number;
  icon: string;
  enTitle: string;
  zhTitle: string;
  cta?: string; // optional CTA pill text
}): string {
  const { x, y, w, h, icon, enTitle, zhTitle, cta } = opts;
  const cx = x + w / 2;
  const r = 30; // border radius

  const iconSize = 56;
  let enY: number, zhY: number, iconY: number;

  if (cta) {
    // Card with CTA button: icon top, EN title, ZH title, CTA pill
    iconY = y + h * 0.15;
    enY = y + h * 0.43;
    zhY = y + h * 0.58;
  } else {
    // Standard card: EN title, ZH title, icon
    enY = y + h * 0.3;
    zhY = y + h * 0.5;
    iconY = y + h * 0.6;
  }

  let ctaSvg = "";
  if (cta) {
    const pillW = 280;
    const pillH = 52;
    const pillX = cx - pillW / 2;
    const pillY = y + h * 0.72;
    ctaSvg = `
      <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="26" fill="${BRAND}" opacity="0.9"/>
      <text x="${cx}" y="${pillY + pillH / 2 + 7}" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="500" fill="white" letter-spacing="1">${cta}</text>
    `;
  }

  return `
    <g>
      <!-- card shadow -->
      <rect x="${x + 4}" y="${y + 6}" width="${w}" height="${h}" rx="${r}" fill="black" opacity="0.04"/>
      <!-- card body -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#card-fill)" stroke="white" stroke-width="2"/>
      <!-- icon -->
      <svg x="${cx - iconSize / 2}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24">
        ${icon}
      </svg>
      <!-- English title -->
      <text x="${cx}" y="${enY}" text-anchor="middle" font-family="${FONT}" font-size="38" font-weight="700" fill="${TEXT_DARK}" letter-spacing="3">${enTitle}</text>
      <!-- Chinese subtitle -->
      <text x="${cx}" y="${zhY}" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="400" fill="${TEXT_MUTED}">${zhTitle}</text>
      ${ctaSvg}
    </g>
  `;
}

/** Generate customer Rich Menu SVG (3 cards on decorated background) */
function generateCustomerMenuSvg(): string {
  const W = 2500;
  const H = 843;
  const pad = 40;
  const gap = 30;
  const cardH = H - pad * 2;

  // Left card: wider (main CTA)
  const leftW = (W - pad * 2 - gap * 2) * 0.4;
  // Middle + Right cards: equal width
  const smallW = (W - pad * 2 - gap * 2 - leftW) / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bgDecorations(W, H)}
  ${renderCard({
    x: pad,
    y: pad,
    w: leftW,
    h: cardH,
    icon: ICONS.sparkles,
    enTitle: "RESERVE",
    zhTitle: "發佈需求",
    cta: "立即配對 Match Now",
  })}
  ${renderCard({
    x: pad + leftW + gap,
    y: pad,
    w: smallW,
    h: cardH,
    icon: ICONS.users,
    enTitle: "ARTISTS",
    zhTitle: "設計師總覽",
  })}
  ${renderCard({
    x: pad + leftW + gap + smallW + gap,
    y: pad,
    w: smallW,
    h: cardH,
    icon: ICONS.user,
    enTitle: "MY PAGE",
    zhTitle: "我的帳號",
  })}
</svg>`;
}

/** Generate artist Rich Menu SVG (3 cards on decorated background) */
function generateArtistMenuSvg(): string {
  const W = 2500;
  const H = 843;
  const pad = 40;
  const gap = 30;
  const cardH = H - pad * 2;
  const cardW = (W - pad * 2 - gap * 2) / 3;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bgDecorations(W, H)}
  ${renderCard({
    x: pad,
    y: pad,
    w: cardW,
    h: cardH,
    icon: ICONS.dashboard,
    enTitle: "DASHBOARD",
    zhTitle: "接案總覽",
  })}
  ${renderCard({
    x: pad + cardW + gap,
    y: pad,
    w: cardW,
    h: cardH,
    icon: ICONS.user,
    enTitle: "PROFILE",
    zhTitle: "個人資料",
  })}
  ${renderCard({
    x: pad + (cardW + gap) * 2,
    y: pad,
    w: cardW,
    h: cardH,
    icon: ICONS.settings,
    enTitle: "SETTINGS",
    zhTitle: "帳號設定",
  })}
</svg>`;
}

async function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// ─── Customer Rich Menu ───
const CUSTOMER_MENU_CONFIG: messagingApi.RichMenuRequest = {
  size: { width: 2500, height: 843 },
  selected: true,
  name: "NaLi Match — 客戶選單",
  chatBarText: "立即找設計師",
  areas: [
    {
      // Left card (40% width): RESERVE
      bounds: { x: 0, y: 0, width: 1000, height: 843 },
      action: {
        type: "uri",
        uri: `https://liff.line.me/${LIFF_ID}/customer-form`,
      },
    },
    {
      // Middle card (30%): ARTISTS
      bounds: { x: 1000, y: 0, width: 750, height: 843 },
      action: { type: "uri", uri: `${APP_URL}/artists` },
    },
    {
      // Right card (30%): MY PAGE
      bounds: { x: 1750, y: 0, width: 750, height: 843 },
      action: { type: "uri", uri: `${APP_URL}/my` },
    },
  ],
};

// ─── Artist Rich Menu ───
const ARTIST_MENU_CONFIG: messagingApi.RichMenuRequest = {
  size: { width: 2500, height: 843 },
  selected: true,
  name: "NaLi Match — 設計師選單",
  chatBarText: "設計師後台",
  areas: [
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: { type: "uri", uri: `${APP_URL}/artist/dashboard` },
    },
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: { type: "uri", uri: `${APP_URL}/artist/profile` },
    },
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: { type: "uri", uri: `${APP_URL}/artist/settings` },
    },
  ],
};

// ─── Setup functions ───
export async function setupRichMenus(): Promise<{
  customerMenuId: string;
  artistMenuId: string;
}> {
  // Delete existing rich menus
  const existingResult = await client.getRichMenuList();
  const existing = Array.isArray(existingResult) ? existingResult : (existingResult as { richmenus?: unknown[] }).richmenus || [];
  for (const menu of existing as { richMenuId: string }[]) {
    await client.deleteRichMenu(menu.richMenuId);
  }

  // Create customer menu
  const customerMenu = await client.createRichMenu(CUSTOMER_MENU_CONFIG);
  const customerPng = await svgToPng(generateCustomerMenuSvg());
  await blobClient.setRichMenuImage(customerMenu.richMenuId, new Blob([new Uint8Array(customerPng)], { type: "image/png" }));
  await client.setDefaultRichMenu(customerMenu.richMenuId);

  // Create artist menu
  const artistMenu = await client.createRichMenu(ARTIST_MENU_CONFIG);
  const artistPng = await svgToPng(generateArtistMenuSvg());
  await blobClient.setRichMenuImage(artistMenu.richMenuId, new Blob([new Uint8Array(artistPng)], { type: "image/png" }));

  return {
    customerMenuId: customerMenu.richMenuId,
    artistMenuId: artistMenu.richMenuId,
  };
}

// Link artist rich menu to a specific user
export async function linkArtistRichMenu(userId: string): Promise<void> {
  // Find the artist rich menu
  const menusResult = await client.getRichMenuList();
  const menuList = Array.isArray(menusResult) ? menusResult : (menusResult as { richmenus?: { richMenuId: string; name: string }[] }).richmenus || [];
  const artistMenu = menuList.find((m) => m.name === "NaLi Match — 設計師選單");
  if (artistMenu) {
    await client.linkRichMenuIdToUser(userId, artistMenu.richMenuId);
  }
}

// Unlink artist rich menu (revert to default customer menu)
export async function unlinkArtistRichMenu(userId: string): Promise<void> {
  await client.unlinkRichMenuIdFromUser(userId);
}
