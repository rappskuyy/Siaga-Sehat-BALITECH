/**
 * Utility Functions untuk Dummy Data Management
 * Helper untuk mempermudah penggunaan foto dan deskripsi fasilitas
 */

import {
  FACILITY_PHOTOS_ARRAY,
  FACILITY_DESCRIPTIONS_ARRAY,
  getRandomFacilityPhoto,
  getRandomFacilityDescription,
  getFacilityPhotoByIndex,
  getFacilityDescriptionByIndex,
} from "./facilitiesDummyData";

/**
 * Cache untuk menyimpan mapping fasilitas ke foto/deskripsi
 * Agar konsisten ketika di-refresh
 */
const facilityPhotoCache = new Map<string, string>();
const facilityDescriptionCache = new Map<string, string>();

/**
 * Get consistent photo untuk fasilitas tertentu
 * @param facilityId - ID unik fasilitas (placeId)
 * @param useCache - Gunakan cache untuk consistency
 * @returns URL foto
 */
export function getFacilityPhotoConsistent(facilityId: string, useCache = true): string {
  if (useCache && facilityPhotoCache.has(facilityId)) {
    return facilityPhotoCache.get(facilityId)!;
  }

  const photo = getRandomFacilityPhoto();
  facilityPhotoCache.set(facilityId, photo);
  return photo;
}

/**
 * Get consistent description untuk fasilitas tertentu
 * @param facilityId - ID unik fasilitas (placeId)
 * @param useCache - Gunakan cache untuk consistency
 * @returns Deskripsi fasilitas
 */
export function getFacilityDescriptionConsistent(facilityId: string, useCache = true): string {
  if (useCache && facilityDescriptionCache.has(facilityId)) {
    return facilityDescriptionCache.get(facilityId)!;
  }

  const description = getRandomFacilityDescription();
  facilityDescriptionCache.set(facilityId, description);
  return description;
}

/**
 * Clear cache (untuk reset atau testing)
 */
export function clearFacilityCache(): void {
  facilityPhotoCache.clear();
  facilityDescriptionCache.clear();
}

/**
 * Get facility data (foto + deskripsi) dalam satu object
 * @param facilityId - ID unik fasilitas
 * @returns Object dengan photo dan description
 */
export function getFacilityData(facilityId: string) {
  return {
    photo: getFacilityPhotoConsistent(facilityId),
    description: getFacilityDescriptionConsistent(facilityId),
  };
}

/**
 * Get multiple facilities data
 * @param facilityIds - Array of facility IDs
 * @returns Array of facility data
 */
export function getMultipleFacilitiesData(facilityIds: string[]) {
  return facilityIds.map((id) => ({
    id,
    ...getFacilityData(id),
  }));
}

/**
 * Get random facility photo untuk preview (tidak cached)
 * @returns URL foto random
 */
export function getRandomFacilityPhotoForPreview(): string {
  return getRandomFacilityPhoto();
}

/**
 * Get random facility description untuk preview (tidak cached)
 * @returns Deskripsi random
 */
export function getRandomFacilityDescriptionForPreview(): string {
  return getRandomFacilityDescription();
}

/**
 * Get facility type specific photo
 * @param facilityType - Type of facility: 'hospital', 'clinic', 'pharmacy'
 * @returns URL foto yang sesuai tipe
 */
export function getFacilityPhotoByType(facilityType: string): string {
  if (facilityType === "hospital") {
    // Return hospital specific photos (indices 0-3)
    return FACILITY_PHOTOS_ARRAY[Math.floor(Math.random() * 4)];
  } else if (facilityType === "clinic") {
    // Return clinic specific photos (indices 2-4)
    return FACILITY_PHOTOS_ARRAY[2 + Math.floor(Math.random() * 3)];
  } else {
    // Return pharmacy specific photos (indices 5-9)
    return FACILITY_PHOTOS_ARRAY[5 + Math.floor(Math.random() * 5)];
  }
}

/**
 * Get stats tentang dummy data
 * @returns Object dengan info jumlah foto dan deskripsi
 */
export function getDummyDataStats() {
  return {
    totalPhotos: FACILITY_PHOTOS_ARRAY.length,
    totalDescriptions: FACILITY_DESCRIPTIONS_ARRAY.length,
    cachedFacilities: facilityPhotoCache.size,
    sample: {
      photo: FACILITY_PHOTOS_ARRAY[0],
      description: FACILITY_DESCRIPTIONS_ARRAY[0],
    },
  };
}

/**
 * Generate dummy facility dengan photo dan description
 * Gunakan untuk testing atau preview
 */
export function generateDummyFacility(
  name: string,
  type: "hospital" | "clinic" | "pharmacy",
  lat: number,
  lon: number
) {
  const facilityId = `${name}-${lat}-${lon}`;
  return {
    name,
    type,
    lat,
    lon,
    facilityId,
    photo: getFacilityPhotoConsistent(facilityId),
    description: getFacilityDescriptionConsistent(facilityId),
  };
}

export default {
  getFacilityPhotoConsistent,
  getFacilityDescriptionConsistent,
  clearFacilityCache,
  getFacilityData,
  getMultipleFacilitiesData,
  getRandomFacilityPhotoForPreview,
  getRandomFacilityDescriptionForPreview,
  getFacilityPhotoByType,
  getDummyDataStats,
  generateDummyFacility,
};
