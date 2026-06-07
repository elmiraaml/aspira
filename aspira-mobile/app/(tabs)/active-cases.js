// app/(tabs)/active-cases.js
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  FileQuestion,
  ChevronRight,
  AlertCircle,
  MapPin,
  CalendarDays,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/api";

const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
      return { label: "Menunggu", color: "#f59e0b", bg: "#fffbeb", icon: Clock3 };
    case "diperiksa":
      return { label: "Diperiksa", color: "#2563eb", bg: "#eff6ff", icon: LoaderCircle };
    case "diverifikasi":
      return { label: "Diverifikasi", color: "#4f46e5", bg: "#eef2ff", icon: LoaderCircle };
    case "diproses":
      return { label: "Diproses", color: "#9333ea", bg: "#faf5ff", icon: LoaderCircle };
    case "tindak_lanjut":
      return { label: "Tindak Lanjut", color: "#db2777", bg: "#fdf2f8", icon: LoaderCircle };
    case "selesai":
      return { label: "Selesai", color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 };
    case "rejected":
    case "ditolak":
      return { label: "Ditolak", color: "#ef4444", bg: "#fef2f2", icon: XCircle };
    default:
      return { label: status, color: "#6b7280", bg: "#f9fafb", icon: null };
  }
};

const getAccentColor = (status) => {
  if (status === "pending") return "#fbbf24";
  if (status === "selesai") return "#4ade80";
  if (status === "ditolak" || status === "rejected") return "#f87171";
  return "#60a5fa";
};

const getPriorityConfig = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return { label: "Prioritas Tinggi", color: "#ef4444" };
    case "medium":
      return { label: "Prioritas Sedang", color: "#f59e0b" };
    case "low":
    default:
      return { label: "Prioritas Rendah", color: "#3b82f6" };
  }
};

export default function ActiveCasesScreen() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

    const fetchReports = async () => {
  try {
    setError("");
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const res = await api.get("/reports", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (Array.isArray(res.data)) {
      const active = res.data.filter(
        (r) => r.status !== "selesai" && r.status !== "rejected" && r.status !== "ditolak"
      );
      setReports(active);
    }
  } catch (err) {
    setError("Gagal mengambil data laporan");
    console.log("Fetch Error:", err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const status = getStatusConfig(item.status);
    const StatusIcon = status.icon;
    const accent = getAccentColor(item.status);
    const isChevronActive = item.status !== "pending";
    const priorityConfig = getPriorityConfig(item.priority);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/report/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={[styles.accentBar, { backgroundColor: accent }]} />

        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <View style={styles.categoryRow}>
              <FileQuestion size={12} color="#9ca3af" />
              <Text style={styles.categoryText}>{item.category_name ?? "Umum"}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              {StatusIcon && <StatusIcon size={11} color={status.color} />}
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

          <View style={styles.metaContainer}>
            {item.location && (
              <View style={styles.metaRow}>
                <MapPin size={11} color="#9ca3af" />
                <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <CalendarDays size={11} color="#9ca3af" />
              <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.priorityRow}>
              <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
              <Text style={[styles.priorityText, { color: priorityConfig.color }]}>{priorityConfig.label}</Text>
            </View>
            <View style={[styles.chevronBox, isChevronActive ? styles.chevronActive : styles.chevronInactive]}>
              <ChevronRight size={14} color={isChevronActive ? "#ffffff" : "#9ca3af"} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Monitoring Pengaduan</Text>
        <Text style={styles.headerTitle}>Laporan Aktif</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!error && reports.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.emptyIconBox}>
            <FileQuestion size={26} color="#93c5fd" />
          </View>
          <Text style={styles.emptyTitle}>Belum ada laporan aktif</Text>
          <Text style={styles.emptySubtitle}>
            Semua laporan sudah selesai atau belum ada yang dibuat.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/(tabs)/create")}
          >
            <Text style={styles.createButtonText}>+ Buat Laporan</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafd" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafd" },
  loadingText: { fontSize: 13, color: "#9ca3af", marginTop: 8 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerSub: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#9ca3af", fontWeight: "500", marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  errorText: { fontSize: 13, color: "#ef4444", fontWeight: "500", flex: 1 },
  emptyContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyIconBox: { width: 60, height: 60, borderRadius: 18, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 6, textAlign: "center" },
  emptySubtitle: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  createButton: { backgroundColor: "#2563eb", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, elevation: 5 },
  createButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 },
  card: { backgroundColor: "#ffffff", borderRadius: 18, borderWidth: 1, borderColor: "#f1f5f9", overflow: "hidden", elevation: 2 },
  accentBar: { height: 4, width: "100%" },
  cardBody: { padding: 14 },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  categoryText: { fontSize: 11, color: "#9ca3af" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#1f2937", marginBottom: 10, lineHeight: 20 },
  metaContainer: { gap: 4, marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 11, color: "#9ca3af", flex: 1 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priorityRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  priorityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fbbf24" },
  priorityText: { fontSize: 11, color: "#f59e0b", fontWeight: "500" },
  chevronBox: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chevronActive: { backgroundColor: "#2563eb" },
  chevronInactive: { backgroundColor: "#f3f4f6" },
});