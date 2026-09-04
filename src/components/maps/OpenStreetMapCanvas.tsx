import { useEffect, useRef } from "react";
import type { PharmacyNode, RouteInfo } from "./maps.service";

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];

interface OpenStreetMapCanvasProps {
  userLocation: [number, number] | null;
  pharmacies: PharmacyNode[];
  selectedPharmacy: PharmacyNode | null;
  routeInfo: RouteInfo | null;
  onSelectPharmacy: (pharmacy: PharmacyNode) => void;
  onManualLocationChange?: (coords: [number, number]) => void;
  showZoomControl?: boolean;
  className?: string;
}

export function OpenStreetMapCanvas({
  userLocation,
  pharmacies,
  selectedPharmacy,
  routeInfo,
  onSelectPharmacy,
  onManualLocationChange,
  showZoomControl = false,
  className = "w-full h-full min-h-[350px]",
}: OpenStreetMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routeUnderlayRef = useRef<any>(null);
  const routeForegroundRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(false);

  // 1. Initialize Map Leaflet instance once
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    isMountedRef.current = true;
    let resizeObserver: ResizeObserver | null = null;

    import("leaflet").then((L) => {
      if (!isMountedRef.current || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        const initialCenter: [number, number] = userLocation
          ? userLocation
          : selectedPharmacy
          ? [selectedPharmacy.lat, selectedPharmacy.lon]
          : DEFAULT_CENTER;

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: true,
        }).setView(initialCenter, 14);

        // Standard OpenStreetMap Tile Layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Zoom Controls (optional)
        if (showZoomControl) {
          L.control.zoom({ position: "topright" }).addTo(map);
        }

        // Click on map for manual location placement
        if (onManualLocationChange) {
          map.on("click", (e: any) => {
            const { lat, lng } = e.latlng;
            onManualLocationChange([lat, lng]);
          });
        }

        leafletMapRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);

        // ResizeObserver to handle aspect ratio / mobile layout changes
        if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
          });
          resizeObserver.observe(mapContainerRef.current);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersLayerRef.current = null;
        routeUnderlayRef.current = null;
        routeForegroundRef.current = null;
      }
    };
  }, []);

  // 2. Update Markers & Route Layer
  useEffect(() => {
    if (!leafletMapRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = leafletMapRef.current;
      const markersGroup = markersLayerRef.current;
      if (!map || !markersGroup) return;

      markersGroup.clearLayers();

      // Render User Location Pin (Blue pulse circle)
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "custom-user-pin",
          html: `
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(74, 111, 165, 0.3); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 18px; height: 18px; border-radius: 50%; background: #4a6fa5; border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(74,111,165,0.5);"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 })
          .addTo(markersGroup)
          .bindPopup("<div style='font-size: 12px; font-weight: bold;'>Lokasi Anda</div>");
      }

      // Render Health Facilities Pins (Teardrop Location Pin Shape - Clean minimal without emoji)
      const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 768;
      const renderedFacilityIds = new Set<string>();

      pharmacies.forEach((facility) => {
        renderedFacilityIds.add(String(facility.id));
        const isSelected = selectedPharmacy?.id === facility.id;
        const isHospital = facility.facilityType === "hospital";
        const isClinic = facility.facilityType === "clinic";

        // Warna: Apotek = Biru (#4a6fa5), Klinik = Kuning (#F59E0B), Rumah Sakit = Merah (#EF4444)
        const pinColor = isHospital ? "#EF4444" : isClinic ? "#F59E0B" : "#4a6fa5";

        const width = isMobileScreen ? (isSelected ? 30 : 22) : (isSelected ? 38 : 28);
        const height = isMobileScreen ? (isSelected ? 37 : 27) : (isSelected ? 46 : 34);

        const iconHtml = isSelected
          ? `
            <div style="position: relative; width: ${width}px; height: ${height}px; filter: drop-shadow(0 4px 10px ${pinColor}90); transform: scale(1.1); transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer;">
              <svg width="${width}" height="${height}" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="2.5"/>
                <circle cx="17" cy="16" r="8.5" fill="#FFFFFF"/>
              </svg>
            </div>
          `
          : `
            <div style="position: relative; width: ${width}px; height: ${height}px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3)); transition: all 0.2s ease; cursor: pointer;">
              <svg width="${width}" height="${height}" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="1.8"/>
                <circle cx="17" cy="16" r="7.5" fill="#FFFFFF"/>
              </svg>
            </div>
          `;

        const facilityIcon = L.divIcon({
          className: `custom-facility-pin-${facility.id}`,
          html: iconHtml,
          iconSize: [width, height],
          iconAnchor: [width / 2, height],
        });

        const m = L.marker([facility.lat, facility.lon], {
          icon: facilityIcon,
          zIndexOffset: isSelected ? 900 : 100,
        }).addTo(markersGroup);

        m.on("click", () => onSelectPharmacy(facility));
      });

      // Always render selected destination pin if not already rendered
      if (selectedPharmacy && !renderedFacilityIds.has(String(selectedPharmacy.id))) {
        const isHospital = selectedPharmacy.facilityType === "hospital";
        const isClinic = selectedPharmacy.facilityType === "clinic";
        const pinColor = isHospital ? "#EF4444" : isClinic ? "#F59E0B" : "#4a6fa5";
        const width = isMobileScreen ? 30 : 38;
        const height = isMobileScreen ? 37 : 46;
        const iconHtml = `
          <div style="position: relative; width: ${width}px; height: ${height}px; filter: drop-shadow(0 4px 10px ${pinColor}90); transform: scale(1.1); transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer;">
            <svg width="${width}" height="${height}" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="2.5"/>
              <circle cx="17" cy="16" r="8.5" fill="#FFFFFF"/>
            </svg>
          </div>
        `;
        const facilityIcon = L.divIcon({
          className: `custom-facility-pin-${selectedPharmacy.id}`,
          html: iconHtml,
          iconSize: [width, height],
          iconAnchor: [width / 2, height],
        });
        const m = L.marker([selectedPharmacy.lat, selectedPharmacy.lon], {
          icon: facilityIcon,
          zIndexOffset: 1200,
        }).addTo(markersGroup);
        m.on("click", () => onSelectPharmacy(selectedPharmacy));
      }

      // Clear previous polylines
      if (routeUnderlayRef.current) {
        map.removeLayer(routeUnderlayRef.current);
        routeUnderlayRef.current = null;
      }
      if (routeForegroundRef.current) {
        map.removeLayer(routeForegroundRef.current);
        routeForegroundRef.current = null;
      }

      // Render OSRM Route Polyline
      if (routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 1) {
        // White Underlay
        const underlay = L.polyline(routeInfo.coordinates, {
          color: "#FFFFFF",
          weight: 9,
          opacity: 0.95,
        }).addTo(map);
        routeUnderlayRef.current = underlay;

        // Primary Blue Route Line
        const foreground = L.polyline(routeInfo.coordinates, {
          color: "#4A6FA5",
          weight: 5,
          opacity: 1,
        }).addTo(map);
        routeForegroundRef.current = foreground;

        // Fit Map Bounds to Route
        map.fitBounds(foreground.getBounds(), { padding: [50, 50] });
      } else if (selectedPharmacy) {
        map.panTo([selectedPharmacy.lat, selectedPharmacy.lon]);
      } else if (userLocation) {
        map.panTo(userLocation);
      }
    });
  }, [userLocation, pharmacies, selectedPharmacy, routeInfo, onSelectPharmacy]);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-0 z-0" />
    </div>
  );
}
