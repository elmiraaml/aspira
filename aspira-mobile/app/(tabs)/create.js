import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  Image, Alert, ActivityIndicator, Platform 
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Create() {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    location: "",
    incident_date: new Date(),
    image: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/reports/categories");
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.log("Error fetch categories:", err);
    } finally {
      setLoadingCats(false);
    }
  };

  const handlePickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Maaf, kami membutuhkan izin akses galeri untuk mengunggah foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0] });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, incident_date: selectedDate });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category_id || !formData.location) {
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

      // 1. Upload image if exists
      if (formData.image) {
        const localUri = formData.image.uri;
        const filename = localUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const uploadData = new FormData();
        uploadData.append('image', {
          uri: localUri,
          name: filename,
          type,
        });

        const uploadRes = await api.post("/reports/upload", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        });

        imageUrl = uploadRes.data.image_url;
      }

      // 2. Submit Report
      const formattedDate = formData.incident_date.toISOString().split('T')[0];

      const res = await api.post("/reports", {
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        incident_date: formattedDate,
        image: imageUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 201) {
        Alert.alert("Sukses", "Laporan berhasil dikirim", [
          { text: "OK", onPress: () => router.push("/(tabs)") }
        ]);
      }
    } catch (err) {
      console.log("Submit error:", err);
      Alert.alert("Error", err.response?.data?.message || "Gagal mengirim laporan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafd" }}>
      {/* HEADER */}
      <View style={{ padding: 24, paddingTop: 60, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
        <Text style={{ fontSize: 14, color: "#6b7280", fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>Formulir Baru</Text>
        <Text style={{ fontSize: 24, color: "#111827", fontWeight: "bold", marginTop: 4 }}>Buat Pengaduan</Text>
      </View>

      <View style={{ padding: 20 }}>
        
        {/* JUDUL LAPORAN */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#faf5ff", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              <Feather name="file-text" size={16} color="#9333ea" />
            </View>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Judul Laporan</Text>
          </View>
          <TextInput
            placeholder="Masukkan judul laporan..."
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            style={{ backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 12, padding: 14, fontSize: 15, color: "#374151" }}
          />
        </View>

        {/* DESKRIPSI */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              <Feather name="align-left" size={16} color="#d97706" />
            </View>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Deskripsi</Text>
          </View>
          <TextInput
            placeholder="Jelaskan kejadian secara lengkap dan jelas..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            style={{ backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 12, padding: 14, fontSize: 15, color: "#374151", minHeight: 100 }}
          />
        </View>

        {/* KATEGORI */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              <Feather name="tag" size={16} color="#2563eb" />
            </View>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Kategori</Text>
          </View>
          <View style={{ backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 12, overflow: "hidden" }}>
            <Picker
              selectedValue={formData.category_id}
              onValueChange={(itemValue) => setFormData({ ...formData, category_id: itemValue })}
              style={{ color: formData.category_id ? "#374151" : "#9ca3af", marginHorizontal: -8 }}
            >
              <Picker.Item label="Pilih kategori..." value="" color="#9ca3af" />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.category_name} value={cat.id} color="#374151" />
              ))}
            </Picker>
          </View>
        </View>

        {/* LOKASI KEJADIAN */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              <Feather name="map-pin" size={16} color="#16a34a" />
            </View>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Lokasi Kejadian</Text>
          </View>
          <TextInput
            placeholder="Contoh: Jakarta Timur"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            style={{ backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 12, padding: 14, fontSize: 15, color: "#374151" }}
          />
        </View>

        {/* TANGGAL KEJADIAN */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              <Feather name="calendar" size={16} color="#2563eb" />
            </View>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Tanggal Kejadian</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            style={{ backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 12, padding: 14 }}
          >
            <Text style={{ fontSize: 15, color: "#374151" }}>
              {formData.incident_date.toISOString().split('T')[0]}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.incident_date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* FOTO BUKTI */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#faf5ff", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              <Feather name="image" size={16} color="#9333ea" />
            </View>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Foto Bukti</Text>
          </View>
          <TouchableOpacity 
            onPress={handlePickImage}
            style={{ 
              borderWidth: 2, borderColor: "#f3f4f6", borderStyle: "dashed", 
              borderRadius: 16, padding: 24, alignItems: "center", justifyContent: "center",
              backgroundColor: formData.image ? "#ffffff" : "#f9fafb"
            }}
          >
            {formData.image ? (
              <Image source={{ uri: formData.image.uri }} style={{ width: "100%", height: 200, borderRadius: 12 }} resizeMode="cover" />
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

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: "#2563eb",
            padding: 18,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginBottom: 40,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Feather name="send" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16 }}>Kirim Laporan</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
