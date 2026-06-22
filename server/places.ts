export type PlaceResult = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  label: string;
};

type OpenMeteoPlace = {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type OpenMeteoResponse = {
  results?: OpenMeteoPlace[];
};

export async function findPlaces(query: string): Promise<PlaceResult[]> {
  const parameters = new URLSearchParams({
    name: query,
    count: "6",
    language: "es",
    format: "json",
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${parameters}`, {
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new Error("El servicio de lugares no está disponible.");
  }

  const payload = (await response.json()) as OpenMeteoResponse;
  return (payload.results ?? []).map((place) => {
    const country = place.country ?? "";
    const region = place.admin1 && place.admin1 !== place.name ? place.admin1 : undefined;
    return {
      id: place.id,
      name: place.name,
      country,
      admin1: region,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
      label: [place.name, region, country].filter(Boolean).join(", "),
    };
  });
}
