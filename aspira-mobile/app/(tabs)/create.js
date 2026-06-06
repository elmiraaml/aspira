import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator, Platform, Animated
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// ── Animasi Sukses (web-compatible, tanpa Modal) ──
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

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

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
          Laporan{" "}
          <Text style={{ fontWeight: "600", color: "#374151" }}>"{reportTitle}"</Text>
          {" "}berhasil dikirim.
        </Text>
        <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 20, marginBottom: 24 }}>
          Tim kami akan segera meninjau pengaduan Anda dan memberikan tindak lanjut secepatnya.
        </Text>

        <View style={{ width: "100%", height: 4, backgroundColor: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
          <Animated.View style={{
            height: "100%", backgroundColor: "#16a34a",
            borderRadius: 2, width: progressWidth,
          }} />
        </View>
        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>Mengalihkan halaman...</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── Label + Icon helper ──
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

// ── Main ──
export default function Create() {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    location: "",
    incident_date: new Date().toISOString().split("T")[0], // simpan sebagai string "YYYY-MM-DD"
    image: null,
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/reports/categories");
      if (Array.isArray(res.data)) setCategories(res.data);
      else Alert.alert("Error", "Gagal memuat kategori");
    } catch {
      Alert.alert("Error", "Gagal memuat kategori, coba lagi");
    } finally {
      setLoadingCats(false);
    }
  };

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      // Web: pakai input file HTML
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert("File Terlalu Besar", "Ukuran gambar maksimal 5MB");
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
      Alert.alert("Izin Ditolak", "Kami membutuhkan izin akses galeri.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert("File Terlalu Besar", "Ukuran gambar maksimal 5MB");
        return;
      }
      updateField("image", asset);
    }
  };

  const handleSubmit = async () => {
    const { title, description, category_id, location, incident_date } = formData;
    if (!title.trim() || !description.trim() || !category_id || !location.trim()) {
      Alert.alert("Error", "Harap isi semua kolom yang wajib!");
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Anda harus login terlebih dahulu");
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
          category_id: String(category_id),
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          incident_date,
          image: imageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Response:", res.status, res.data);

      if (res.status === 201 || res.status === 200) {
        setSubmittedTitle(title.trim());
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/(tabs)");
        }, 3000);
      }
    } catch (err) {
      console.log("Submit error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Gagal mengirim laporan");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <View style={{ flex: 1 }}>
      <SuccessOverlay visible={showSuccess} reportTitle={submittedTitle} />

      <ScrollView style={{ flex: 1, backgroundColor: "#f8fafd" }}>
        {/* HEADER */}
        <View style={{ padding: 24, paddingTop: 60, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
          <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.2 }}>Formulir Baru</Text>
          <Text style={{ fontSize: 24, color: "#111827", fontWeight: "bold", marginTop: 4 }}>Buat Pengaduan</Text>
        </View>

        <View style={{ padding: 20 }}>

          {/* JUDUL */}
          <View style={cardStyle}>
            <SectionLabel iconName="file-text" iconColor="#9333ea" iconBg="#faf5ff" label="Judul Laporan" />
            <TextInput
              placeholder="Masukkan judul laporan..."
              placeholderTextColor="#9ca3af"
              value={formData.title}
              onChangeText={(t) => updateField("title", t)}
              style={inputStyle}
            />
          </View>

          {/* DESKRIPSI */}
          <View style={cardStyle}>
            <SectionLabel iconName="align-left" iconColor="#d97706" iconBg="#fef3c7" label="Deskripsi" />
            <TextInput
              placeholder="Jelaskan kejadian secara lengkap dan jelas..."
              placeholderTextColor="#9ca3af"
              multiline numberOfLines={4} textAlignVertical="top"
              value={formData.description}
              onChangeText={(t) => updateField("description", t)}
              style={[inputStyle, { minHeight: 100 }]}
            />
          </View>

          {/* KATEGORI */}
          <View style={cardStyle}>
            <SectionLabel iconName="tag" iconColor="#2563eb" iconBg="#eff6ff" label="Kategori" />
            {loadingCats ? (
              <ActivityIndicator color="#2563eb" style={{ marginVertical: 8 }} />
            ) : Platform.OS === "web" ? (
              // Web: pakai select HTML native
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
            <SectionLabel iconName="map-pin" iconColor="#16a34a" iconBg="#dcfce7" label="Lokasi Kejadian" />
            <TextInput
              placeholder="Contoh: Jakarta Timur"
              placeholderTextColor="#9ca3af"
              value={formData.location}
              onChangeText={(t) => updateField("location", t)}
              style={inputStyle}
            />
          </View>

          {/* TANGGAL - web pakai input date HTML */}
          <View style={cardStyle}>
            <SectionLabel iconName="calendar" iconColor="#2563eb" iconBg="#eff6ff" label="Tanggal Kejadian" />
            {Platform.OS === "web" ? (
              <input
                type="date"
                value={formData.incident_date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => updateField("incident_date", e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  border: "1px solid #f3f4f6", backgroundColor: "#f9fafb",
                  fontSize: 15, color: "#374151", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              // Mobile tetap pakai DateTimePicker
              (() => {
                const DateTimePicker = require("@react-native-community/datetimepicker").default;
                const [showPicker, setShowPicker] = useState(false);
                const dateObj = new Date(formData.incident_date);
                return (
                  <>
                    <TouchableOpacity
                      onPress={() => setShowPicker(true)}
                      style={[inputStyle, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
                    >
                      <Text style={{ fontSize: 15, color: "#374151" }}>
                        {dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </Text>
                      <Feather name="calendar" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                    {showPicker && (
                      <DateTimePicker
                        value={dateObj}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowPicker(Platform.OS === "ios");
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

          {/* FOTO BUKTI */}
          <View style={cardStyle}>
            <SectionLabel iconName="image" iconColor="#9333ea" iconBg="#faf5ff" label="Foto Bukti (Opsional)" />
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                borderWidth: 2, borderColor: "#e5e7eb", borderStyle: "dashed",
                borderRadius: 16, padding: 24, alignItems: "center", justifyContent: "center",
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