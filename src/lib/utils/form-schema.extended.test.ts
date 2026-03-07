import { describe, it, expect } from "vitest";
import {
  serviceRequestSchema,
  artistRegistrationSchema,
  artistQuoteSchema,
} from "./form-schema";

// ─── Service Request Schema ─────────────────────────────────

describe("serviceRequestSchema — edge cases", () => {
  const validData = {
    locations: ["台北市 大安區"],
    services: ["單色凝膠"],
    customerGender: "女生",
    preferredStyles: ["韓系清新"],
    preferredDate: "今天",
    preferredTime: "下午",
    artistGenderPref: "不限",
    budgetRange: "NT$800-1200",
    needsRemoval: "不需要",
    customerName: "王小明",
    consentAccepted: true,
  };

  it("accepts minimal valid data", () => {
    const result = serviceRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts full data with all optional fields", () => {
    const result = serviceRequestSchema.safeParse({
      ...validData,
      nailLength: "中長甲",
      referenceImages: ["https://example.com/img1.jpg"],
      paymentPreference: ["現金", "LINE Pay"],
      additionalNotes: "希望有安靜的環境",
      customerPhone: "0912345678",
      preferredDateCustom: "2026-03-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty locations array", () => {
    const result = serviceRequestSchema.safeParse({ ...validData, locations: [] });
    expect(result.success).toBe(false);
  });

  it("rejects empty services array", () => {
    const result = serviceRequestSchema.safeParse({ ...validData, services: [] });
    expect(result.success).toBe(false);
  });

  it("rejects empty preferredStyles array", () => {
    const result = serviceRequestSchema.safeParse({ ...validData, preferredStyles: [] });
    expect(result.success).toBe(false);
  });

  it("rejects when consent is false", () => {
    const result = serviceRequestSchema.safeParse({ ...validData, consentAccepted: false });
    expect(result.success).toBe(false);
  });

  it("rejects missing customerName", () => {
    const result = serviceRequestSchema.safeParse({ ...validData, customerName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing required string fields", () => {
    const fieldsToTest = [
      "customerGender",
      "preferredDate",
      "preferredTime",
      "artistGenderPref",
      "budgetRange",
      "needsRemoval",
    ];

    for (const field of fieldsToTest) {
      const result = serviceRequestSchema.safeParse({ ...validData, [field]: "" });
      expect(result.success).toBe(false);
    }
  });

  it("allows multiple locations", () => {
    const result = serviceRequestSchema.safeParse({
      ...validData,
      locations: ["台北市 大安區", "台北市 信義區", "新北市 板橋區"],
    });
    expect(result.success).toBe(true);
  });

  it("allows multiple services", () => {
    const result = serviceRequestSchema.safeParse({
      ...validData,
      services: ["單色凝膠", "貓眼美甲", "法式美甲"],
    });
    expect(result.success).toBe(true);
  });
});

// ─── Artist Registration Schema ─────────────────────────────

describe("artistRegistrationSchema", () => {
  const validArtist = {
    displayName: "設計師 Amy",
    gender: "女生",
    phone: "0912345678",
    email: "amy@example.com",
    cities: ["台北市 大安區"],
    serviceLocationType: "studio",
    studioAddress: "Amy Nail Studio",
    services: ["單色凝膠"],
    styles: ["韓系清新"],
    minPrice: 500,
    maxPrice: 2000,
    instagramHandle: "@amynails",
    paymentMethods: ["現金"],
  };

  it("accepts valid artist data with Instagram", () => {
    const result = artistRegistrationSchema.safeParse(validArtist);
    expect(result.success).toBe(true);
  });

  it("accepts valid artist data with LINE ID only", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      instagramHandle: "",
      lineId: "amy_nails",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when neither Instagram nor LINE ID provided", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      instagramHandle: "",
      lineId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      minPrice: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty display name", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      displayName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty cities", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      cities: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty services", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      services: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty styles", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      styles: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty payment methods", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      paymentMethods: [],
    });
    expect(result.success).toBe(false);
  });
});

// ─── Artist Quote Schema ─────────────────────────────────

describe("artistQuoteSchema", () => {
  it("accepts valid quote data", () => {
    const result = artistQuoteSchema.safeParse({
      quotedPrice: 1500,
      message: "很高興為您服務！",
      availableTime: "明天下午 2:00",
    });
    expect(result.success).toBe(true);
  });

  it("accepts quote without message", () => {
    const result = artistQuoteSchema.safeParse({
      quotedPrice: 800,
      availableTime: "今天晚上",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero price", () => {
    const result = artistQuoteSchema.safeParse({
      quotedPrice: 0,
      availableTime: "明天",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = artistQuoteSchema.safeParse({
      quotedPrice: -500,
      availableTime: "明天",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty available time (now optional)", () => {
    const result = artistQuoteSchema.safeParse({
      quotedPrice: 1000,
      availableTime: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing price", () => {
    const result = artistQuoteSchema.safeParse({
      availableTime: "明天",
    });
    expect(result.success).toBe(false);
  });
});
