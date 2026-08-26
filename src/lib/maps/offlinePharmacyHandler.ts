import type { PharmacyNode } from "@/components/maps/maps.service";
import { haversineDistance } from "./pharmacy.server";

const CACHE_STORAGE_KEY = "siaga_sehat_pharmacies_cache_v1";
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface CachedPharmacyPayload {
  lat: number;
  lon: number;
  address?: string;
  timestamp: number;
  pharmacies: PharmacyNode[];
}

export function getTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `Disimpan ${diffMinutes} menit lalu`;
  if (diffHours < 24) return `Disimpan ${diffHours} jam lalu`;
  return `Disimpan ${Math.floor(diffHours / 24)} hari lalu`;
}

/**
 * Save pharmacy results to client localStorage
 */
export function savePharmaciesToCache(
  lat: number,
  lon: number,
  pharmacies: PharmacyNode[],
  address?: string
): void {
  if (typeof window === "undefined" || !pharmacies || pharmacies.length === 0) return;

  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    let cacheList: CachedPharmacyPayload[] = [];
    if (raw) {
      cacheList = JSON.parse(raw);
      if (!Array.isArray(cacheList)) cacheList = [];
    }

    // Filter out old entries (> 24 hours) or duplicate positions
    const now = Date.now();
    cacheList = cacheList.filter((item) => {
      const isExpired = now - item.timestamp > 24 * 60 * 60 * 1000;
      const isSameArea = haversineDistance([lat, lon], [item.lat, item.lon]) < 1.0;
      return !isExpired && !isSameArea;
    });

    // Add newest entry at front
    cacheList.unshift({
      lat,
      lon,
      address,
      timestamp: now,
      pharmacies,
    });

    // Keep max 10 cached areas
    if (cacheList.length > 10) {
      cacheList = cacheList.slice(0, 10);
    }

    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheList));
  } catch (err) {
    console.warn("[CACHE] Failed to save pharmacies to localStorage:", err);
  }
}

/**
 * Retrieve cached pharmacies for location within radius (default 5 km)
 */
export function getCachedPharmacies(
  lat: number,
  lon: number,
  maxDistanceKm = 6
): PharmacyNode[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;

    const cacheList: CachedPharmacyPayload[] = JSON.parse(raw);
    if (!Array.isArray(cacheList) || cacheList.length === 0) return null;

    const now = Date.now();
    for (const item of cacheList) {
      const age = now - item.timestamp;
      if (age <= CACHE_MAX_AGE_MS) {
        const dist = haversineDistance([lat, lon], [item.lat, item.lon]);
        if (dist <= maxDistanceKm && item.pharmacies && item.pharmacies.length > 0) {
          const cacheAgeLabel = getTimeAgo(item.timestamp);
          console.log(`[CACHE] Found ${item.pharmacies.length} cached pharmacies (${cacheAgeLabel}) within ${dist.toFixed(2)} km`);

          // Recalculate distance relative to current user coords
          return item.pharmacies.map((p) => {
            const currentDist = Number(haversineDistance([lat, lon], [p.lat, p.lon]).toFixed(2));
            return {
              ...p,
              distanceKm: currentDist,
              _dataSource: "cache" as const,
              _dataSourceLabel: `Tersimpan (${cacheAgeLabel})`,
              _cacheAge: cacheAgeLabel,
              _trustScore: 8,
            };
          }).sort((a, b) => a.distanceKm - b.distanceKm);
        }
      }
    }
  } catch (err) {
    console.warn("[CACHE] Failed to read cached pharmacies:", err);
  }

  return null;
}
