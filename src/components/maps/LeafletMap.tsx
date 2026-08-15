import { useEffect, useRef } from "react";
import L from "leaflet";
import type { PharmacyNode, RouteInfo } from "./maps.service";

// Fix icon default Leaflet issue in Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Icons for User and Pharmacy
const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background-color: #10b981;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
      position: relative;
      cursor: grab;
    ">
      <div style="
        position: absolute;
        top: -6px;
        left: -6px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: rgba(16, 185, 129, 0.3);
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const pharmacyIcon = L.divIcon({
  className: "custom-pharmacy-marker",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background-color: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      font-size: 16px;
    ">
      💊
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const selectedPharmacyIcon = L.divIcon({
  className: "custom-selected-pharmacy-marker",
  html: `
    <div style="
      width: 38px;
      height: 38px;
      background-color: #dc2626;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.5);
      font-size: 20px;
      animation: bounce 1s infinite alternate;
    ">
      🏥
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19],
});

interface LeafletMapProps {
  userLocation: [number, number] | null;
  pharmacies: PharmacyNode[];
  selectedPharmacy: PharmacyNode | null;
  routeInfo: RouteInfo | null;
  onSelectPharmacy: (pharmacy: PharmacyNode | null) => void;
  onLocationChange?: (coords: [number, number]) => void;
}

export function LeafletMap({
  userLocation,
  pharmacies,
  selectedPharmacy,
  routeInfo,
  onSelectPharmacy,
  onLocationChange,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Inisialisasi Peta Leaflet dengan CARTO Voyager Basemap
  useEffect(() => {
    if (!containerRef.current) return;

    const initialCenter = userLocation || [-6.2088, 106.8456];

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: true,
      });

      // CartoDB Tile Server Voyager Basemap
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      // Event listener: Klik di mana saja pada peta untuk mengubah titik posisi user
      map.on("click", (e: L.LeafletMouseEvent) => {
        if (onLocationChange) {
          onLocationChange([e.latlng.lat, e.latlng.lng]);
        }
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update posisi pengguna & marker draggable
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      } else {
        const marker = L.marker(userLocation, {
          icon: userIcon,
          draggable: true,
        }).addTo(map);

        marker.bindPopup("<b>Lokasi Anda</b><br/><span style='font-size:11px;color:#64748b;'>Klik peta atau geser pin ini untuk memperbarui lokasi presisi Anda.</span>");

        marker.on("dragend", (e: L.DragEndEvent) => {
          const latlng = e.target.getLatLng();
          if (onLocationChange) {
            onLocationChange([latlng.lat, latlng.lng]);
          }
        });

        userMarkerRef.current = marker;
      }

      if (!selectedPharmacy) {
        map.setView(userLocation, map.getZoom());
      }
    }
  }, [userLocation, selectedPharmacy, onLocationChange]);

  // Render Marker Apotek
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    pharmacies.forEach((pharm) => {
      const isSelected = selectedPharmacy?.id === pharm.id;
      const marker = L.marker([pharm.lat, pharm.lon], {
        icon: isSelected ? selectedPharmacyIcon : pharmacyIcon,
      }).addTo(map);

      const popupContent = document.createElement("div");
      popupContent.className = "p-1 font-sans text-xs max-w-[200px]";
      popupContent.innerHTML = `
        <strong style="display:block; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${pharm.name}</strong>
        <span style="display:block; color: #d97706; font-weight: 600;">⭐ ${pharm.rating || 4.8} (${pharm.userRatingsTotal || 30})</span>
        <span style="display:block; color: #64748b; margin-top: 2px;">Jarak: ~${pharm.distanceKm} km</span>
        <span style="display:block; color: #166534; font-weight: 600; margin-top: 2px;">${pharm.openingHoursText || "Buka"}</span>
        <span style="display:block; color: #94a3b8; font-size: 11px; margin-top: 2px;">${pharm.address}</span>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        onSelectPharmacy(pharm);
      });

      markersRef.current[String(pharm.id)] = marker;

      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [pharmacies, selectedPharmacy, onSelectPharmacy]);

  // Render Rute OSRM
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 0) {
      const polyline = L.polyline(routeInfo.coordinates, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      polylineRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [routeInfo]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[360px] rounded-2xl z-0 overflow-hidden"
    />
  );
}
