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

// Parse budget range string to min/max values
function parseBudgetRange(budget: string): { min: number; max: number } {
  const ranges: Record<string, { min: number; max: number }> = {
    "NT$500-800": { min: 500, max: 800 },
    "NT$800-1200": { min: 800, max: 1200 },
    "NT$1200-2000": { min: 1200, max: 2000 },
    "NT$2000-3500": { min: 2000, max: 3500 },
    "NT$3500+": { min: 3500, max: 99999 },
  };
  return ranges[budget] || { min: 0, max: 99999 };
}

// Find artists matching the service request criteria
export async function findMatchingArtists(
  criteria: MatchCriteria
): Promise<MatchedArtist[]> {
  const supabase = await createServiceClient();
  const budget = parseBudgetRange(criteria.budget_range);

  let query = supabase
    .from("artists")
    .select("id, line_user_id, display_name, avatar_url, services, min_price, max_price, cities, gender, styles")
    .eq("is_active", true)
    .eq("is_verified", true);

  // Filter by location overlap
  if (criteria.locations.length > 0) {
    query = query.overlaps("cities", criteria.locations);
  }

  // Filter by service overlap
  if (criteria.services.length > 0) {
    query = query.overlaps("services", criteria.services);
  }

  // Filter by gender preference
  if (criteria.artist_gender_pref && criteria.artist_gender_pref !== "不限") {
    const genderMap: Record<string, string> = {
      "女性": "female",
      "男性": "male",
    };
    const gender = genderMap[criteria.artist_gender_pref];
    if (gender) {
      query = query.eq("gender", gender);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error finding matching artists:", error);
    return [];
  }

  // Further filter by budget compatibility
  return (data || []).filter((artist) => {
    return artist.min_price <= budget.max && artist.max_price >= budget.min;
  });
}
