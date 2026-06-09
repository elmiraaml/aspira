"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position]);
  return null;
}

function ClickHandler({ onLocationSelect, setQuery }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "Accept-Language": "id" } }
        );
        const data = await res.json();
        const name = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setQuery(name);
        onLocationSelect(lat, lng, name);
      } catch {
        const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setQuery(fallback);
        onLocationSelect(lat, lng, fallback);
      }
    },
  });
  return null;
}

export default function LocationPickerMap({ position, onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const markerIcon = useMemo(() => L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }), []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setGpsError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=id`,
          { headers: { "Accept-Language": "id" } }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const name = place.display_name;
    setQuery(name);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect(lat, lng, name);
  };

  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Browser tidak mendukung GPS.");
      return;
    }
    setLoadingGps(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "id" } }
          );
          const data = await res.json();
          const name = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setQuery(name);
          onLocationSelect(lat, lng, name);
        } catch {
          const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setQuery(fallback);
          onLocationSelect(lat, lng, fallback);
        }
        setLoadingGps(false);
      },
      (err) => {
        setLoadingGps(false);
        if (err.code === 1)
          setGpsError("Izin lokasi ditolak. Aktifkan di pengaturan browser.");
        else setGpsError("Gagal mendapatkan lokasi GPS.");
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div ref={wrapperRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              {loadingSuggestions ? (
                <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Cari nama jalan, tempat, atau kelurahan..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition"
            />
          </div>

          <button
            type="button"
            onClick={handleGps}
            disabled={loadingGps}
            title="Gunakan lokasi saat ini"
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-60 whitespace-nowrap"
          >
            {loadingGps ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
                <circle cx="12" cy="9" r="2.5" strokeWidth={2} />
              </svg>
            )}
            <span className="hidden sm:inline">
              {loadingGps ? "Mencari..." : "Lokasi Saya"}
            </span>
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-[9999] mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
            {suggestions.map((place) => (
              <li key={place.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(place)}
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50 transition"
                >
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
                    <circle cx="12" cy="9" r="2.5" strokeWidth={2} />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-700 leading-snug line-clamp-1">
                      {place.name || place.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-gray-400 leading-snug line-clamp-1">
                      {place.display_name}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {gpsError && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {gpsError}
        </p>
      )}

      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "280px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <RecenterMap position={position} />
        <ClickHandler onLocationSelect={onLocationSelect} setQuery={setQuery} />
        <Marker position={position} icon={markerIcon} />
      </MapContainer>

      <p className="text-[11px] text-gray-400 text-center">
        Cari nama tempat di atas, gunakan GPS, atau klik langsung di peta
      </p>
    </div>
  );
}