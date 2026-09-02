/**
 * Wikimedia & Building Photo API Service
 * Fetches real front-facing building photos of Indonesian Hospitals, Clinics, and Pharmacies
 */

import { useState, useEffect } from "react";

const wikimediaCache = new Map<string, string>();

// Guaranteed high-res health facility building front photos (CORS & Hotlink Safe)
export const WIKIMEDIA_FALLBACKS = {
  hospital: [
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
  ],
  clinic: [
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1631217314707-eb6eca3dd189?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581594545050-75e40c9b0f21?w=800&auto=format&fit=crop&q=80",
  ],
  pharmacy: [
    "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1576091160396-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
  ],
};

export function getWikimediaFallbackPhoto(facilityType?: string, index = 0): string {
  const type = (facilityType || "").toLowerCase();
  if (type.includes("hospital") || type.includes("rumah sakit")) {
    return WIKIMEDIA_FALLBACKS.hospital[index % WIKIMEDIA_FALLBACKS.hospital.length];
  }
  if (type.includes("clinic") || type.includes("klinik")) {
    return WIKIMEDIA_FALLBACKS.clinic[index % WIKIMEDIA_FALLBACKS.clinic.length];
  }
  return WIKIMEDIA_FALLBACKS.pharmacy[index % WIKIMEDIA_FALLBACKS.pharmacy.length];
}

/**
 * Query Wikimedia Commons API for building photos
 */
export async function fetchWikimediaFacilityPhoto(
  facilityName: string,
  facilityType: string = "hospital"
): Promise<string> {
  const cleanName = facilityName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const cacheKey = `${cleanName}_${facilityType}`;

  if (wikimediaCache.has(cacheKey)) {
    return wikimediaCache.get(cacheKey)!;
  }

  const queries = [
    `"${cleanName}" building`,
    cleanName,
    facilityType === "hospital" || facilityName.toLowerCase().includes("rumah sakit")
      ? '"Rumah Sakit" Indonesia building'
      : facilityType === "clinic" || facilityName.toLowerCase().includes("klinik")
      ? '"Klinik" Indonesia'
      : '"Apotek" Indonesia',
  ];

  for (const q of queries) {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        q
      )}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url&format=json&origin=*`;

      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      if (data.query && data.query.pages) {
        const pages = Object.values(data.query.pages) as any[];
        for (const page of pages) {
          if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
            const imgUrl = page.imageinfo[0].url;
            if (/\.(jpg|jpeg|png)$/i.test(imgUrl)) {
              wikimediaCache.set(cacheKey, imgUrl);
              return imgUrl;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Wikimedia API fetch warning:", e);
    }
  }

  // Fallback to high quality building facade photo
  const fallback = getWikimediaFallbackPhoto(facilityType, facilityName.charCodeAt(0) || 0);
  wikimediaCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Custom React Hook to resolve Wikimedia photo for a facility
 */
export function useWikimediaPhoto(facilityName?: string, facilityType?: string): string {
  const [photoUrl, setPhotoUrl] = useState<string>(() =>
    getWikimediaFallbackPhoto(facilityType, (facilityName || "").charCodeAt(0) || 0)
  );

  useEffect(() => {
    if (!facilityName) return;

    let isMounted = true;
    fetchWikimediaFacilityPhoto(facilityName, facilityType || "hospital").then((url) => {
      if (isMounted && url) {
        setPhotoUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [facilityName, facilityType]);

  return photoUrl;
}
