import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  // 追蹤 10% 的請求效能
  tracesSampleRate: 0.1,

  // 開發環境不送
  debug: false,

  // 忽略常見的非錯誤噪音
  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error promise rejection",
    "Load failed",
    "Failed to fetch",
  ],
});
