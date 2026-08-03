export interface PharmacyNode {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  address?: string;
  phone?: string;
}

export interface RouteInfo {
  coordinates: [number, number][]; // [lat, lng]
  distanceKm: number;
  durationMin: number;
}

export const DEFAULT_CENTER: [number, number] = [-6.175392, 106.827153];

// Rumus Jarak Haversine
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fetch Apotek Terdekat via Overpass API (OpenStreetMap)
export async function fetchNearbyPharmacies(lat: number, lon: number): Promise<PharmacyNode[]> {
  const query = `[out:json][timeout:15];
(
  node["amenity"="pharmacy"](around:3500,${lat},${lon});
  way["amenity"="pharmacy"](around:3500,${lat},${lon});
);
out center 15;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error("Gagal mengambil data apotek");

  const data = await res.json();
  const nodes: PharmacyNode[] = (data.elements || [])
    .map((el: any) => {
      const elLat = el.lat || el.center?.lat;
      const elLon = el.lon || el.center?.lon;
      if (!elLat || !elLon) return null;

      const dist = calculateHaversineDistance(lat, lon, elLat, elLon);
      const name = el.tags?.name || el.tags?.["name:id"] || "Apotek / Toko Obat";
      const address =
        el.tags?.["addr:street"] ||
        el.tags?.["addr:full"] ||
        el.tags?.brand ||
        "Area terdekat";
      const phone = el.tags?.phone || el.tags?.["contact:phone"];

      return {
        id: el.id,
        name,
        lat: elLat,
        lon: elLon,
        distanceKm: Number(dist.toFixed(2)),
        address,
        phone,
      };
    })
    .filter((item: any): item is PharmacyNode => item !== null)
    .sort((a: PharmacyNode, b: PharmacyNode) => a.distanceKm - b.distanceKm);

  return nodes;
}

// Fetch Rute Jalan menggunakan OSRM API
export async function fetchOSRMRoute(
  startLoc: [number, number],
  destPharmacy: PharmacyNode,
): Promise<RouteInfo> {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLoc[1]},${startLoc[0]};${destPharmacy.lon},${destPharmacy.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil rute OSRM");

  const data = await res.json();
  if (data.routes && data.routes.length > 0) {
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon],
    );
    return {
      coordinates: coords,
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      durationMin: Math.ceil(route.duration / 60),
    };
  }

  // Fallback jika rute kosong
  return {
    coordinates: [startLoc, [destPharmacy.lat, destPharmacy.lon]],
    distanceKm: destPharmacy.distanceKm,
    durationMin: Math.ceil(destPharmacy.distanceKm * 4),
  };
}
