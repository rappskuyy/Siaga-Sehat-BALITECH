import { Star, MapPin, Clock, Phone, Building2, Stethoscope, Pill } from "lucide-react";
import { PharmacyNode } from "./maps.service";
import { getFacilityPhotoConsistent, getFacilityDescriptionConsistent } from "@/data/facilitiesDummyUtils";

/**
 * Floating Facility Bubble Card untuk mobile view
 */
export function FacilityBubbleCard({
  facility,
  isSelected,
  onClick,
}: {
  facility: PharmacyNode;
  isSelected?: boolean;
  onClick: () => void;
}) {
  const photo = getFacilityPhotoConsistent(facility.placeId || String(facility.id));

  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2 p-3 rounded-xl border shadow-md hover:shadow-lg transition flex-shrink-0 w-[150px] animate-fade-up ${
        isSelected
          ? "bg-white border-[#4a6fa5] shadow-lg ring-2 ring-[#4a6fa5]"
          : "bg-white border-[#E5E7EB] hover:border-[#4a6fa5]"
      }`}
    >
      <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-200">
        <img src={photo} alt={facility.name} className="w-full h-full object-cover" />
      </div>
      <div className="text-left">
        <h4 className="text-xs font-bold text-[#111111] line-clamp-2">{facility.name}</h4>
        <p className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {facility.distanceKm.toFixed(2)} km
        </p>
      </div>
    </button>
  );
}

/**
 * Facility Detail Card untuk bottom sheet / detail panel
 */
export function FacilityDetailCard({ facility }: { facility: PharmacyNode }) {
  const photo = getFacilityPhotoConsistent(facility.placeId || String(facility.id));
  const description = getFacilityDescriptionConsistent(facility.placeId || String(facility.id));

  return (
    <div className="space-y-4">
      {/* Photo */}
      <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-200 shadow-sm">
        {photo && <img src={photo} alt={facility.name} className="w-full h-full object-cover" />}
      </div>

      {/* Rating */}
      {facility.rating && (
        <div className="flex items-center gap-2 pb-4 border-b border-[#E5E7EB]">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400 flex-shrink-0" />
          <span className="font-bold text-[#111111]">{Number(facility.rating).toFixed(1)}</span>
          <span className="text-xs text-[#6B7280]">
            ({facility.userRatingsTotal || "128"} ulasan)
          </span>
        </div>
      )}

      {/* Address */}
      <div>
        <p className="text-xs text-[#6B7280] font-medium mb-1">Lokasi</p>
        <p className="text-sm text-[#111111] leading-relaxed flex items-start gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-[#4a6fa5] mt-0.5" />
          <span>{facility.address || `Jl. Sekitar (${facility.lat.toFixed(4)}, ${facility.lon.toFixed(4)})`}</span>
        </p>
      </div>

      {/* Description */}
      <div>
        <p className="text-xs text-[#6B7280] font-medium mb-2">Deskripsi</p>
        <p className="text-sm text-[#111111] leading-relaxed">{description}</p>
      </div>

      {/* Hours & Distance */}
      <div className="p-3 bg-[#eef2f8] rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-[#4a6fa5]">
            {facility.openingHoursText || "Buka 24 Jam"}
          </span>
        </div>
        <span className="text-sm font-bold text-[#111111]">
          {facility.distanceKm < 1
            ? `${(facility.distanceKm * 1000).toFixed(0)} m`
            : `${facility.distanceKm.toFixed(2)} km`}
        </span>
      </div>

      {/* Phone */}
      {facility.phone && (
        <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2 border border-[#E5E7EB]">
          <Phone className="h-4 w-4 text-[#4a6fa5] flex-shrink-0" />
          <span className="text-sm text-[#111111] font-medium">{facility.phone}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Facility Mini Card untuk list view
 */
export function FacilityMiniCard({
  facility,
  onClick,
}: {
  facility: PharmacyNode;
  onClick: () => void;
}) {
  const photo = getFacilityPhotoConsistent(facility.placeId || String(facility.id));
  const TypeIcon =
    facility.facilityType === "hospital" ? Building2 : facility.facilityType === "clinic" ? Stethoscope : Pill;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-white hover:bg-slate-50 rounded-xl flex gap-3 border border-[#E5E7EB] hover:border-[#4a6fa5] transition animate-fade-up"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
        <img src={photo} alt={facility.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-[#111111] line-clamp-1">{facility.name}</h3>
          <TypeIcon className="h-4 w-4 text-[#4a6fa5] shrink-0" />
        </div>
        <p className="text-xs text-[#6B7280] line-clamp-1 mb-2">{facility.address}</p>
        <div className="flex items-center justify-between gap-2">
          {facility.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-[#111111]">{Number(facility.rating).toFixed(1)}</span>
            </div>
          )}
          <span className="text-xs font-semibold text-[#4a6fa5]">
            {facility.distanceKm < 1
              ? `${(facility.distanceKm * 1000).toFixed(0)} m`
              : `${facility.distanceKm.toFixed(2)} km`}
          </span>
        </div>
      </div>
    </button>
  );
}

/**
 * Facility type filter button
 */
export function FacilityTypeFilterButton({
  type,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  type: string;
  label: string;
  icon: React.ComponentType<{ className: string }>;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition shadow-sm animate-fade-up ${
        isActive
          ? "bg-[#4a6fa5] text-white"
          : "bg-white text-[#111111] border border-[#E5E7EB] hover:border-[#4a6fa5] hover:text-[#4a6fa5]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/**
 * Loading skeleton untuk facility card
 */
export function FacilityCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-[#E5E7EB] flex-shrink-0 w-[150px] animate-pulse">
      <div className="w-full h-20 rounded-lg bg-slate-200" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-2.5 bg-slate-200 rounded w-full" />
      </div>
    </div>
  );
}

/**
 * Empty state untuk facility list
 */
export function FacilityEmptyState({ message = "Tidak ada fasilitas ditemukan" }: { message?: string }) {
  return (
    <div className="py-12 text-center">
      <MapPin className="h-12 w-12 text-[#D1D5DB] mx-auto mb-3" />
      <p className="text-[#6B7280] font-medium">{message}</p>
      <p className="text-xs text-[#9CA3AF] mt-1">Coba ubah filter atau cari lokasi lain</p>
    </div>
  );
}
