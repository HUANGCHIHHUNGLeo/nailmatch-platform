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

// ─── Brand colors (matches Flex Message style) ───
const BRAND = "#D4A0A0";
const BRAND_DARK = "#B88A8A";
const BG = "#FAF7F5";
const BG_ACCENT = "#F5E6E0";
const TEXT_DARK = "#1a1a1a";
const TEXT_MUTED = "#999999";
const DIVIDER = "#E8E0DC";

// ─── SVG icons (simple, clean) ───
const ICONS = {
  sparkles: `<path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="${BRAND}" stroke="${BRAND_DARK}" stroke-width="1"/>`,
  users: `<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" fill="none" stroke="${BRAND}" stroke-width="2"/><path d="M22 21v-2a4 4 0 00-3-3.87" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/><path d="M16 3.13a4 4 0 010 7.75" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/>`,
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="${BRAND}" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="${BRAND}" stroke-width="2"/>`,
  dashboard: `<rect x="3" y="3" width="7" height="9" rx="1" fill="none" stroke="${BRAND}" stroke-width="2"/><rect x="14" y="3" width="7" height="5" rx="1" fill="none" stroke="${BRAND}" stroke-width="2"/><rect x="14" y="12" width="7" height="9" rx="1" fill="none" stroke="${BRAND}" stroke-width="2"/><rect x="3" y="16" width="7" height="5" rx="1" fill="none" stroke="${BRAND}" stroke-width="2"/>`,
  user: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" fill="none" stroke="${BRAND}" stroke-width="2"/>`,
  settings: `<circle cx="12" cy="12" r="3" fill="none" stroke="${BRAND}" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke="${BRAND}" stroke-width="1.5"/>`,
};

function renderSvgButton(
  icon: string,
  label: string,
  sublabel: string,
  x: number,
  width: number,
  height: number
): string {
  const cx = x + width / 2;
  const iconY = height * 0.3;
  const labelY = height * 0.62;
  const subY = height * 0.78;

  return `
    <g>
      <svg x="${cx - 20}" y="${iconY - 20}" width="40" height="40" viewBox="0 0 24 24">
        ${icon}
      </svg>
      <text x="${cx}" y="${labelY}" text-anchor="middle" font-family="'Noto Sans TC', 'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="600" fill="${TEXT_DARK}">${label}</text>
      <text x="${cx}" y="${subY}" text-anchor="middle" font-family="'Noto Sans TC', 'Helvetica Neue', Arial, sans-serif" font-size="18" fill="${TEXT_MUTED}">${sublabel}</text>
    </g>
  `;
}

function generateRichMenuSvg(
  buttons: { icon: string; label: string; sublabel: string }[],
  title: string
): string {
  const W = 2500;
  const H = 843;
  const cols = buttons.length;
  const colW = W / cols;

  const dividers = [];
  for (let i = 1; i < cols; i++) {
    dividers.push(
      `<line x1="${colW * i}" y1="${H * 0.15}" x2="${colW * i}" y2="${H * 0.85}" stroke="${DIVIDER}" stroke-width="2"/>`
    );
  }

  const buttonsSvg = buttons
    .map((btn, i) =>
      renderSvgButton(btn.icon, btn.label, btn.sublabel, colW * i, colW, H)
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="${BG_ACCENT}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="${W / 2}" y="${H * 0.1}" text-anchor="middle" font-family="'Noto Sans TC', 'Helvetica Neue', Arial, sans-serif" font-size="20" fill="${TEXT_MUTED}" letter-spacing="3">${title}</text>
  ${dividers.join("\n")}
  ${buttonsSvg}
</svg>`;
}

async function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// ─── Customer Rich Menu ───
const CUSTOMER_BUTTONS = [
  { icon: ICONS.sparkles, label: "發佈需求", sublabel: "找設計師服務" },
  { icon: ICONS.users, label: "設計師總覽", sublabel: "瀏覽各地設計師" },
  { icon: ICONS.calendar, label: "我的帳號", sublabel: "需求・預約紀錄" },
];

const CUSTOMER_MENU_CONFIG: messagingApi.RichMenuRequest = {
  size: { width: 2500, height: 843 },
  selected: true,
  name: "NaLi Match — 客戶選單",
  chatBarText: "NaLi Match 選單",
  areas: [
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: {
        type: "uri",
        uri: `https://liff.line.me/${LIFF_ID}/customer-form`,
      },
    },
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: { type: "uri", uri: `${APP_URL}/artists` },
    },
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: { type: "uri", uri: `${APP_URL}/my` },
    },
  ],
};

// ─── Artist Rich Menu ───
const ARTIST_BUTTONS = [
  { icon: ICONS.dashboard, label: "接案總覽", sublabel: "查看新需求" },
  { icon: ICONS.user, label: "個人資料", sublabel: "編輯公開檔案" },
  { icon: ICONS.settings, label: "帳號設定", sublabel: "接案管理" },
];

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
  const existing = await client.getRichMenuList();
  for (const menu of existing) {
    await client.deleteRichMenu(menu.richMenuId);
  }

  // Create customer menu
  const customerMenu = await client.createRichMenu(CUSTOMER_MENU_CONFIG);
  const customerSvg = generateRichMenuSvg(CUSTOMER_BUTTONS, "NaLi Match ─ 美甲美睫媒合");
  const customerPng = await svgToPng(customerSvg);
  await blobClient.setRichMenuImage(customerMenu.richMenuId, customerPng, "image/png");
  await client.setDefaultRichMenu(customerMenu.richMenuId);

  // Create artist menu
  const artistMenu = await client.createRichMenu(ARTIST_MENU_CONFIG);
  const artistSvg = generateRichMenuSvg(ARTIST_BUTTONS, "NaLi Match ─ 設計師後台");
  const artistPng = await svgToPng(artistSvg);
  await blobClient.setRichMenuImage(artistMenu.richMenuId, artistPng, "image/png");

  return {
    customerMenuId: customerMenu.richMenuId,
    artistMenuId: artistMenu.richMenuId,
  };
}

// Link artist rich menu to a specific user
export async function linkArtistRichMenu(userId: string): Promise<void> {
  // Find the artist rich menu
  const menus = await client.getRichMenuList();
  const artistMenu = menus.find((m) => m.name === "NaLi Match — 設計師選單");
  if (artistMenu) {
    await client.linkRichMenuIdToUser(userId, artistMenu.richMenuId);
  }
}

// Unlink artist rich menu (revert to default customer menu)
export async function unlinkArtistRichMenu(userId: string): Promise<void> {
  await client.unlinkRichMenuIdFromUser(userId);
}
