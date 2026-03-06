import { createServiceClient } from "@/lib/supabase/server";

interface MatchCriteria {
  locations: string[];
  services: string[];
  budget_range: string;
  artist_gender_pref: string;
  preferred_styles?: string[];
}

interface MatchedArtist {
  id: string;
  line_user_id: string;
  display_name: string;
  avatar_url: string | null;
  services: string[];
  min_price: number;
  max_price: number;
  cities: string[];
}

// Find artists matching the service request by location only.
// Other criteria (services, budget, gender) are shown to both sides
// so they can decide themselves whether to proceed.
export async function findMatchingArtists(
  criteria: MatchCriteria
): Promise<MatchedArtist[]> {
  const supabase = await createServiceClient();

  let query = supabase
    .from("artists")
    .select("id, line_user_id, display_name, avatar_url, services, min_price, max_price, cities, gender, styles")
    .eq("is_active", true)
    .eq("is_verified", true)
    .not("line_user_id", "is", null);

  // Only filter by location overlap — let humans decide the rest
  if (criteria.locations.length > 0) {
    query = query.overlaps("cities", criteria.locations);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error finding matching artists:", error);
    return [];
  }

  return data || [];
}
