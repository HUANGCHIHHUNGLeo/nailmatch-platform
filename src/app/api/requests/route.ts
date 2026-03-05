import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { serviceRequestSchema } from "@/lib/utils/form-schema";
import { findMatchingArtists } from "@/lib/utils/matching";
import { notifyArtistsOfNewRequest } from "@/lib/line/messaging";

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

    // Anonymous request - create temp customer
    const { data: newCustomer, error: custError } = await supabase
      .from("customers")
      .insert({ display_name: "Anonymous" })
      .select("id")
      .single();

    if (custError || !newCustomer) {
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
    const customerId = newCustomer.id;

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
