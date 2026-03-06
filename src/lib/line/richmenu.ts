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

// ─── Brand palette ───
const BRAND = "#D4A0A0";
const BRAND_DARK = "#B88A8A";
const BRAND_LIGHT = "#F5E6E0";
const TEXT = "#5C4040";
const TEXT_LIGHT = "#9B8080";
const FONT = "'Noto Sans TC', 'Helvetica Neue', Arial, sans-serif";

// ─── Custom SVG icons ───

/** Nail polish icon */
const ICON_NAIL = `
  <g stroke="${TEXT}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 3c0 0-1 1-1 3v4c0 1.5-1 2.5-2.5 2.5H9.5C8 12.5 7 11.5 7 10V6c0-2-1-3-1-3"/>
    <rect x="8" y="12.5" width="4" height="3" rx="0.5"/>
    <line x1="10" y1="15.5" x2="10" y2="20"/>
    <path d="M7 20h6"/>
  </g>`;

/** Eyelash icon */
const ICON_LASH = `
  <g stroke="${TEXT}" stroke-width="2" fill="none" stroke-linecap="round">
    <path d="M3 14c4-5 14-5 18 0"/>
    <path d="M6 12c-1.5-3-1-5 0-7"/>
    <path d="M9.5 10.5c-0.5-3 0.5-5.5 2-7"/>
    <path d="M14.5 10.5c0.5-3-0.5-5.5-2-7"/>
    <path d="M18 12c1.5-3 1-5 0-7"/>
  </g>`;

/** Globe icon */
const ICON_GLOBE = `
  <g stroke="${TEXT}" stroke-width="2" fill="none">
    <circle cx="12" cy="12" r="10"/>
    <ellipse cx="12" cy="12" rx="4.5" ry="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M4 7h16"/>
    <path d="M4 17h16"/>
  </g>`;

/** Small flower decoration */
function svgFlower(cx: number, cy: number, size: number, color: string, opacity: number): string {
  const r = size;
  const pr = size * 0.35; // petal radius
  return `
    <g opacity="${opacity}">
      ${[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const px = cx + Math.cos(rad) * r * 0.6;
        const py = cy + Math.sin(rad) * r * 0.6;
        return `<circle cx="${px}" cy="${py}" r="${pr}" fill="${color}"/>`;
      }).join("")}
      <circle cx="${cx}" cy="${cy}" r="${size * 0.25}" fill="${color}" opacity="0.8"/>
    </g>`;
}

/** Small branch with leaves */
function svgBranch(x: number, y: number, scale: number, flip: boolean, color: string, opacity: number): string {
  const s = flip ? -scale : scale;
  return `
    <g transform="translate(${x},${y}) scale(${s},${scale})" opacity="${opacity}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round">
      <path d="M0 0 C5 -8 15 -12 25 -10"/>
      <path d="M8 -6 C5 -14 8 -18 12 -20"/>
      <path d="M16 -9 C18 -17 22 -18 26 -17"/>
      <path d="M6 -4 C2 -10 4 -16 7 -18" />
      <circle cx="12" cy="-21" r="2" fill="${color}" opacity="0.5"/>
      <circle cx="26" cy="-18" r="2.5" fill="${color}" opacity="0.5"/>
      <circle cx="7" cy="-19" r="1.8" fill="${color}" opacity="0.4"/>
    </g>`;
}

// ─── Customer Rich Menu SVG (2 cards: RESERVATION + WEBSITE) ───

function generateCustomerMenuSvg(): string {
  const W = 2500;
  const H = 843;
  const pad = 35;
  const gap = 30;

  // Left card ~63%, right card ~37%
  const leftW = Math.round((W - pad * 2 - gap) * 0.63);
  const rightW = W - pad * 2 - gap - leftW;
  const cardH = H - pad * 2;
  const r = 32;

  const leftCx = pad + leftW / 2;
  const rightX = pad + leftW + gap;
  const rightCx = rightX + rightW / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDF6F3"/>
      <stop offset="40%" stop-color="#F9EBE5"/>
      <stop offset="100%" stop-color="#F0D8CF"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="white" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#FFF8F6" stop-opacity="0.75"/>
    </linearGradient>
    <linearGradient id="pill" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${BRAND}"/>
      <stop offset="100%" stop-color="${BRAND_DARK}"/>
    </linearGradient>
    <filter id="card-shadow" x="-2%" y="-2%" width="104%" height="108%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#C8988A" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Decorative background elements -->
  <circle cx="60" cy="100" r="140" fill="${BRAND_LIGHT}" opacity="0.35"/>
  <circle cx="${W - 80}" cy="${H - 60}" r="180" fill="${BRAND_LIGHT}" opacity="0.3"/>
  <circle cx="${W * 0.4}" cy="30" r="60" fill="${BRAND}" opacity="0.06"/>
  <circle cx="${W * 0.7}" cy="${H}" r="100" fill="${BRAND}" opacity="0.08"/>
  ${svgFlower(180, H - 120, 18, BRAND_LIGHT, 0.5)}
  ${svgFlower(W - 200, 100, 14, BRAND_LIGHT, 0.4)}
  ${svgFlower(W * 0.45, H - 50, 12, BRAND, 0.15)}
  ${svgBranch(80, H - 40, 2.5, false, BRAND, 0.2)}
  ${svgBranch(W - 120, 80, 2, true, BRAND, 0.18)}

  <!-- LEFT CARD: RESERVATION -->
  <rect x="${pad}" y="${pad}" width="${leftW}" height="${cardH}" rx="${r}" fill="url(#card)" filter="url(#card-shadow)" stroke="white" stroke-width="1.5"/>

  <!-- "RESERVATION" title -->
  <text x="${leftCx}" y="${pad + cardH * 0.28}" text-anchor="middle" font-family="${FONT}" font-size="68" font-weight="700" fill="${TEXT}" letter-spacing="6" font-style="italic">RESERVATION</text>

  <!-- Nail icon (left of center) -->
  <svg x="${leftCx - 220}" y="${pad + cardH * 0.34}" width="64" height="64" viewBox="0 0 24 24">${ICON_NAIL}</svg>

  <!-- "我要預約" -->
  <text x="${leftCx}" y="${pad + cardH * 0.52}" text-anchor="middle" font-family="${FONT}" font-size="48" font-weight="500" fill="${TEXT}">我要預約</text>

  <!-- Lash icon (right of center) -->
  <svg x="${leftCx + 140}" y="${pad + cardH * 0.34}" width="72" height="72" viewBox="0 0 24 24">${ICON_LASH}</svg>

  <!-- CTA pill button -->
  <rect x="${leftCx - 180}" y="${pad + cardH * 0.66}" width="360" height="64" rx="32" fill="url(#pill)" opacity="0.85"/>
  <text x="${leftCx}" y="${pad + cardH * 0.66 + 41}" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="500" fill="white" letter-spacing="2">立即預約 Book Now</text>

  <!-- Small decorative flowers on left card -->
  ${svgFlower(pad + 60, pad + cardH - 70, 10, BRAND, 0.18)}
  ${svgBranch(pad + leftW - 100, pad + cardH - 30, 1.8, true, BRAND, 0.15)}

  <!-- RIGHT CARD: WEBSITE -->
  <rect x="${rightX}" y="${pad}" width="${rightW}" height="${cardH}" rx="${r}" fill="url(#card)" filter="url(#card-shadow)" stroke="white" stroke-width="1.5"/>

  <!-- "WEBSITE" title -->
  <text x="${rightCx}" y="${pad + cardH * 0.28}" text-anchor="middle" font-family="${FONT}" font-size="52" font-weight="700" fill="${TEXT}" letter-spacing="4">WEBSITE</text>

  <!-- "官網" -->
  <text x="${rightCx}" y="${pad + cardH * 0.45}" text-anchor="middle" font-family="${FONT}" font-size="42" font-weight="500" fill="${TEXT}">官網</text>

  <!-- Globe icon -->
  <svg x="${rightCx - 44}" y="${pad + cardH * 0.50}" width="88" height="88" viewBox="0 0 24 24">${ICON_GLOBE}</svg>

  <!-- Decorative branches around globe -->
  ${svgBranch(rightCx - 60, pad + cardH * 0.78, 2.2, false, BRAND, 0.25)}
  ${svgBranch(rightCx + 60, pad + cardH * 0.78, 2.2, true, BRAND, 0.25)}
  ${svgFlower(rightCx - 30, pad + cardH * 0.85, 8, BRAND, 0.2)}
  ${svgFlower(rightCx + 35, pad + cardH * 0.82, 6, BRAND, 0.15)}
</svg>`;
}

// ─── Artist Rich Menu SVG (3 equal cards) ───

function generateArtistMenuSvg(): string {
  const W = 2500;
  const H = 843;
  const pad = 35;
  const gap = 25;
  const cardH = H - pad * 2;
  const cardW = (W - pad * 2 - gap * 2) / 3;
  const r = 32;

  function artistCard(x: number, icon: string, en: string, zh: string): string {
    const cx = x + cardW / 2;
    return `
      <rect x="${x}" y="${pad}" width="${cardW}" height="${cardH}" rx="${r}" fill="url(#card)" filter="url(#card-shadow)" stroke="white" stroke-width="1.5"/>
      <text x="${cx}" y="${pad + cardH * 0.30}" text-anchor="middle" font-family="${FONT}" font-size="40" font-weight="700" fill="${TEXT}" letter-spacing="3">${en}</text>
      <text x="${cx}" y="${pad + cardH * 0.48}" text-anchor="middle" font-family="${FONT}" font-size="32" font-weight="400" fill="${TEXT_LIGHT}">${zh}</text>
      <svg x="${cx - 36}" y="${pad + cardH * 0.56}" width="72" height="72" viewBox="0 0 24 24">${icon}</svg>
    `;
  }

  // Artist icons
  const iconDashboard = `<g stroke="${TEXT}" stroke-width="2" fill="none"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></g>`;
  const iconUser = `<g stroke="${TEXT}" stroke-width="2" fill="none" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2"/><circle cx="12" cy="7" r="4"/></g>`;
  const iconSettings = `<g stroke="${TEXT}" stroke-width="1.8" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDF6F3"/>
      <stop offset="40%" stop-color="#F9EBE5"/>
      <stop offset="100%" stop-color="#F0D8CF"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="white" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#FFF8F6" stop-opacity="0.75"/>
    </linearGradient>
    <filter id="card-shadow" x="-2%" y="-2%" width="104%" height="108%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#C8988A" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="50" cy="80" r="120" fill="${BRAND_LIGHT}" opacity="0.3"/>
  <circle cx="${W - 60}" cy="${H - 50}" r="140" fill="${BRAND_LIGHT}" opacity="0.25"/>
  ${svgFlower(150, H - 80, 14, BRAND, 0.15)}
  ${svgFlower(W - 180, 90, 12, BRAND, 0.12)}
  ${artistCard(pad, iconDashboard, "DASHBOARD", "接案總覽")}
  ${artistCard(pad + cardW + gap, iconUser, "PROFILE", "個人資料")}
  ${artistCard(pad + (cardW + gap) * 2, iconSettings, "SETTINGS", "帳號設定")}
</svg>`;
}

async function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// ─── Customer Rich Menu (2 areas: RESERVATION + WEBSITE) ───
const CUSTOMER_MENU_CONFIG: messagingApi.RichMenuRequest = {
  size: { width: 2500, height: 843 },
  selected: true,
  name: "NaLi Match — 客戶選單",
  chatBarText: "立即找設計師",
  areas: [
    {
      // Left card (~63%): RESERVATION → LIFF customer form
      bounds: { x: 0, y: 0, width: 1575, height: 843 },
      action: {
        type: "uri",
        uri: `https://liff.line.me/${LIFF_ID}/customer-form`,
      },
    },
    {
      // Right card (~37%): WEBSITE → homepage
      bounds: { x: 1575, y: 0, width: 925, height: 843 },
      action: { type: "uri", uri: `${APP_URL}` },
    },
  ],
};

// ─── Artist Rich Menu (3 equal areas) ───
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
