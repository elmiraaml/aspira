import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Feather } from "@expo/vector-icons";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

const STATUS_CONFIG = {
  pending:       { bg: "#fff7d6", color: "#b07d00", label: "Menunggu"      },
  diperiksa:     { bg: "#e8f5ff", color: "#004b8d", label: "Diperiksa"     },
  diproses:      { bg: "#e8f5ff", color: "#004b8d", label: "Diproses"      },
  diverifikasi:  { bg: "#ede9fe", color: "#6d28d9", label: "Diverifikasi"  },
  tindak_lanjut: { bg: "#e0f2fe", color: "#0369a1", label: "Tindak Lanjut" },
  selesai:       { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai"       },
  ditolak:       { bg: "#fde8e8", color: "#c0392b", label: "Ditolak"       },
  rejected:      { bg: "#fde8e8", color: "#c0392b", label: "Ditolak"       },
};

const PRIORITY_CONFIG = {
  urgent: { color: "#ef4444", label: "Mendesak" },
  high:   { color: "#ef4444", label: "Tinggi"   },
  medium: { color: "#f59e0b", label: "Sedang"   },
  low:    { color: "#3b82f6", label: "Rendah"   },
};

export default function Home() {
  const [pengaduan, setPengaduan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("Pengguna");

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const userRaw = await AsyncStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        setUserName(user.fullname || user.name || "Pengguna");
      }

      const res = await api.get("/reports/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) setPengaduan(res.data);
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchReports(); }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, []);

  const total    = pengaduan.length;
  const selesai  = pengaduan.filter((t) => t.status === "selesai").length;
  const pending  = pengaduan.filter((t) => t.status === "pending").length;
  const diproses = pengaduan.filter((t) =>
    ["diproses", "diperiksa", "diverifikasi", "tindak_lanjut", "process"].includes(t.status)
  ).length;

  const recentPengaduan = [...pengaduan].reverse().slice(0, 5);

  const stats = [
    { label: "Total",    value: total,    color: "#2563eb", bg: "#eff6ff", icon: "file-text"   },
    { label: "Menunggu", value: pending,  color: "#f59e0b", bg: "#fef3c7", icon: "clock"        },
    { label: "Diproses", value: diproses, color: "#9333ea", bg: "#faf5ff", icon: "loader"       },
    { label: "Selesai",  value: selesai,  color: "#16a34a", bg: "#f0fdf4", icon: "check-circle" },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafd" }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* HEADER */}
      <View style={{ padding: 24, paddingTop: 60, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
        <Text style={{ fontSize: 14, color: "#6b7280", fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>Dashboard</Text>
        <Text style={{ fontSize: 24, color: "#111827", fontWeight: "bold", marginTop: 4 }}>
          Halo, {userName} 👋
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {/* STATS */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 }}>
          {stats.map((item, index) => (
            <View key={index} style={{ width: "48%", backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.bg, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Feather name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937" }}>{item.value}</Text>
              <Text style={{ fontSize: 13, color: item.color, marginTop: 4, fontWeight: "500" }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* HEADER RECENT */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, fontWeight: "500", marginBottom: 2 }}>Aktivitas Terbaru</Text>
            <Text style={{ fontSize: 18, color: "#1f2937", fontWeight: "bold" }}>Daftar Pengaduan</Text>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: "#2563eb", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}
            onPress={() => router.push("/(tabs)/create")}
          >
            <Feather name="plus" size={16} color="#ffffff" />
            <Text style={{ color: "#ffffff", fontWeight: "bold", marginLeft: 6 }}>Buat</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : recentPengaduan.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <View style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Feather name="inbox" size={28} color="#93c5fd" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#374151", marginBottom: 4 }}>Belum ada pengaduan</Text>
            <Text style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", paddingHorizontal: 32 }}>Klik tombol "Buat" untuk mengirim laporan masyarakat.</Text>
          </View>
        ) : (
          recentPengaduan.map((item) => {
            const status   = STATUS_CONFIG[item.status]                    || STATUS_CONFIG.pending;
            const priority = PRIORITY_CONFIG[item.priority?.toLowerCase()] || PRIORITY_CONFIG.low;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/report/${item.id}`)}
                style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827", flex: 1 }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={{ backgroundColor: status.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                    <Text style={{ fontSize: 12, fontWeight: "bold", color: status.color }}>
                      {status.label}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }} numberOfLines={2}>{item.description}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 12 }}>
                    <Feather name="map-pin" size={14} color="#9ca3af" />
                    <Text style={{ fontSize: 13, color: "#9ca3af", marginLeft: 4 }} numberOfLines={1}>
                      {item.location || "Lokasi tidak tersedia"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: priority.color, marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: priority.color, fontWeight: "500" }}>
                      {priority.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}