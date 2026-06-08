import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert, KeyboardAvoidingView
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { api } from "../../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [formData, setFormData] = useState({
    title: "", description: "", category_id: "", location: "", incident_date: "",
  });
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    loadData();
  }, [id]);

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

      setFormData({
        title: r.title || "",
        description: r.description || "",
        category_id: String(r.category_id || ""),
        location: r.location || "",
        incident_date: r.incident_date ? r.incident_date.split("T")[0] : "",
      });

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

  const validate = () => {
    const { title, description, category_id, location, incident_date } = formData;
    if (!title.trim()) { setAlert({ type: "error", message: "Judul wajib diisi." }); return false; }
    if (!description.trim()) { setAlert({ type: "error", message: "Deskripsi wajib diisi." }); return false; }
    if (!category_id) { setAlert({ type: "error", message: "Kategori wajib dipilih." }); return false; }
    if (!location.trim()) { setAlert({ type: "error", message: "Lokasi wajib diisi." }); return false; }
    if (!incident_date) { setAlert({ type: "error", message: "Tanggal wajib diisi." }); return false; }
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

setTimeout(() => {
  router.replace(`/report/${id}`);
}, 1500);
    } catch (err) {
      console.log("Update error:", err.response?.data || err.message);
      setAlert({ type: "error", message: err.response?.data?.message || "Gagal memperbarui laporan" });
    } finally {
      setSubmitting(false);
    }
  };

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

      <ScrollView style={{ flex: 1, backgroundColor: "#f8fafd" }}>
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
              placeholder="Masukkan judul laporan..."
              placeholderTextColor="#9ca3af"
              value={formData.title}
              onChangeText={(t) => updateField("title", t)}
              style={inputStyle}
            />
          </View>

          {/* DESKRIPSI */}
          <View style={cardStyle}>
            <SectionLabel iconName="align-left" iconColor="#d97706" iconBg="#fef3c7" label="Deskripsi *" />
            <TextInput
              placeholder="Jelaskan kejadian..."
              placeholderTextColor="#9ca3af"
              multiline numberOfLines={4} textAlignVertical="top"
              value={formData.description}
              onChangeText={(t) => updateField("description", t)}
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

          {/* LOKASI */}
          <View style={cardStyle}>
            <SectionLabel iconName="map-pin" iconColor="#16a34a" iconBg="#dcfce7" label="Lokasi Kejadian *" />
            <TextInput
              placeholder="Contoh: Jakarta Timur"
              placeholderTextColor="#9ca3af"
              value={formData.location}
              onChangeText={(t) => updateField("location", t)}
              style={inputStyle}
            />
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
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
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