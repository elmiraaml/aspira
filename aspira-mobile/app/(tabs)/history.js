import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Feather } from "@expo/vector-icons";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      
      const res = await api.get("/reports/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, []);

  const getStatusColor = (status) => {
    if (status === "selesai") return { bg: "#dcfce7", text: "#16a34a", icon: "check-circle" };
    if (status === "pending") return { bg: "#fef3c7", text: "#d97706", icon: "clock" };
    return { bg: "#f3e8ff", text: "#9333ea", icon: "loader" };
  };

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
            const statusConfig = getStatusColor(item.status);
            const pColor = item.priority === 'high' ? '#ef4444' : item.priority === 'medium' ? '#f59e0b' : '#3b82f6';
            const pText = item.priority === 'high' ? 'Tinggi' : item.priority === 'medium' ? 'Sedang' : 'Rendah';
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
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: pColor, marginRight: 4 }} />
                    <Text style={{ fontSize: 11, color: pColor, fontWeight: "500", marginRight: 8 }}>
                      Prioritas {pText}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                    {item.category_name} • {item.incident_date ? item.incident_date.split('T')[0] : "-"}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ 
                    flexDirection: "row", alignItems: "center",
                    backgroundColor: statusConfig.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 
                  }}>
                    <Feather name={statusConfig.icon} size={12} color={statusConfig.text} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: statusConfig.text }}>
                      {item.status.toUpperCase()}
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
