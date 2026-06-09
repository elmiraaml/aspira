"use client";

import React, { useState, useEffect, useRef } from "react";
import { WebView } from "react-native-webview";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Platform, Animated
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

function SuccessOverlay({ visible, reportTitle }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      progressAnim.setValue(0);
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]),
        Animated.spring(checkAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        Animated.timing(progressAnim, { toValue: 1, duration: 2200, useNativeDriver: false }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      checkAnim.setValue(0);
      progressAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <Animated.View style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999, opacity: fadeAnim,
    }}>
      <Animated.View style={{
        backgroundColor: "#ffffff", borderRadius: 28, padding: 32,
        alignItems: "center", width: 300,
        transform: [{ scale: scaleAnim }],
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
      }}>
        <Animated.View style={{
          width: 88, height: 88, borderRadius: 44,
          backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center",
          marginBottom: 20, transform: [{ scale: checkAnim }],
        }}>
          <Feather name="check-circle" size={48} color="#16a34a" />
        </Animated.View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 8, textAlign: "center" }}>
          Laporan Terkirim!
        </Text>
        <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 22, marginBottom: 6 }}>
          Laporan <Text style={{ fontWeight: "600", color: "#374151" }}>"{reportTitle}"</Text> berhasil dikirim.
        </Text>
        <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 20, marginBottom: 24 }}>
          Tim kami akan segera meninjau pengaduan Anda dan memberikan tindak lanjut secepatnya.
        </Text>
        <View style={{ width: "100%", height: 4, backgroundColor: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
          <Animated.View style={{ height: "100%", backgroundColor: "#16a34a", borderRadius: 2, width: progressWidth }} />
        </View>
        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>Mengalihkan halaman...</Text>
      </Animated.View>
    </Animated.View>
  );
}

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

const EMPTY_FORM = {
  title: "",
  description: "",
  category_id: "",
  location: "",
  incident_date: "",
  priority: "low",
  image: null,
};

const DEFAULT_REGION = {
  latitude: -6.2,
  longitude: 106.8,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function Create() {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState("");
  const [inAppAlert, setInAppAlert] = useState({ type: "", message: "" });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // map states
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const debounceRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

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

  const fetchCategories = async () => {
    try {
      const res = await api.get("/reports/categories");
      if (Array.isArray(res.data)) setCategories(res.data);
      else setInAppAlert({ type: "error", message: "Gagal memuat kategori" });
    } catch {
      setInAppAlert({ type: "error", message: "Gagal memuat kategori, coba lagi" });
    } finally {
      setLoadingCats(false);
    }
  };

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));
  const showAlert = (type, message) => setInAppAlert({ type, message });

  const pushMarkerToIframe = (lat, lng) => {
    if (Platform.OS === "web" && iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ type: "setMarker", lat, lng }),
        "*"
      );
    }
  };

  // --- MAP HANDLERS ---
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
    setMapRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
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
            setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
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
          () => {
            showAlert("error", "Gagal mendapatkan lokasi GPS.");
            setLoadingGps(false);
          },
          { timeout: 10000 }
        );
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert("error", "Izin lokasi ditolak.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "Accept-Language": "id" } }
      );
      const data = await res.json();
      const name = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setSearchQuery(name);
      updateField("location", name);
    } catch {
      showAlert("error", "Gagal mendapatkan lokasi GPS.");
    } finally {
      if (Platform.OS !== "web") setLoadingGps(false);
    }
  };

  // --- IMAGE ---
  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          showAlert("error", "Ukuran gambar maksimal 5MB");
          return;
        }
        const uri = URL.createObjectURL(file);
        updateField("image", { uri, file, name: file.name, type: file.type });
      };
      input.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert("error", "Kami membutuhkan izin akses galeri.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        showAlert("error", "Ukuran gambar maksimal 5MB");
        return;
      }
      updateField("image", asset);
    }
  };

  const validate = () => {
    const { title, description, category_id, location, incident_date, image } = formData;
    if (!title.trim())       { showAlert("error", "Judul laporan wajib diisi.");        return false; }
    if (!description.trim()) { showAlert("error", "Deskripsi kejadian wajib diisi.");   return false; }
    if (!category_id)        { showAlert("error", "Kategori laporan wajib dipilih.");   return false; }
    if (!location.trim())    { showAlert("error", "Lokasi kejadian wajib diisi.");      return false; }
    if (!incident_date)      { showAlert("error", "Tanggal kejadian wajib diisi.");     return false; }
    if (!image)              { showAlert("error", "Foto bukti wajib diupload.");        return false; }
    return true;
  };

  const handleSubmit = async () => {
    setInAppAlert({ type: "", message: "" });
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        showAlert("error", "Anda harus login terlebih dahulu");
        router.replace("/(auth)/login");
        return;
      }
      let imageUrl = null;
      if (formData.image) {
        const uploadData = new FormData();
        if (Platform.OS === "web") {
          uploadData.append("image", formData.image.file);
        } else {
          const localUri = formData.image.uri;
          const filename = localUri.split("/").pop() || "upload.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";
          uploadData.append("image", { uri: localUri, name: filename, type });
        }
        const uploadRes = await api.post("/reports/upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        imageUrl = uploadRes.data.image_url;
      }
      const res = await api.post(
        "/reports",
        {
          category_id: String(formData.category_id),
          title: formData.title.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          incident_date: formData.incident_date,
          priority: formData.priority,
          image: imageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201 || res.status === 200) {
        const sentTitle = formData.title.trim();
        setFormData(EMPTY_FORM);
        setSearchQuery("");
        setMapRegion(DEFAULT_REGION);
        setInAppAlert({ type: "", message: "" });
        setSubmittedTitle(sentTitle);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.replace("/(tabs)");
        }, 3000);
      }
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Gagal mengirim laporan");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${month}/${day}/${year}`;
  };

  const cardStyle = {
    backgroundColor: "#ffffff", borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  };

  const inputStyle = {
    backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6",
    borderRadius: 12, padding: 14, fontSize: 15, color: "#374151",
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

  return (
    <View style={{ flex: 1 }}>
      <SuccessOverlay visible={showSuccess} reportTitle={submittedTitle} />

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f8fafd" }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={{ padding: 24, paddingTop: 60, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
          <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.2 }}>Formulir Baru</Text>
          <Text style={{ fontSize: 24, color: "#111827", fontWeight: "bold", marginTop: 4 }}>Buat Pengaduan</Text>
        </View>

        <View style={{ padding: 20 }}>

          {/* ALERT */}
          {inAppAlert.message ? (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 10,
              marginBottom: 16, padding: 14, borderRadius: 16, borderWidth: 1,
              backgroundColor: inAppAlert.type === "success" ? "#f0fdf4" : "#fef2f2",
              borderColor:     inAppAlert.type === "success" ? "#bbf7d0" : "#fecaca",
            }}>
              <Feather
                name={inAppAlert.type === "success" ? "check-circle" : "alert-circle"}
                size={16}
                color={inAppAlert.type === "success" ? "#16a34a" : "#dc2626"}
              />
              <Text style={{ fontSize: 13, fontWeight: "500", flex: 1, color: inAppAlert.type === "success" ? "#16a34a" : "#dc2626" }}>
                {inAppAlert.message}
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
              placeholder="Jelaskan kejadian secara lengkap dan jelas..." placeholderTextColor="#9ca3af"
              multiline numberOfLines={4} textAlignVertical="top"
              value={formData.description} onChangeText={(t) => updateField("description", t)}
              style={[inputStyle, { minHeight: 100 }]}
            />
          </View>

          {/* KATEGORI */}
          <View style={cardStyle}>
            <SectionLabel iconName="tag" iconColor="#2563eb" iconBg="#eff6ff" label="Kategori *" />
            {loadingCats ? (
              <ActivityIndicator color="#2563eb" style={{ marginVertical: 8 }} />
            ) : Platform.OS === "web" ? (
              <select
                value={formData.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  border: "1px solid #f3f4f6", backgroundColor: "#f9fafb",
                  fontSize: 15, color: formData.category_id ? "#374151" : "#9ca3af",
                  outline: "none", cursor: "pointer",
                }}
              >
                <option value="">Pilih kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
            ) : (
              <View style={{ backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 12, overflow: "hidden" }}>
                <Picker
                  selectedValue={formData.category_id}
                  onValueChange={(val) => updateField("category_id", val)}
                  style={{ color: formData.category_id ? "#374151" : "#9ca3af" }}
                >
                  <Picker.Item label="Pilih kategori..." value="" color="#9ca3af" />
                  {categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.category_name} value={cat.id} color="#374151" />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* LOKASI */}
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
                max={(() => {
                  const d = new Date();
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                })()}
                onChange={(e) => updateField("incident_date", e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  border: "1px solid #f3f4f6", backgroundColor: "#f9fafb",
                  fontSize: 15, color: "#374151", outline: "none", boxSizing: "border-box",
                }}
              />
            ) : (
              (() => {
                const DateTimePicker = require("@react-native-community/datetimepicker").default;
                const dateForPicker = formData.incident_date ? new Date(formData.incident_date) : new Date();
                return (
                  <>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      style={[inputStyle, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
                    >
                      <Text style={{ fontSize: 15, color: formData.incident_date ? "#374151" : "#9ca3af" }}>
                        {formData.incident_date ? formatDateDisplay(formData.incident_date) : "mm/dd/yyyy"}
                      </Text>
                      <Feather name="calendar" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={dateForPicker}
                        mode="date" display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(Platform.OS === "ios");
                          if (event.type === "set" && selectedDate) {
                            updateField("incident_date", selectedDate.toISOString().split("T")[0]);
                          }
                        }}
                      />
                    )}
                  </>
                );
              })()
            )}
          </View>

          {/* PRIORITAS */}
          <View style={cardStyle}>
            <SectionLabel iconName="alert-circle" iconColor="#d97706" iconBg="#fef3c7" label="Tingkat Prioritas *" />
            {Platform.OS === "web" ? (
              <select
                value={formData.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  border: "1px solid #f3f4f6", backgroundColor: "#f9fafb",
                  fontSize: 15, color: "#374151", outline: "none", cursor: "pointer",
                }}
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="urgent">Mendesak</option>
              </select>
            ) : (
              <View style={{ backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 12, overflow: "hidden" }}>
                <Picker
                  selectedValue={formData.priority}
                  onValueChange={(val) => updateField("priority", val)}
                  style={{ color: "#374151" }}
                >
                  <Picker.Item label="Rendah"   value="low"    color="#374151" />
                  <Picker.Item label="Sedang"   value="medium" color="#374151" />
                  <Picker.Item label="Tinggi"   value="high"   color="#374151" />
                  <Picker.Item label="Mendesak" value="urgent" color="#374151" />
                </Picker>
              </View>
            )}
          </View>

          {/* FOTO BUKTI */}
          <View style={cardStyle}>
            <SectionLabel iconName="image" iconColor="#9333ea" iconBg="#faf5ff" label="Foto Bukti *" />
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                borderWidth: 2,
                borderColor: !formData.image && inAppAlert.message.includes("Foto bukti") ? "#fca5a5" : "#e5e7eb",
                borderStyle: "dashed", borderRadius: 16, padding: 24,
                alignItems: "center", justifyContent: "center",
                backgroundColor: formData.image ? "#ffffff" : "#f9fafb",
              }}
            >
              {formData.image ? (
                <>
                  <Image
                    source={{ uri: formData.image.uri }}
                    style={{ width: "100%", height: 200, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Ketuk untuk ganti foto</Text>
                </>
              ) : (
                <>
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Feather name="upload" size={24} color="#3b82f6" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#4b5563" }}>Upload Gambar</Text>
                  <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>JPG, PNG maks. 5MB</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#93c5fd" : "#2563eb",
              padding: 18, borderRadius: 14,
              alignItems: "center", justifyContent: "center",
              flexDirection: "row", marginBottom: 40,
              shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
            }}
          >
            {submitting ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16 }}>Mengirim...</Text>
              </>
            ) : (
              <>
                <Feather name="send" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16 }}>Kirim Laporan</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}