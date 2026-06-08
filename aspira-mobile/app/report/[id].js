import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert, Modal
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReportDetail() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const resReport = await api.get(`/reports/${id}`);
      let reportData = resReport.data;
      if (resReport.data.report) {
        reportData = resReport.data.report;
      } else if (Array.isArray(resReport.data) && resReport.data.length > 0) {
        reportData = resReport.data[0];
      }
      setReport(reportData);
      setTimeline(resReport.data.timeline || []);

      const resComments = await api.get(`/comments/report/${id}`);
      if (Array.isArray(resComments.data)) {
        setComments(resComments.data);
      }
    } catch (err) {
      console.log("Error fetching detail:", err);
      Alert.alert("Error", "Gagal memuat detail laporan");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Anda harus login untuk memberi komentar");
        return;
      }

      const res = await api.post(
        `/comments/report/${id}`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        setNewComment("");
        const resComments = await api.get(`/comments/report/${id}`);
        if (Array.isArray(resComments.data)) {
          setComments(resComments.data);
        }
      }
    } catch (err) {
      console.log("Submit comment error:", err);
      Alert.alert("Error", "Gagal mengirim komentar");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      "Hapus Laporan",
      "Yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setLoadingDelete(true);
              const res = await api.delete(`/reports/${id}`);
              if (res.data?.message === "Laporan berhasil dihapus") {
                Alert.alert("Berhasil", "Laporan berhasil dihapus.", [
                  { text: "OK", onPress: () => router.back() },
                ]);
              } else {
                Alert.alert("Error", res.data?.message || "Gagal menghapus laporan.");
              }
            } catch (err) {
              console.log("Delete error:", err);
              Alert.alert("Error", "Terjadi kesalahan saat menghapus laporan.");
            } finally {
              setLoadingDelete(false);
            }
          },
        },
      ]
    );
  };

  const getPriorityStyle = (priority) => {
    const map = {
      urgent:    { bg: "#ffe0e0", color: "#b91c1c", label: "Mendesak" },
      emergency: { bg: "#ffe0e0", color: "#b91c1c", label: "Mendesak" },
      high:      { bg: "#ffe8cc", color: "#c45f00", label: "Tinggi" },
      medium:    { bg: "#fef9c3", color: "#854d0e", label: "Sedang" },
      low:       { bg: "#dcfce7", color: "#166534", label: "Rendah" },
    };
    return map[priority?.toLowerCase()] || map.low;
  };

  const getStatusStyle = (status) => {
    const map = {
      pending:       { bg: "#fffbeb", color: "#d97706", label: "Pending",           icon: "clock" },
      diperiksa:     { bg: "#eff6ff", color: "#2563eb", label: "Diperiksa",         icon: "activity" },
      diproses:      { bg: "#eff6ff", color: "#2563eb", label: "Diproses",          icon: "activity" },
      diverifikasi:  { bg: "#f5f3ff", color: "#7c3aed", label: "Diverifikasi",      icon: "activity" },
      tindak_lanjut: { bg: "#f0f9ff", color: "#0284c7", label: "Tindak Lanjut",     icon: "activity" },
      selesai:       { bg: "#f0fdf4", color: "#16a34a", label: "Selesai",           icon: "check-circle" },
      rejected:      { bg: "#fef2f2", color: "#dc2626", label: "Ditolak",           icon: "alert-triangle" },
      ditolak:       { bg: "#fef2f2", color: "#dc2626", label: "Ditolak",           icon: "alert-triangle" },
    };
    return map[status] || { bg: "#f9fafb", color: "#6b7280", label: status, icon: "file-text" };
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const commentClosed = report && ["selesai", "rejected", "ditolak"].includes(report.status);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafd" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafd" }}>
        <Feather name="alert-triangle" size={48} color="#ef4444" />
        <Text style={{ fontSize: 16, color: "#111827", fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>
          Laporan tidak ditemukan
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 12, backgroundColor: "#2563eb", borderRadius: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = getStatusStyle(report.status);
  const priority = getPriorityStyle(report.priority);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8fafd" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={{
        flexDirection: "row", alignItems: "center", padding: 20, paddingTop: 60,
        backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb"
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#f9fafb" }}
        >
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <View style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Detail</Text>
          <Text style={{ fontSize: 18, color: "#111827", fontWeight: "bold" }}>Pengaduan Masyarakat</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>

        {/* DETAIL CARD */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>

          {/* Title + badges */}
          <View style={{ marginBottom: 16 }}>
            {/* Title row with three-dot */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827", flex: 1, paddingRight: 8 }}>
                {report.title}
              </Text>

              {/* Three-dot menu button */}
              <View>
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  disabled={loadingDelete}
                  style={{
                    width: 32, height: 32, alignItems: "center", justifyContent: "center",
                    borderRadius: 16, backgroundColor: "#f9fafb",
                    borderWidth: 1, borderColor: "#e5e7eb",
                    opacity: loadingDelete ? 0.5 : 1,
                  }}
                >
                  {loadingDelete
                    ? <ActivityIndicator size="small" color="#6b7280" />
                    : <Feather name="more-vertical" size={16} color="#6b7280" />
                  }
                </TouchableOpacity>

                {/* Dropdown menu */}
                <Modal
                  visible={menuVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setMenuVisible(false)}
                >
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => setMenuVisible(false)}
                  >
                    <View style={{
                      position: "absolute", top: 160, right: 24,
                      backgroundColor: "#ffffff", borderRadius: 16,
                      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
                      borderWidth: 1, borderColor: "#f3f4f6", minWidth: 180,
                      overflow: "hidden",
                    }}>
                      <TouchableOpacity
                        onPress={() => { setMenuVisible(false); router.push(`/report/edit/${id}`); }}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 10,
                          paddingHorizontal: 16, paddingVertical: 14,
                          borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
                        }}
                      >
                        <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
                          <Feather name="edit-2" size={14} color="#2563eb" />
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#2563eb" }}>Edit Laporan</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleDelete}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 10,
                          paddingHorizontal: 16, paddingVertical: 14,
                        }}
                      >
                        <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center" }}>
                          <Feather name="trash-2" size={14} color="#dc2626" />
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#dc2626" }}>Hapus Laporan</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                </Modal>
              </View>
            </View>

            {/* Badges row below title */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <View style={{ backgroundColor: priority.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: priority.color }}>{priority.label}</Text>
              </View>
              <View style={{ backgroundColor: status.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Feather name={status.icon} size={11} color={status.color} />
                <Text style={{ fontSize: 11, fontWeight: "700", color: status.color }}>{status.label}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={{ backgroundColor: "#eff6ff", borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: "row", gap: 10 }}>
            <Feather name="file-text" size={16} color="#2563eb" style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 14, color: "#374151", lineHeight: 22, flex: 1 }}>
              {report.description}
            </Text>
          </View>

          {/* Meta items */}
          <MetaItem icon="tag"      label="Kategori"         value={report.category_name || "-"} />
          <MetaItem icon="map-pin"  label="Lokasi Kejadian"  value={report.location || "-"} />
          <MetaItem icon="calendar" label="Tanggal Kejadian" value={formatDate(report.incident_date)} />
          <MetaItem icon="clock"    label="Dibuat Pada"      value={formatDateTime(report.created_at)} />

          {/* Image */}
          {(report.image || report.bukti_foto) ? (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f3f4f6" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Feather name="image" size={16} color="#2563eb" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>Bukti Foto</Text>
              </View>
              <Image
                source={{ uri: report.image || report.bukti_foto }}
                style={{ width: "100%", height: 220, borderRadius: 16, backgroundColor: "#f9fafb" }}
                resizeMode="cover"
              />
            </View>
          ) : null}
        </View>

        {/* TIMELINE CARD */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Feather name="activity" size={18} color="#2563eb" />
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827" }}>Timeline Status</Text>
          </View>

          {timeline.length > 0 ? (
            timeline.map((log, index) => {
              const isLast = index === timeline.length - 1;
              const logStatus = getStatusStyle(log.new_status);
              return (
                <View
                  key={log.id}
                  style={{
                    flexDirection: "row", gap: 12, paddingVertical: 14,
                    borderBottomWidth: isLast ? 0 : 1, borderBottomColor: "#f3f4f6"
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
                    <Feather name="clock" size={15} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                      {log.old_status ? (
                        <>
                          <View style={{ backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                            <Text style={{ fontSize: 11, color: "#6b7280", fontWeight: "600" }}>{log.old_status}</Text>
                          </View>
                          <Feather name="arrow-right" size={12} color="#9ca3af" />
                          <View style={{ backgroundColor: logStatus.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                            <Text style={{ fontSize: 11, color: logStatus.color, fontWeight: "700" }}>{log.new_status}</Text>
                          </View>
                        </>
                      ) : (
                        <View style={{ backgroundColor: logStatus.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                          <Text style={{ fontSize: 11, color: logStatus.color, fontWeight: "700" }}>{log.new_status}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      Oleh: <Text style={{ fontWeight: "600", color: "#374151" }}>{log.changed_by_name || "System"}</Text>
                    </Text>

                    {log.notes ? (
                      <View style={{ backgroundColor: "#f9fafb", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginTop: 6 }}>
                        <Text style={{ fontSize: 13, color: "#374151", fontStyle: "italic" }}>"{log.notes}"</Text>
                      </View>
                    ) : null}

                    <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "500", marginTop: 6 }}>
                      {formatDateTime(log.created_at)}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 32, gap: 10 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center" }}>
                <Feather name="clock" size={22} color="#d1d5db" />
              </View>
              <Text style={{ fontSize: 13, color: "#9ca3af" }}>Belum ada riwayat perubahan status.</Text>
            </View>
          )}
        </View>

        {/* COMMENTS CARD */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Feather name="message-square" size={18} color="#2563eb" />
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827" }}>Komentar & Diskusi</Text>
          </View>

          {comments.length > 0 ? (
            <View style={{ gap: 10, marginBottom: 16 }}>
              {comments.map((c) => {
                const isAdmin = c.role === "admin" || c.role === "superadmin";
                return (
                  <View
                    key={c.id}
                    style={{
                      backgroundColor: isAdmin ? "#eff6ff" : "#f9fafb",
                      borderRadius: 16,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: "transparent",
                      borderLeftWidth: isAdmin ? 4 : 1,
                      borderLeftColor: isAdmin ? "#2563eb" : "#f3f4f6",
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Feather
                          name={isAdmin ? "shield" : "user"}
                          size={14}
                          color={isAdmin ? "#2563eb" : "#6b7280"}
                        />
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{c.full_name}</Text>
                        {isAdmin && (
                          <View style={{ backgroundColor: "#2563eb", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>Admin</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "500" }}>
                        {formatDateTime(c.created_at)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, color: "#374151", lineHeight: 20, paddingLeft: 22 }}>
                      {c.comment}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{
              alignItems: "center", paddingVertical: 32, backgroundColor: "#f9fafb",
              borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", marginBottom: 16, gap: 8
            }}>
              <Feather name="message-square" size={24} color="#d1d5db" />
              <Text style={{ fontSize: 13, color: "#9ca3af" }}>Belum ada komentar.</Text>
            </View>
          )}

          {commentClosed ? (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 8,
              backgroundColor: "#f9fafb", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
              borderWidth: 1, borderColor: "#f3f4f6"
            }}>
              <Feather name="lock" size={14} color="#9ca3af" />
              <Text style={{ fontSize: 13, color: "#9ca3af", flex: 1 }}>
                Komentar ditutup karena laporan telah selesai / ditolak.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <TextInput
                placeholder="Tulis komentar atau pertanyaan..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                style={{
                  backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb",
                  borderRadius: 16, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12,
                  fontSize: 14, color: "#111827", maxHeight: 100, minHeight: 44
                }}
              />
              <Pressable
                onPress={handleAddComment}
                disabled={submittingComment}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
                  paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20,
                  alignSelf: "flex-start",
                  backgroundColor: newComment.length > 0 ? "#2563eb" : "#d1d5db",
                  opacity: submittingComment ? 0.7 : 1,
                }}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Feather name="send" size={14} color="#ffffff" />
                )}
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#ffffff" }}>
                  {submittingComment ? "Mengirim..." : "Kirim Komentar"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
        <Feather name={icon} size={15} color="#2563eb" />
      </View>
      <View>
        <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}