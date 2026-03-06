import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { serviceRequestSchema } from "@/lib/utils/form-schema";
import { findMatchingArtists } from "@/lib/utils/matching";
import { notifyArtistsOfNewRequest } from "@/lib/line/messaging";
import { getLineUserId } from "@/lib/line/verify-token";
import { resolveCustomer } from "@/lib/auth/resolve-customer";

export async function GET(request: Request) {
  try {
    const customer = await resolveCustomer(request);
    if (!customer) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const supabase = await createServiceClient();

    // Fetch all requests for this customer
    const { data: requests, error } = await supabase
      .from("service_requests")
      .select("id, services, locations, budget_range, preferred_date, preferred_time, status, created_at, notified_count")
      .eq("customer_id", customer.customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch customer requests error:", error);
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }

    // Get response counts for each request
    const requestIds = (requests || []).map((r) => r.id);
    let responseCounts: Record<string, number> = {};

    if (requestIds.length > 0) {
      const { data: responses } = await supabase
        .from("artist_responses")
        .select("request_id")
        .in("request_id", requestIds);

      if (responses) {
        for (const r of responses) {
          responseCounts[r.request_id] = (responseCounts[r.request_id] || 0) + 1;
        }
      }
    }

    const enriched = (requests || []).map((req) => ({
      ...req,
      response_count: responseCounts[req.id] || 0,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Requests GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate form data
    const parsed = serviceRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Resolve customer identity (LINE auth or anonymous)
    const lineUserId = getLineUserId(request);
    const lineProfile = body.lineProfile as
      | { displayName?: string; pictureUrl?: string }
      | undefined;
    let customerId: string;

    if (lineUserId) {
      // LINE authenticated — find existing customer or create new one
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("line_user_id", lineUserId)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        // Update profile info from LINE
        if (lineProfile?.displayName) {
          await supabase
            .from("customers")
            .update({
              display_name: lineProfile.displayName,
              ...(lineProfile.pictureUrl
                ? { avatar_url: lineProfile.pictureUrl }
                : {}),
            })
            .eq("id", customerId);
        }
      } else {
        // First time — create customer with LINE identity
        const { data: newCustomer, error: custError } = await supabase
          .from("customers")
          .insert({
            line_user_id: lineUserId,
            display_name: lineProfile?.displayName || "LINE User",
            avatar_url: lineProfile?.pictureUrl || null,
          })
          .select("id")
          .single();

        if (custError || !newCustomer) {
          return NextResponse.json(
            { error: "Failed to create customer" },
            { status: 500 }
          );
        }
        customerId = newCustomer.id;
      }
    } else {
      // Anonymous request — no LINE identity
      const displayName = parsed.data.customerName || "Anonymous";
      const { data: newCustomer, error: custError } = await supabase
        .from("customers")
        .insert({ display_name: displayName })
        .select("id")
        .single();

      if (custError || !newCustomer) {
        return NextResponse.json(
          { error: "Failed to create customer" },
          { status: 500 }
        );
      }
      customerId = newCustomer.id;
    }

    // Create service request
    const { data: serviceRequest, error: insertError } = await supabase
      .from("service_requests")
      .insert({
        customer_id: customerId,
        locations: parsed.data.locations,
        services: parsed.data.services,
        customer_gender: parsed.data.customerGender,
        nail_length: parsed.data.nailLength,
        preferred_styles: parsed.data.preferredStyles,
        preferred_date: parsed.data.preferredDate,
        preferred_time: parsed.data.preferredTime,
        preferred_date_custom: parsed.data.preferredDateCustom || null,
        artist_gender_pref: parsed.data.artistGenderPref,
        budget_range: parsed.data.budgetRange,
        needs_removal: parsed.data.needsRemoval,
        reference_images: parsed.data.referenceImages || [],
        additional_notes: parsed.data.additionalNotes || "",
        payment_preference: parsed.data.paymentPreference || [],
        customer_name: parsed.data.customerName || null,
        customer_phone: parsed.data.customerPhone || null,
        consented_at: parsed.data.consentAccepted ? new Date().toISOString() : null,
        status: "matching",
      })
      .select("id")
      .single();

    if (insertError || !serviceRequest) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }

    // Find matching artists and notify them
    const matchingArtists = await findMatchingArtists({
      locations: parsed.data.locations,
      services: parsed.data.services,
      budget_range: parsed.data.budgetRange,
      artist_gender_pref: parsed.data.artistGenderPref,
      preferred_styles: parsed.data.preferredStyles,
    });

    // If customer specified a preferred artist, ensure they are included
    const preferredArtistId = body.preferredArtistId as string | undefined;
    if (preferredArtistId && !matchingArtists.some((a) => a.id === preferredArtistId)) {
      const { data: prefArtist } = await supabase
        .from("artists")
        .select("id, line_user_id, display_name, avatar_url, services, min_price, max_price, cities")
        .eq("id", preferredArtistId)
        .eq("is_active", true)
        .eq("is_verified", true)
        .single();
      if (prefArtist) {
        matchingArtists.unshift(prefArtist);
      }
    }

    // Update notified count
    await supabase
      .from("service_requests")
      .update({ notified_count: matchingArtists.length })
      .eq("id", serviceRequest.id);

    // Send LINE notifications to matching artists
    const artistLineIds = matchingArtists
      .map((a) => a.line_user_id)
      .filter(Boolean) as string[];

    if (artistLineIds.length > 0) {
      await notifyArtistsOfNewRequest(artistLineIds, {
        services: parsed.data.services,
        location: parsed.data.locations.join("、"),
        budget: parsed.data.budgetRange,
        date: parsed.data.preferredDate,
        requestId: serviceRequest.id,
      }).catch((err) => {
        console.error("Failed to send LINE notifications:", err);
      });
    }

    return NextResponse.json({
      id: serviceRequest.id,
      matchedArtists: matchingArtists.length,
    });
  } catch (error) {
    console.error("Request API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
