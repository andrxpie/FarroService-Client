import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId") ?? "";
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || !placeId) {
    return NextResponse.json({ lat: null, lng: null }, { status: 200 });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "geometry");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  const loc = data.result?.geometry?.location;
  return NextResponse.json({ lat: loc?.lat ?? null, lng: loc?.lng ?? null });
}
