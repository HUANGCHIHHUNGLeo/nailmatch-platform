import { describe, it, expect } from "vitest";
import {
  serviceRequestSchema,
  artistRegistrationSchema,
  artistQuoteSchema,
} from "./form-schema";

const validServiceRequest = {
  locations: ["台北市 大安區"],
  services: ["單色凝膠"],
  customerGender: "女生",
  nailLength: "短甲",
  preferredStyles: ["韓系清新"],
  preferredDate: "今天",
  preferredTime: "下午",
  artistGenderPref: "不限",
  budgetRange: "NT$800-1200",
  needsRemoval: "不需要",
  referenceImages: [],
  paymentPreference: ["現金"],
  additionalNotes: "",
  customerName: "測試用戶",
  customerPhone: "0912345678",
  consentAccepted: true,
};

describe("serviceRequestSchema", () => {
  it("validates a complete valid request", () => {
    const result = serviceRequestSchema.safeParse(validServiceRequest);
    expect(result.success).toBe(true);
  });

  it("rejects empty locations", () => {
    const result = serviceRequestSchema.safeParse({
      ...validServiceRequest,
      locations: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty services", () => {
    const result = serviceRequestSchema.safeParse({
      ...validServiceRequest,
      services: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing customerGender", () => {
    const result = serviceRequestSchema.safeParse({
      ...validServiceRequest,
      customerGender: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects consent not accepted", () => {
    const result = serviceRequestSchema.safeParse({
      ...validServiceRequest,
      consentAccepted: false,
    });
    expect(result.success).toBe(false);
  });

  it("allows optional fields to be omitted", () => {
    const { nailLength, referenceImages, additionalNotes, paymentPreference, customerPhone, ...required } =
      validServiceRequest;
    const result = serviceRequestSchema.safeParse(required);
    expect(result.success).toBe(true);
  });
});

describe("artistRegistrationSchema", () => {
  const validArtist = {
    displayName: "美甲師A",
    gender: "女生",
    phone: "0912345678",
    email: "test@example.com",
    bio: "",
    cities: ["台北市 大安區"],
    serviceLocationType: "店面",
    studioAddress: "測試美甲工作室",
    services: ["單色凝膠"],
    styles: ["韓系清新"],
    minPrice: 800,
    maxPrice: 2000,
    instagramHandle: "@test",
    lineId: "",
    paymentMethods: ["現金"],
  };

  it("validates a complete valid artist", () => {
    const result = artistRegistrationSchema.safeParse(validArtist);
    expect(result.success).toBe(true);
  });

  it("rejects missing displayName", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      displayName: "",
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

  it("rejects negative prices", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      minPrice: -100,
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one of Instagram or LINE ID", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      instagramHandle: "",
      lineId: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts LINE ID without Instagram", () => {
    const result = artistRegistrationSchema.safeParse({
      ...validArtist,
      instagramHandle: "",
      lineId: "@lineid",
    });
    expect(result.success).toBe(true);
  });
});

describe("artistQuoteSchema", () => {
  it("validates a valid quote", () => {
    const result = artistQuoteSchema.safeParse({
      quotedPrice: 1500,
      message: "可以為您服務",
      availableTime: "下午 2:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero price", () => {
    const result = artistQuoteSchema.safeParse({
      quotedPrice: 0,
      availableTime: "下午",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty availableTime (now optional)", () => {
    const result = artistQuoteSchema.safeParse({
      quotedPrice: 1000,
      availableTime: "",
    });
    expect(result.success).toBe(true);
  });
});
