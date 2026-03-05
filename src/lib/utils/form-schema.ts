import { z } from "zod";

// Customer service request form validation schema
export const serviceRequestSchema = z.object({
  // Step 1: 服務地點
  locations: z.array(z.string()).min(1, "請選擇至少一個服務地點"),

  // Step 2: 服務項目
  services: z.array(z.string()).min(1, "請選擇至少一個服務項目"),

  // Step 3: 客戶性別
  customerGender: z.string().min(1, "請選擇性別"),

  // Step 4: 指甲長度
  nailLength: z.string().min(1, "請選擇指甲長度"),

  // Step 5: 偏好風格
  preferredStyles: z.array(z.string()).min(1, "請選擇至少一個偏好風格"),

  // Step 6: 預約時間
  preferredDate: z.string().min(1, "請選擇預約日期"),
  preferredTime: z.string().min(1, "請選擇預約時段"),
  preferredDateCustom: z.string().optional(),

  // Step 7: 美甲師性別偏好
  artistGenderPref: z.string().min(1, "請選擇偏好"),

  // Step 8: 預算範圍
  budgetRange: z.string().min(1, "請選擇預算範圍"),

  // Step 9: 是否需要卸甲
  needsRemoval: z.string().min(1, "請選擇卸甲需求"),

  // Step 10: 參考圖片 (optional)
  referenceImages: z.array(z.string()).optional().default([]),

  // Step 11: 補充需求 (optional)
  additionalNotes: z.string().optional().default(""),
});

export type ServiceRequestFormData = z.input<typeof serviceRequestSchema>;

// Artist registration form validation
export const artistRegistrationSchema = z.object({
  displayName: z.string().min(1, "請輸入名稱"),
  gender: z.string().min(1, "請選擇性別"),
  phone: z.string().min(1, "請輸入電話"),
  email: z.string().email("請輸入有效的 Email").optional().or(z.literal("")),
  bio: z.string().optional().default(""),
  cities: z.array(z.string()).min(1, "請選擇至少一個服務地區"),
  serviceLocationType: z.string().min(1, "請選擇服務地點類型"),
  studioAddress: z.string().optional().default(""),
  services: z.array(z.string()).min(1, "請選擇至少一個服務項目"),
  styles: z.array(z.string()).min(1, "請選擇至少一個擅長風格"),
  minPrice: z.number().min(0, "價格不能為負數"),
  maxPrice: z.number().min(0, "價格不能為負數"),
  instagramHandle: z.string().optional().default(""),
});

export type ArtistRegistrationFormData = z.input<typeof artistRegistrationSchema>;

// Artist quote form
export const artistQuoteSchema = z.object({
  quotedPrice: z.number().min(1, "請輸入報價金額"),
  message: z.string().optional().default(""),
  availableTime: z.string().min(1, "請選擇可服務時間"),
});

export type ArtistQuoteFormData = z.input<typeof artistQuoteSchema>;
