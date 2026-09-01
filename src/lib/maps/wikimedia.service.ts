/**
 * Wikimedia Commons API Service
 * Fetches real front-facing building photos of Indonesian Hospitals, Clinics, and Pharmacies
 */

import { useState, useEffect } from "react";

const wikimediaCache = new Map<string, string>();

// High-quality Indonesian health facility building fallback photos from Wikimedia Commons
export const WIKIMEDIA_FALLBACKS = {
  hospital: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/RSUD_Dr._Soetomo_Surabaya.jpg/800px-RSUD_Dr._Soetomo_Surabaya.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/RSUP_Dr._Sardjito.jpg/800px-RSUP_Dr._Sardjito.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gedung_RSCM_Kencana.jpg/800px-Gedung_RSCM_Kencana.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rumah_Sakit_General_Hospital_Indonesia.jpg/800px-Rumah_Sakit_General_Hospital_Indonesia.jpg",
  ],
  clinic: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Puskesmas_Pecangaan.jpg/800px-Puskesmas_Pecangaan.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Klinik_Kesehatan_Masyarakat_Indonesia.jpg/800px-Klinik_Kesehatan_Masyarakat_Indonesia.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Puskesmas_Kecamatan_Menteng.jpg/800px-Puskesmas_Kecamatan_Menteng.jpg",
  ],
  pharmacy: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Apotek_K-24_Tlogosari.jpg/800px-Apotek_K-24_Tlogosari.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Apotek_Kimia_Farma_Indonesia.jpg/800px-Apotek_Kimia_Farma_Indonesia.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Pharmacy_storefront_Indonesia.jpg/800px-Pharmacy_storefront_Indonesia.jpg",
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

  // Fallback to high quality Wikimedia Commons fallback photo
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
