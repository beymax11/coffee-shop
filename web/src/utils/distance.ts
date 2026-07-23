/**
 * Distance Calculation Utility from Origin:
 * J.P Rizal Street, Poblacion 3, Tiaong, 4325 Quezon
 *
 * Rate Policy:
 * - First 6.0 km = FREE (₱0)
 * - Excess beyond 6.0 km = ₱80 per 1.0 km
 */

export interface DistanceResult {
  distanceKm: number;
  transpoFee: number;
  areaLabel: string;
}

export function calculateAccurateDistance(
  street: string = "",
  barangay: string = "",
  city: string = "",
  province: string = ""
): DistanceResult {
  const s = street.trim().toLowerCase();
  const b = barangay.trim().toLowerCase();
  const c = city.trim().toLowerCase();
  const p = province.trim().toLowerCase();

  const fullText = `${s} ${b} ${c} ${p}`.trim();
  if (!fullText) {
    return { distanceKm: 0, transpoFee: 0, areaLabel: "No address entered" };
  }

  let distanceKm = 0;
  let areaLabel = "Calculated Location";

  // 1. TIAONG (Origin Municipality)
  if (
    c.includes("tiaong") ||
    (!c && (p.includes("quezon") || !p) && (b.includes("poblacion") || b.includes("lalig") || b.includes("ayusan") || b.includes("san agustin") || b.includes("lusacan")))
  ) {
    if (
      b.includes("poblacion") ||
      b.includes("lalig") ||
      b.includes("san agustin") ||
      b.includes("ayusan") ||
      b.includes("lusacan") ||
      b.includes("talepan") ||
      b.includes("bula") ||
      b.includes("anastacia") ||
      b.includes("palagaran") ||
      b.includes("san juan") ||
      !b
    ) {
      distanceKm = 4.0;
      areaLabel = "Tiaong Town Center (Within 6km Free Zone)";
    } else if (
      b.includes("cabay") ||
      b.includes("del rosario") ||
      b.includes("behia") ||
      b.includes("san pedro") ||
      b.includes("quipot") ||
      b.includes("villa hermosa") ||
      b.includes("san jose") ||
      b.includes("san francisco") ||
      b.includes("tamisan") ||
      b.includes("aquino") ||
      b.includes("san isidro")
    ) {
      distanceKm = 8.5;
      areaLabel = "Tiaong Outer Barangay";
    } else {
      distanceKm = 5.0;
      areaLabel = "Tiaong Area";
    }
  }
  // 2. QUEZON PROVINCE
  else if (c.includes("candelaria")) { distanceKm = 12.0; areaLabel = "Candelaria, Quezon"; }
  else if (c.includes("san antonio")) { distanceKm = 13.5; areaLabel = "San Antonio, Quezon"; }
  else if (c.includes("dolores")) { distanceKm = 14.0; areaLabel = "Dolores, Quezon"; }
  else if (c.includes("sariaya")) { distanceKm = 25.0; areaLabel = "Sariaya, Quezon"; }
  else if (c.includes("lucena")) { distanceKm = 36.0; areaLabel = "Lucena City, Quezon"; }
  else if (c.includes("tayabas")) { distanceKm = 40.0; areaLabel = "Tayabas City, Quezon"; }
  else if (c.includes("pagbilao")) { distanceKm = 45.0; areaLabel = "Pagbilao, Quezon"; }
  else if (c.includes("lucban")) { distanceKm = 55.0; areaLabel = "Lucban, Quezon"; }
  else if (c.includes("sampaloc")) { distanceKm = 65.0; areaLabel = "Sampaloc, Quezon"; }
  else if (c.includes("atimonan")) { distanceKm = 75.0; areaLabel = "Atimonan, Quezon"; }
  else if (c.includes("mauban")) { distanceKm = 80.0; areaLabel = "Mauban, Quezon"; }
  else if (c.includes("gumaca")) { distanceKm = 98.0; areaLabel = "Gumaca, Quezon"; }
  else if (c.includes("lopez")) { distanceKm = 120.0; areaLabel = "Lopez, Quezon"; }
  else if (c.includes("calauag")) { distanceKm = 145.0; areaLabel = "Calauag, Quezon"; }
  else if (c.includes("real") || c.includes("infanta")) { distanceKm = 135.0; areaLabel = "Northern Quezon"; }

  // 3. LAGUNA PROVINCE
  else if (c.includes("san pablo")) { distanceKm = 15.0; areaLabel = "San Pablo City, Laguna"; }
  else if (c.includes("alaminos")) { distanceKm = 22.0; areaLabel = "Alaminos, Laguna"; }
  else if (c.includes("rizal")) { distanceKm = 24.0; areaLabel = "Rizal, Laguna"; }
  else if (c.includes("calauan")) { distanceKm = 26.0; areaLabel = "Calauan, Laguna"; }
  else if (c.includes("nagcarlan")) { distanceKm = 28.0; areaLabel = "Nagcarlan, Laguna"; }
  else if (c.includes("liliw")) { distanceKm = 33.0; areaLabel = "Liliw, Laguna"; }
  else if (c.includes("bay")) { distanceKm = 34.0; areaLabel = "Bay, Laguna"; }
  else if (c.includes("majayjay")) { distanceKm = 38.0; areaLabel = "Majayjay, Laguna"; }
  else if (c.includes("los baños") || c.includes("los banos")) { distanceKm = 40.0; areaLabel = "Los Baños, Laguna"; }
  else if (c.includes("magdalena")) { distanceKm = 42.0; areaLabel = "Magdalena, Laguna"; }
  else if (c.includes("calamba")) { distanceKm = 50.0; areaLabel = "Calamba City, Laguna"; }
  else if (c.includes("santa cruz") || c.includes("sta cruz")) { distanceKm = 52.0; areaLabel = "Santa Cruz, Laguna"; }
  else if (c.includes("cabuyao")) { distanceKm = 56.0; areaLabel = "Cabuyao City, Laguna"; }
  else if (c.includes("pagsanjan")) { distanceKm = 57.0; areaLabel = "Pagsanjan, Laguna"; }
  else if (c.includes("santa rosa") || c.includes("sta rosa")) { distanceKm = 62.0; areaLabel = "Santa Rosa City, Laguna"; }
  else if (c.includes("biñan") || c.includes("binan")) { distanceKm = 68.0; areaLabel = "Biñan City, Laguna"; }
  else if (c.includes("san pedro")) { distanceKm = 74.0; areaLabel = "San Pedro City, Laguna"; }

  // 4. BATANGAS PROVINCE
  else if (c.includes("padre garcia")) { distanceKm = 20.0; areaLabel = "Padre Garcia, Batangas"; }
  else if (c.includes("rosario")) { distanceKm = 24.0; areaLabel = "Rosario, Batangas"; }
  else if (c.includes("lipa")) { distanceKm = 28.0; areaLabel = "Lipa City, Batangas"; }
  else if (c.includes("san juan")) { distanceKm = 32.0; areaLabel = "San Juan, Batangas"; }
  else if (c.includes("malvar") || c.includes("san jose")) { distanceKm = 38.0; areaLabel = "Malvar/San Jose, Batangas"; }
  else if (c.includes("santo tomas") || c.includes("sto tomas")) { distanceKm = 40.0; areaLabel = "Santo Tomas, Batangas"; }
  else if (c.includes("tanauan")) { distanceKm = 44.0; areaLabel = "Tanauan City, Batangas"; }
  else if (c.includes("ibaan") || c.includes("taysan") || c.includes("cuenca")) { distanceKm = 45.0; areaLabel = "Batangas Town"; }
  else if (c.includes("batangas")) { distanceKm = 55.0; areaLabel = "Batangas City"; }
  else if (c.includes("bauan")) { distanceKm = 60.0; areaLabel = "Bauan, Batangas"; }
  else if (c.includes("lobo")) { distanceKm = 65.0; areaLabel = "Lobo, Batangas"; }
  else if (c.includes("nasugbu") || c.includes("calatagan") || c.includes("lian")) { distanceKm = 110.0; areaLabel = "Western Batangas"; }

  // 5. METRO MANILA & OTHER PROVINCES
  else if (c.includes("muntinlupa") || c.includes("las piñas") || c.includes("las pinas")) { distanceKm = 78.0; areaLabel = "Southern Metro Manila"; }
  else if (c.includes("taguig") || c.includes("makati") || c.includes("parañaque") || c.includes("paranaque") || c.includes("pasay")) { distanceKm = 85.0; areaLabel = "Metro Manila"; }
  else if (c.includes("manila") || c.includes("quezon city") || c.includes("mandaluyong") || c.includes("pasig") || c.includes("marikina")) { distanceKm = 92.0; areaLabel = "Metro Manila"; }
  else if (p.includes("cavite") || c.includes("dasmarinas") || c.includes("bacoor") || c.includes("tagaytay") || c.includes("imus")) { distanceKm = 80.0; areaLabel = "Cavite Province"; }
  else if (p.includes("rizal") || c.includes("antipolo") || c.includes("taytay") || c.includes("cainta")) { distanceKm = 95.0; areaLabel = "Rizal Province"; }
  else if (p.includes("bulacan") || p.includes("pampanga") || p.includes("tarlac") || p.includes("bataan")) { distanceKm = 130.0; areaLabel = "Central Luzon"; }

  // 6. Generic Fallback by Province
  else if (p.includes("quezon")) { distanceKm = 30.0; areaLabel = "Quezon Province"; }
  else if (p.includes("laguna")) { distanceKm = 35.0; areaLabel = "Laguna Province"; }
  else if (p.includes("batangas")) { distanceKm = 40.0; areaLabel = "Batangas Province"; }
  else if (fullText.length > 3) { distanceKm = 15.0; areaLabel = "Estimated Destination"; }

  const transpoFee = distanceKm <= 6 ? 0 : Math.round((distanceKm - 6) * 80);
  return { distanceKm, transpoFee, areaLabel };
}

export const TIAONG_ORIGIN_LAT = 13.9628;
export const TIAONG_ORIGIN_LNG = 121.3235;

/**
 * Calculates geodesic (Haversine) distance in KM between 2 latitude/longitude coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number = TIAONG_ORIGIN_LAT,
  lon2: number = TIAONG_ORIGIN_LNG
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10; // Round to 1 decimal place
}

