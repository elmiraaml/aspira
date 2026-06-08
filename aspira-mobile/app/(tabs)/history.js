import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Feather } from "@expo/vector-icons";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

const STATUS_CONFIG = {
  pending:       { bg: "#fff7d6", color: "#b07d00", label: "Menunggu",      icon: "clock"        },
  diperiksa:     { bg: "#e8f5ff", color: "#004b8d", label: "Diperiksa",     icon: "loader"       },
  diproses:      { bg: "#e8f5ff", color: "#004b8d", label: "Diproses",      icon: "loader"       },
  diverifikasi:  { bg: "#ede9fe", color: "#6d28d9", label: "Diverifikasi",  icon: "loader"       },
  tindak_lanjut: { bg: "#e0f2fe", color: "#0369a1", label: "Tindak Lanjut", icon: "loader"       },
  selesai:       { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai",       icon: "check-circle" },
  ditolak:       { bg: "#fde8e8", color: "#c0392b", label: "Ditolak",       icon: "x-circle"     },
  rejected:      { bg: "#fde8e8", color: "#c0392b", label: "Ditolak",       icon: "x-circle"     },
};

const PRIORITY_CONFIG = {
  urgent: { color: "#ef4444", label: "Mendesak" },
  high:   { color: "#ef4444", label: "Tinggi"   },
  medium: { color: "#f59e0b", label: "Sedang"   },
  low:    { color: "#3b82f6", label: "Rendah"   },
};

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/reports/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) setReports(res.data);
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafd" }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ padding: 24, paddingTop: 60, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
        <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Riwayat</Text>
        <Text style={{ fontSize: 24, color: "#111827", fontWeight: "bold", marginTop: 4 }}>Laporan Saya</Text>
      </View>

      <View style={{ padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : reports.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <View style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Feather name="file-text" size={28} color="#93c5fd" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#374151", marginBottom: 4 }}>Belum ada laporan</Text>
            <Text style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", paddingHorizontal: 32 }}>Anda belum pernah membuat laporan pengaduan.</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/create")}
              style={{ marginTop: 20, backgroundColor: "#2563eb", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "bold" }}>Buat Laporan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reports.map((item) => {
            const status   = STATUS_CONFIG[item.status]                    || STATUS_CONFIG.pending;
            const priority = PRIORITY_CONFIG[item.priority?.toLowerCase()] || PRIORITY_CONFIG.low;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/report/${item.id}`)}
                style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 4 }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: priority.color, marginRight: 4 }} />
                    <Text style={{ fontSize: 11, color: priority.color, fontWeight: "500" }}>
                      Prioritas {priority.label}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                    {item.category_name} • {item.incident_date
                      ? new Date(item.incident_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                      : "-"}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: status.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                    <Feather name={status.icon} size={12} color={status.color} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: status.color }}>
                      {status.label}
                    </Text>
                  </View>
                  <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginLeft: 12 }}>
                    <Feather name="chevron-right" size={16} color="#3b82f6" />
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