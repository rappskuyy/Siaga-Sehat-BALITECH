import { Star, Clock, Phone, MapPin, Navigation, ExternalLink, Camera, Building2, Stethoscope, Pill } from "lucide-react";
import { type LocationPlace } from "@/hooks/useLocationPlaces";

interface LocationCardProps {
  place: LocationPlace;
  onSelect?: (place: LocationPlace) => void;
  isSelected?: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({ place, onSelect, isSelected }) => {
  const categoryBadgeClass =
    place.category === "hospital"
      ? "bg-red-500 text-white border-red-600"
      : place.category === "clinic"
      ? "bg-[#F59E0B] text-white border-amber-600"
      : "bg-[#379FD2] text-white border-blue-600";

  const categoryLabel =
    place.category === "hospital" ? (
      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> RUMAH SAKIT</span>
    ) : place.category === "clinic" ? (
      <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" /> KLINIK</span>
    ) : (
      <span className="flex items-center gap-1"><Pill className="h-3 w-3" /> APOTEK</span>
    );

  return (
    <div
      onClick={() => onSelect?.(place)}
      className={`rounded-3xl border p-4 sm:p-5 bg-white transition cursor-pointer flex flex-col justify-between ${
        isSelected
          ? "border-[#379FD2] ring-2 ring-[#379FD2]/30 shadow-lg"
          : "border-[#E5E7EB] hover:border-[#379FD2]/50 shadow-sm hover:shadow-md"
      }`}
    >
      <div>
        {/* Category Badge & Rating */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-2xs ${categoryBadgeClass}`}
          >
            {categoryLabel}
          </span>

          <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{place.rating.toFixed(1)}</span>
            <span className="text-[10px] text-amber-700 font-normal">({place.userRatingsTotal})</span>
          </div>
        </div>

        {/* Real Photo or Clean UI Badge Header (NO DUMMY PHOTOS!) */}
        {place.photoUrl && place.photoUrl.startsWith("http") ? (
          <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-3 border border-[#E5E7EB] bg-slate-100 shrink-0 shadow-xs group">
            <img
              src={place.photoUrl}
              alt={place.name}
              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
            <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Camera className="h-2.5 w-2.5" />
              Foto Depan Tempat
            </span>
          </div>
        ) : (
          <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-3 border border-[#E5E7EB] bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E0F2FE] p-4 flex flex-col justify-between shrink-0 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#379FD2] text-white shadow-sm">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-[#2781AF] border border-[#379FD2]/20">
                Tampak Depan Tempat
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#111111] line-clamp-1">{place.name}</h4>
              <p className="text-[10px] text-[#6B7280] flex items-center gap-1"><MapPin className="h-3 w-3 text-[#379FD2] shrink-0" /> {place.address}</p>
            </div>
          </div>
        )}

        {/* Name & Address */}
        <h3 className="text-base sm:text-lg font-bold text-[#111111] leading-snug line-clamp-1">
          {place.name}
        </h3>
        <p className="text-xs text-[#6B7280] mt-1 leading-relaxed line-clamp-2 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-[#379FD2] shrink-0" /> {place.address}
        </p>

        {/* Hours & Distance */}
        <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-[#379FD2] font-semibold">
            <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            {place.openingHours}
          </span>
          <span className="font-extrabold text-[#111111]">
            {place.distanceKm < 1 ? `${(place.distanceKm * 1000).toFixed(0)} m` : `${place.distanceKm} km`}
          </span>
        </div>

        {place.phone && (
          <div className="mt-1 text-[11px] text-[#6B7280]">
            <Phone className="h-3 w-3 inline mr-1 text-slate-400" />
            {place.phone}
          </div>
        )}
      </div>

      {/* Navigation Button */}
      <a
        href={place.navigationUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-4 w-full h-10 bg-gradient-to-r from-[#379FD2] to-[#2563EB] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition cursor-pointer"
      >
        <Navigation className="h-3.5 w-3.5" />
        <span>Buka Navigasi Google Maps</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
};
