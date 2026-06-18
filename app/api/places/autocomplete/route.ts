import { NextRequest, NextResponse } from "next/server";

const CITY_RE = /(?:м\.|місто)\s*([А-ЯҐЄІЇа-яґєіїA-Za-z'-]+(?:[-\s][А-ЯҐЄІЇа-яґєіїA-Za-z'-]+)?)/i;
const STREET_TYPE_RE = /^(?:вул\.|вулиця|просп?\.|пр-т\.?|проспект|пров\.|провулок|бул\.|бульвар|пл\.|площа|мкр\.?\s*|мікрорайон)\s*/i;

function parseAddress(input: string): { city?: string; street?: string } {
  const cityMatch = input.match(CITY_RE);
  const city = cityMatch?.[1]?.trim();
  const parts = input.split(",");
  const streetRaw = parts.length > 1 ? parts.slice(1).join(",").trim() : "";
  const street = streetRaw ? streetRaw.replace(STREET_TYPE_RE, "").trim() : undefined;
  return { city, street };
}

interface PhotonProperties {
  osm_id?: number;
  name?: string;
  city?: string;
  district?: string;
  state?: string;
  street?: string;
  housenumber?: string;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties;
}

function buildDisplayName(p: PhotonProperties): string {
  const parts: string[] = [];

  if (p.street) {
    parts.push(p.housenumber ? `вул. ${p.street}, ${p.housenumber}` : `вул. ${p.street}`);
  } else if (p.name) {
    parts.push(p.name);
  }

  if (p.city) parts.push(p.city);
  else if (p.district) parts.push(p.district);

  if (p.state) parts.push(p.state);

  return parts.join(", ") || p.name || "";
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input") ?? "";
  if (input.trim().length < 3) return NextResponse.json({ predictions: [] });

  const { city, street } = parseAddress(input.trim());

  let query: string;
  if (city && street) {
    query = `${street}, ${city}`;
  } else if (city) {
    query = city;
  } else {
    query = input.trim().replace(CITY_RE, "").replace(STREET_TYPE_RE, "").trim() || input.trim();
  }

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");
  // Location bias toward center of Ukraine
  url.searchParams.set("lat", "49.0");
  url.searchParams.set("lon", "32.0");
  url.searchParams.set("location_bias_scale", "0.5");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "FarroService/1.0 diploma-project" },
  });

  if (!res.ok) {
    console.error(`[photon] ${res.status}`);
    return NextResponse.json({ predictions: [] });
  }

  const data: { features: PhotonFeature[] } = await res.json();

  // Filter to Ukraine bounding box server-side
  const UA = { minLat: 44.4, maxLat: 52.4, minLon: 22.1, maxLon: 40.2 };

  const predictions = data.features
    .filter((f) => {
      const [lon, lat] = f.geometry.coordinates;
      return lat >= UA.minLat && lat <= UA.maxLat && lon >= UA.minLon && lon <= UA.maxLon;
    })
    .slice(0, 5)
    .map((f, i) => ({
      place_id: String(f.properties.osm_id ?? i),
      description: buildDisplayName(f.properties),
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }))
    .filter((p) => p.description);

  return NextResponse.json({ predictions });
}
