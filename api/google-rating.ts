// Live Google rating and review count for Sri Balaji Hospital, from the Google Places API (New).
//
// Setup (once, by the owner):
//   1. In Google Cloud, enable "Places API (New)" and create an API key restricted to that API.
//   2. In Vercel > Project > Settings > Environment Variables, add GOOGLE_PLACES_API_KEY.
//   3. Optional: add GOOGLE_PLACE_ID (the hospital's Place ID) to skip the name search.
//
// Vercel's CDN caches the answer for 6 hours, so Google is asked only a few times a day,
// well inside the Places API free monthly usage. The page keeps showing its built-in
// numbers whenever this endpoint has nothing to give.

const HOSPITAL = { name: 'Sri Balaji Hospital, Sajjapuram, Tanuku', latitude: 16.7576843, longitude: 81.6738392 };

type Place = { id?: string; displayName?: { text?: string }; rating?: number; userRatingCount?: number };

function json(body: unknown, cacheSeconds: number, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Browsers recheck after 10 minutes; the CDN serves its copy and refreshes it in the background.
      'Cache-Control': `public, max-age=600, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
    },
  });
}

async function findPlace(key: string): Promise<Place | undefined> {
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (placeId) {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount' },
    });
    if (!response.ok) throw new Error(`Place Details returned ${response.status}`);
    return (await response.json()) as Place;
  }

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount',
    },
    body: JSON.stringify({
      textQuery: HOSPITAL.name,
      maxResultCount: 3,
      locationBias: { circle: { center: { latitude: HOSPITAL.latitude, longitude: HOSPITAL.longitude }, radius: 1500 } },
    }),
  });
  if (!response.ok) throw new Error(`Text Search returned ${response.status}`);
  const { places = [] } = (await response.json()) as { places?: Place[] };
  // Only accept the hospital itself, never a similarly named place.
  return places.find((place) => /balaji/i.test(place.displayName?.text ?? '') && /hospital/i.test(place.displayName?.text ?? ''));
}

export async function GET() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return json({ error: 'not-configured' }, 300, 503);

  try {
    const place = await findPlace(key);
    if (typeof place?.rating !== 'number' || typeof place.userRatingCount !== 'number') {
      return json({ error: 'not-found' }, 900, 404);
    }
    return json({ rating: place.rating, count: place.userRatingCount, placeId: place.id }, 21600);
  } catch (error) {
    console.error('google-rating:', error instanceof Error ? error.message : error);
    return json({ error: 'upstream' }, 300, 502);
  }
}
