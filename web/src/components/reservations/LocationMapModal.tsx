"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, MapPin, Check, Loader2, Navigation, Info } from "lucide-react";
import { TIAONG_ORIGIN_LAT, TIAONG_ORIGIN_LNG, calculateHaversineDistance } from "@/utils/distance";

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (locationData: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    distanceKm: number;
    transpoFee: number;
  }) => void;
}

export const LocationMapModal: React.FC<LocationMapModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const venueMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number }>({
    lat: TIAONG_ORIGIN_LAT,
    lng: TIAONG_ORIGIN_LNG,
  });

  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [transpoFee, setTranspoFee] = useState<number>(0);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(false);

  const [addressDetails, setAddressDetails] = useState({
    street: "",
    barangay: "",
    city: "",
    province: "",
  });

  // Load Leaflet Assets dynamically
  useEffect(() => {
    if (!isOpen) return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const jsId = "leaflet-js";
    if (!document.getElementById(jsId)) {
      const script = document.createElement("script");
      script.id = jsId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, [isOpen]);

  // Reverse Geocoding via Nominatim API (100% Free OpenStreetMap)
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        const street =
          addr.road || addr.street || addr.pedestrian || addr.building || addr.suburb || "";
        const barangay =
          addr.quarter || addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || "";
        const city =
          addr.city || addr.town || addr.municipality || addr.county || addr.district || "";
        const province = addr.state || addr.region || addr.province || "Quezon";

        setAddressDetails({
          street,
          barangay,
          city,
          province,
        });
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Clean existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialLat = pinnedCoords.lat || TIAONG_ORIGIN_LAT;
    const initialLng = pinnedCoords.lng || TIAONG_ORIGIN_LNG;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([initialLat, initialLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom Origin Icon (Green Pin for Antonioni Grounds)
    const originIcon = L.divIcon({
      className: "custom-origin-icon",
      html: `
        <div style="background-color: #059669; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Custom Venue Icon (Emerald Draggable Pin)
    const venueIcon = L.divIcon({
      className: "custom-venue-icon",
      html: `
        <div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(37,99,235,0.4); transform: scale(1.1); transition: transform 0.2s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    // Add Origin Marker
    L.marker([TIAONG_ORIGIN_LAT, TIAONG_ORIGIN_LNG], { icon: originIcon })
      .addTo(map)
      .bindPopup("<b>Origin Point</b><br>Antonioni Grounds - Tiaong, Quezon");

    // Add Venue Marker (Draggable)
    const venueMarker = L.marker([initialLat, initialLng], {
      icon: venueIcon,
      draggable: true,
    }).addTo(map);

    venueMarkerRef.current = venueMarker;

    // Add Polyline
    const polyline = L.polyline(
      [
        [TIAONG_ORIGIN_LAT, TIAONG_ORIGIN_LNG],
        [initialLat, initialLng],
      ],
      { color: "#2563eb", weight: 3, dashArray: "6, 8", opacity: 0.8 }
    ).addTo(map);

    polylineRef.current = polyline;

    const updatePinPosition = (lat: number, lng: number) => {
      setPinnedCoords({ lat, lng });

      // Update Polyline
      polyline.setLatLngs([
        [TIAONG_ORIGIN_LAT, TIAONG_ORIGIN_LNG],
        [lat, lng],
      ]);

      // Calculate Distance
      const dist = calculateHaversineDistance(lat, lng, TIAONG_ORIGIN_LAT, TIAONG_ORIGIN_LNG);
      setDistanceKm(dist);

      const fee = dist <= 6 ? 0 : Math.round((dist - 6) * 80);
      setTranspoFee(fee);

      // Reverse Geocode
      reverseGeocode(lat, lng);
    };

    // Initial Distance calculation
    updatePinPosition(initialLat, initialLng);

    // Marker Drag Event
    venueMarker.on("dragend", (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      updatePinPosition(lat, lng);
    });

    // Map Click Event
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      venueMarker.setLatLng([lat, lng]);
      updatePinPosition(lat, lng);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, leafletLoaded]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      street: addressDetails.street,
      barangay: addressDetails.barangay,
      city: addressDetails.city,
      province: addressDetails.province,
      distanceKm,
      transpoFee,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border bg-card/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Navigation size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Pin Venue Location
                </h3>
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  OpenStreetMap Powered • 100% Free
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-sans">
                Drag the marker or click anywhere on the map to choose your event venue
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-foreground rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Distance & Fee Summary Badge */}
        <div className="px-6 py-3 bg-emerald-500/5 border-b border-emerald-500/15 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-sans">
              <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">
                Origin Point
              </span>
              <span className="font-semibold text-foreground">
                J.P Rizal St., Poblacion 3, Tiaong, Quezon
              </span>
            </div>

            <div className="h-6 w-[1px] bg-zinc-300 dark:bg-white/10 hidden sm:block" />

            <div className="text-[11px] font-sans">
              <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">
                Distance
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {distanceKm.toFixed(1)} km
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider font-sans">
              Calculated Transpo Fee
            </span>
            <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
              {transpoFee === 0 ? "FREE (₱0)" : `₱${transpoFee.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[380px] sm:h-[420px] bg-zinc-900">
          {!leafletLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-card text-foreground gap-2 font-sans text-xs">
              <Loader2 size={18} className="animate-spin text-emerald-500" />
              Loading Interactive Map...
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Reverse Geocoded Address Preview & Confirm Bar */}
        <div className="p-4 sm:p-5 border-t border-card-border bg-card/90 space-y-3">
          <div className="flex items-start gap-2 text-xs font-sans">
            <MapPin size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-foreground block text-[11px]">
                Detected Pinned Address:
              </span>
              {isGeocoding ? (
                <span className="text-zinc-400 italic text-[11px] flex items-center gap-1.5 mt-0.5">
                  <Loader2 size={12} className="animate-spin text-emerald-500" />
                  Fetching address details from map coordinates...
                </span>
              ) : (
                <span className="text-zinc-400 block text-[11px]">
                  {[
                    addressDetails.street,
                    addressDetails.barangay ? `Brgy. ${addressDetails.barangay}` : "",
                    addressDetails.city,
                    addressDetails.province,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Click on the map or drag the pin to set venue location"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200/10">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-sans">
              <Info size={12} className="text-emerald-500 shrink-0" />
              <span>You can refine the street & barangay text afterwards.</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-sans font-semibold rounded-lg border border-card-border text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 text-xs font-sans font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} className="stroke-[3]" />
                Confirm Selected Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
