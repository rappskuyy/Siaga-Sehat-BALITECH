export const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456]; // Jakarta Pusat

export type TransportMode = "driving" | "motorcycle";

export interface PharmacyNode {
  id: number | string;
  placeId?: string;
  lat: number;
  lon: number;
  name: string;
  address?: string;
  distanceKm: number;
  rating?: number;
  userRatingsTotal?: number;
  openingHoursText?: string;
  isOpenNow?: boolean;
  phone?: string;
}

export interface RouteInfo {
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
  mode?: TransportMode;
}

function haversineDistance(
  coords1: [number, number],
  coords2: [number, number],
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1[0])) *
      Math.cos(toRad(coords2[0])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateMockPharmacies(lat: number, lon: number): PharmacyNode[] {
  return [
    {
      id: 101,
      lat: lat + 0.004,
      lon: lon + 0.003,
      name: "Apotek K-24 Tajur",
      address: "Jl. Raya Tajur No. 242, RT.04/RW.04, Sindangsari",
      distanceKm: 0.65,
      rating: 4.9,
      userRatingsTotal: 294,
      openingHoursText: "Buka 24 Jam",
      isOpenNow: true,
      phone: "(0251) 8312345",
    },
    {
      id: 102,
      lat: lat - 0.005,
      lon: lon + 0.007,
      name: "Kimia Farma Apotek",
      address: "Jl. Raya Wangun No. 240D, RT.01/RW.02",
      distanceKm: 1.15,
      rating: 4.7,
      userRatingsTotal: 182,
      openingHoursText: "Buka • Tutup pukul 22.00",
      isOpenNow: true,
      phone: "(0251) 8356789",
    },
    {
      id: 103,
      lat: lat + 0.009,
      lon: lon - 0.006,
      name: "APOTEK WILUJENG",
      address: "Jl. Raya Tajur No. 372, RT.01/RW.03",
      distanceKm: 1.45,
      rating: 4.8,
      userRatingsTotal: 96,
      openingHoursText: "Buka • Tutup pukul 20.30",
      isOpenNow: true,
      phone: "0857-1234-5678",
    },
  ];
}

export async function fetchNearbyPharmacies(
  lat: number,
  lon: number,
  mapInstance?: google.maps.Map,
): Promise<PharmacyNode[]> {
  if (!mapInstance || !window.google) return generateMockPharmacies(lat, lon);

  const RADIUS_STEPS = [3500, 5000, 10000, 25000, 50000];

  const searchWithRadius = (radius: number): Promise<PharmacyNode[]> => {
    return new Promise((resolve, reject) => {
      const service = new window.google.maps.places.PlacesService(mapInstance);
      const request: google.maps.places.PlaceSearchRequest = {
        location: new window.google.maps.LatLng(lat, lon),
        radius: radius,
        type: "pharmacy",
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const pharmacies: PharmacyNode[] = results
            .filter((place) => place.geometry && place.geometry.location)
            .map((place, index) => {
              const pLat = place.geometry!.location!.lat();
              const pLon = place.geometry!.location!.lng();
              const distanceKm = haversineDistance([lat, lon], [pLat, pLon]);
              const isOpen = place.opening_hours?.isOpen ? place.opening_hours.isOpen() : true;
              return {
                id: place.place_id || index,
                placeId: place.place_id,
                lat: pLat,
                lon: pLon,
                name: place.name || "Apotek Terdekat",
                address: place.vicinity || "",
                distanceKm: Number(distanceKm.toFixed(2)),
                rating: place.rating || 4.5,
                userRatingsTotal: place.user_ratings_total || 50,
                isOpenNow: isOpen,
                openingHoursText: isOpen ? "Buka 24 Jam" : "Tutup",
              };
            });

          pharmacies.sort((a, b) => a.distanceKm - b.distanceKm);
          resolve(pharmacies.slice(0, 5));
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(new Error(`PlacesService status: ${status}`));
        }
      });
    });
  };

  for (const radius of RADIUS_STEPS) {
    try {
      const results = await searchWithRadius(radius);
      if (results.length > 0) {
        return results;
      }
    } catch (error) {
      console.warn(`Places API status warning:`, error);
      break;
    }
  }

  return generateMockPharmacies(lat, lon);
}

export async function fetchOSRMRoute(
  start: [number, number],
  end: PharmacyNode,
  mode: TransportMode = "driving"
): Promise<RouteInfo> {
  try {
    // OSRM routing request: gunakan driving profile untuk jaringan jalan darat publik
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end.lon},${end.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM request failed");
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]],
      );
      
      // Sambungkan titik start presisi ke node pertama jalan, dan node terakhir jalan ke titik apotek tujuan
      const fullCoords: [number, number][] = [start, ...coords, [end.lat, end.lon]];

      // Calculate estimated time: motorcycle is typically faster in urban traffic
      let durationMin = Math.ceil(route.duration / 60);
      if (mode === "motorcycle") {
        durationMin = Math.max(1, Math.ceil(durationMin * 0.75));
      }

      return {
        coordinates: fullCoords,
        distanceKm: Number((route.distance / 1000).toFixed(2)),
        durationMin: durationMin,
        mode: mode,
      };
    }
  } catch (err) {
    console.warn("OSRM Route fallback error:", err);
  }

  // Fallback straight line calculations
  const baseDuration = Math.ceil(end.distanceKm * 4);
  const durationMin = mode === "motorcycle" ? Math.max(1, Math.ceil(baseDuration * 0.75)) : baseDuration;

  return {
    coordinates: [start, [end.lat, end.lon]],
    distanceKm: end.distanceKm,
    durationMin: durationMin,
    mode: mode,
  };
}
