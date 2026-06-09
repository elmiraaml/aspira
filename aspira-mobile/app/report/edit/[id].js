import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert, KeyboardAvoidingView
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { WebView } from "react-native-webview";
import { api } from "../../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

function SectionLabel({ iconName, iconColor, iconBg, label }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: iconBg, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
        <Feather name={iconName} size={16} color={iconColor} />
      </View>
      <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>{label}</Text>
    </View>
  );
}

export default function EditReport() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [formData, setFormData] = useState({
    title: "", description: "", category_id: "", location: "", incident_date: "",
  });

  // map states
  const [mapRegion, setMapRegion] = useState({ latitude: -6.2, longitude: 106.8 });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const debounceRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => { loadData(); }, [id]);

  // listener postMessage dari iframe (web)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleMessage = async (event) => {
      try {
        const { lat, lng } = JSON.parse(event.data);
        if (typeof lat !== "number" || typeof lng !== "number") return;
        setMapRegion((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "Accept-Language": "id" } }
        );
        const data = await res.json();
        const name = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setSearchQuery(name);
        updateField("location", name);
      } catch {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const loadData = async () => {
    try {
      const [resReport, resCats] = await Promise.all([
        api.get(`/reports/${id}`),
        api.get("/reports/categories"),
      ]);

      const r = resReport.data.report || resReport.data;

      if (r.status !== "pending") {
        Alert.alert("Tidak bisa diedit", "Laporan ini sudah diproses dan tidak dapat diedit.");
        router.back();
        return;
      }

      const locationValue = r.location || "";

      setFormData({
        title: r.title || "",
        description: r.description || "",
        category_id: String(r.category_id || ""),
        location: locationValue,
        incident_date: r.incident_date ? r.incident_date.split("T")[0] : "",
      });

      setSearchQuery(locationValue);

      // Geocode lokasi lama untuk posisi awal peta
      if (locationValue) {
        const coordMatch = locationValue.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
        if (coordMatch) {
          setMapRegion({ latitude: parseFloat(coordMatch[1]), longitude: parseFloat(coordMatch[2]) });
        } else {
          try {
            const geo = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationValue)}&format=json&limit=1`,
              { headers: { "Accept-Language": "id" } }
            );
            const geoData = await geo.json();
            if (geoData[0]) {
              setMapRegion({ latitude: parseFloat(geoData[0].lat), longitude: parseFloat(geoData[0].lon) });
            }
          } catch {}
        }
      }

      if (Array.isArray(resCats.data)) setCategories(resCats.data);
    } catch (err) {
      console.log("Load error:", err);
      Alert.alert("Error", "Gagal memuat data laporan");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const pushMarkerToIframe = (lat, lng) => {
    if (Platform.OS === "web" && iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ type: "setMarker", lat, lng }), "*"
      );
    }
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=id`,
          { headers: { "Accept-Language": "id" } }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {} finally { setLoadingSuggestions(false); }
    }, 400);
  };

  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const name = place.display_name;
    setSearchQuery(name);
    setSuggestions([]);
    setMapRegion({ latitude: lat, longitude: lng });
    updateField("location", name);
    pushMarkerToIframe(lat, lng);
  };

  const handleGps = async () => {
    setLoadingGps(true);
    try {
      if (Platform.OS === "web") {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setMapRegion({ latitude, longitude });
            pushMarkerToIframe(latitude, longitude);
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                { headers: { "Accept-Language": "id" } }
              );
              const data = await res.json();
              const name = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setSearchQuery(name);
              updateField("location", name);
            } catch {
              const fallback = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setSearchQuery(fallback);
              updateField("location", fallback);
            }
            setLoadingGps(false);
          },
          () => { setAlert({ type: "error", message: "Gagal mendapatkan lokasi GPS." }); setLoadingGps(false); },
          { timeout: 10000 }
        );
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { setAlert({ type: "error", message: "Izin lokasi ditolak." }); return; }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setMapRegion({ latitude, longitude });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "Accept-Language": "id" } }
      );
      const data = await res.json();
      const name = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setSearchQuery(name);
      updateField("location", name);
    } catch {
      setAlert({ type: "error", message: "Gagal mendapatkan lokasi GPS." });
    } finally {
      if (Platform.OS !== "web") setLoadingGps(false);
    }
  };

  const validate = () => {
    const { title, description, category_id, location, incident_date } = formData;
    if (!title.trim())       { setAlert({ type: "error", message: "Judul wajib diisi." });      return false; }
    if (!description.trim()) { setAlert({ type: "error", message: "Deskripsi wajib diisi." });  return false; }
    if (!category_id)        { setAlert({ type: "error", message: "Kategori wajib dipilih." }); return false; }
    if (!location.trim())    { setAlert({ type: "error", message: "Lokasi wajib diisi." });     return false; }
    if (!incident_date)      { setAlert({ type: "error", message: "Tanggal wajib diisi." });    return false; }
    return true;
  };

  const handleSubmit = async () => {
    setAlert({ type: "", message: "" });
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) { router.replace("/(auth)/login"); return; }

      await api.put(
        `/reports/${id}`,
        {
          category_id: String(formData.category_id),
          title: formData.title.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          incident_date: formData.incident_date,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ type: "success", message: "Laporan berhasil diperbarui!" });
      setTimeout(() => { router.replace(`/report/${id}`); }, 1500);
    } catch (err) {
      console.log("Update error:", err.response?.data || err.message);
      setAlert({ type: "error", message: err.response?.data?.message || "Gagal memperbarui laporan" });
    } finally {
      setSubmitting(false);
    }
  };

  const mapHtml = `
    <!DOCTYPE html><html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>* { margin:0; padding:0; } #map { width:100%; height:100vh; }</style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${mapRegion.latitude}, ${mapRegion.longitude}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        var marker = L.marker([${mapRegion.latitude}, ${mapRegion.longitude}]).addTo(map);
        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          var msg = JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng });
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(msg);
          } else {
            window.parent.postMessage(msg, '*');
          }
        });
        window.addEventListener('message', function(e) {
          try {
            var d = JSON.parse(e.data);
            if (d.type === 'setMarker') {
              marker.setLatLng([d.lat, d.lng]);
              map.setView([d.lat, d.lng], 15);
            }
          } catch {}
        });
      </script>
    </body></html>
  `;

  const cardStyle = {
    backgroundColor: "#ffffff", borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6",
  };
  const inputStyle = {
    backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6",
    borderRadius: 12, padding: 14, fontSize: 15, color: "#374151",
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafd" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingTop: 60, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#f9fafb" }}>
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <View style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Edit</Text>
          <Text style={{ fontSize: 18, color: "#111827", fontWeight: "bold" }}>Ubah Laporan</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: "#f8fafd" }} keyboardShouldPersistTaps="handled">
        <View style={{ padding: 20 }}>

          {/* ALERT */}
          {alert.message ? (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 10,
              marginBottom: 16, padding: 14, borderRadius: 16, borderWidth: 1,
              backgroundColor: alert.type === "success" ? "#f0fdf4" : "#fef2f2",
              borderColor: alert.type === "success" ? "#bbf7d0" : "#fecaca",
            }}>
              <Feather name={alert.type === "success" ? "check-circle" : "alert-circle"} size={16} color={alert.type === "success" ? "#16a34a" : "#dc2626"} />
              <Text style={{ fontSize: 13, fontWeight: "500", flex: 1, color: alert.type === "success" ? "#16a34a" : "#dc2626" }}>
                {alert.message}
              </Text>
            </View>
          ) : null}

          {/* JUDUL */}
          <View style={cardStyle}>
            <SectionLabel iconName="file-text" iconColor="#9333ea" iconBg="#faf5ff" label="Judul Laporan *" />
            <TextInput
              placeholder="Masukkan judul laporan..." placeholderTextColor="#9ca3af"
              value={formData.title} onChangeText={(t) => updateField("title", t)}
              style={inputStyle}
            />
          </View>

          {/* DESKRIPSI */}
          <View style={cardStyle}>
            <SectionLabel iconName="align-left" iconColor="#d97706" iconBg="#fef3c7" label="Deskripsi *" />
            <TextInput
              placeholder="Jelaskan kejadian..." placeholderTextColor="#9ca3af"
              multiline numberOfLines={4} textAlignVertical="top"
              value={formData.description} onChangeText={(t) => updateField("description", t)}
              style={[inputStyle, { minHeight: 100 }]}
            />
          </View>

          {/* KATEGORI */}
          <View style={cardStyle}>
            <SectionLabel iconName="tag" iconColor="#2563eb" iconBg="#eff6ff" label="Kategori *" />
            {Platform.OS === "web" ? (
              <select
                value={formData.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #f3f4f6", backgroundColor: "#f9fafb", fontSize: 15, color: "#374151", outline: "none" }}
              >
                <option value="">Pilih kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
            ) : (
              <View style={{ backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 12, overflow: "hidden" }}>
                <Picker selectedValue={formData.category_id} onValueChange={(val) => updateField("category_id", val)}>
                  <Picker.Item label="Pilih kategori..." value="" color="#9ca3af" />
                  {categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.category_name} value={String(cat.id)} color="#374151" />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* LOKASI — map interaktif */}
          <View style={cardStyle}>
            <SectionLabel iconName="map-pin" iconColor="#16a34a" iconBg="#dcfce7" label="Lokasi Kejadian *" />

            {/* Search bar */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Cari nama jalan, tempat, atau kelurahan..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  style={[inputStyle, { paddingLeft: 36 }]}
                />
                <View style={{ position: "absolute", left: 12, top: 0, bottom: 0, justifyContent: "center" }}>
                  {loadingSuggestions
                    ? <ActivityIndicator size={14} color="#9ca3af" />
                    : <Feather name="search" size={14} color="#9ca3af" />
                  }
                </View>
              </View>
              <TouchableOpacity
                onPress={handleGps}
                disabled={loadingGps}
                style={{
                  backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6",
                  borderRadius: 12, paddingHorizontal: 14, justifyContent: "center", alignItems: "center",
                }}
              >
                {loadingGps
                  ? <ActivityIndicator size={14} color="#2563eb" />
                  : <Feather name="navigation" size={16} color="#2563eb" />
                }
              </TouchableOpacity>
            </View>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <View style={{
                backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb",
                borderRadius: 12, marginBottom: 8, overflow: "hidden",
              }}>
                {suggestions.map((place) => (
                  <TouchableOpacity
                    key={place.place_id}
                    onPress={() => handleSelectSuggestion(place)}
                    style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}
                  >
                    <Text style={{ fontSize: 13, color: "#374151" }} numberOfLines={1}>
                      {place.name || place.display_name.split(",")[0]}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }} numberOfLines={1}>
                      {place.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Map */}
            {isNative ? (
              <WebView
                style={{ height: 260, borderRadius: 12 }}
                originWhitelist={["*"]}
                javaScriptEnabled
                source={{ html: mapHtml }}
                onMessage={async (event) => {
                  const { lat, lng } = JSON.parse(event.nativeEvent.data);
                  setMapRegion((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                  try {
                    const res = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                      { headers: { "Accept-Language": "id" } }
                    );
                    const data = await res.json();
                    const name = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setSearchQuery(name);
                    updateField("location", name);
                  } catch {
                    const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setSearchQuery(fallback);
                    updateField("location", fallback);
                  }
                }}
              />
            ) : (
              <View style={{ height: 260, borderRadius: 12, overflow: "hidden" }}>
                <iframe
                  ref={iframeRef}
                  srcDoc={mapHtml}
                  style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
                />
              </View>
            )}

            <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 6 }}>
              Cari nama tempat, gunakan GPS, atau ketuk langsung di peta
            </Text>
          </View>

          {/* TANGGAL */}
          <View style={cardStyle}>
            <SectionLabel iconName="calendar" iconColor="#2563eb" iconBg="#eff6ff" label="Tanggal Kejadian *" />
            {Platform.OS === "web" ? (
              <input
                type="date"
                value={formData.incident_date}
                max={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()}
                onChange={(e) => updateField("incident_date", e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #f3f4f6", backgroundColor: "#f9fafb", fontSize: 15, color: "#374151", outline: "none", boxSizing: "border-box" }}
              />
            ) : (
              <TextInput
                placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af"
                value={formData.incident_date}
                onChangeText={(t) => updateField("incident_date", t)}
                style={inputStyle}
              />
            )}
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#93c5fd" : "#2563eb",
              padding: 18, borderRadius: 14, alignItems: "center",
              justifyContent: "center", flexDirection: "row", marginBottom: 40,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Feather name="save" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16 }}>Simpan Perubahan</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}