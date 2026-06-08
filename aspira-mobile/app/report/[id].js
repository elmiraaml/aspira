import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert 
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReportDetail() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      // Fetch report detail
      const resReport = await api.get(`/reports/${id}`);
      let reportData = resReport.data;
      if (resReport.data.report) {
        reportData = resReport.data.report;
      } else if (Array.isArray(resReport.data) && resReport.data.length > 0) {
        reportData = resReport.data[0];
      }
      setReport(reportData);

      // Fetch comments
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

      const res = await api.post(`/comments/report/${id}`, 
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        setNewComment("");
        // Reload comments
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
        <Text style={{ fontSize: 16, color: "#6b7280" }}>Laporan tidak ditemukan</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, padding: 12, backgroundColor: "#2563eb", borderRadius: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status) => {
    if (status === "selesai") return { bg: "#dcfce7", text: "#16a34a" };
    if (status === "pending") return { bg: "#fef3c7", text: "#d97706" };
    return { bg: "#f3e8ff", text: "#9333ea" };
  };

  const statusStyle = getStatusColor(report.status);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: "#f8fafd" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingTop: 60, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#f9fafb" }}>
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <View style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Detail</Text>
          <Text style={{ fontSize: 18, color: "#111827", fontWeight: "bold" }}>Pengaduan Masyarakat</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        
        {/* REPORT CARD */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: "#f3f4f6" }}>
         {/* Header Info */}
<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
  <View style={{ flex: 1, paddingRight: 12 }}>
    <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827" }}>{report.title}</Text>
  </View>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    {report.status === "pending" && (
      <TouchableOpacity
        onPress={() => router.push(`/report/edit/${id}`)}
        style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eff6ff", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 }}
      >
        <Feather name="edit-2" size={11} color="#2563eb" />
        <Text style={{ fontSize: 11, fontWeight: "600", color: "#2563eb" }}>Edit</Text>
      </TouchableOpacity>
    )}
    {report?.status && (
      <View style={{ backgroundColor: statusStyle.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
        <Text style={{ fontSize: 12, fontWeight: "bold", color: statusStyle.text }}>{report.status.toUpperCase()}</Text>
      </View>
    )}
  </View>
</View>
          {/* Meta Info */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 8 }}>
              <Feather name="tag" size={14} color="#2563eb" />
              <Text style={{ fontSize: 13, color: "#4b5563", marginLeft: 6 }}>{report.category_name}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 8 }}>
              <Feather name="alert-circle" size={14} color={report.priority === 'high' ? '#ef4444' : report.priority === 'medium' ? '#f59e0b' : '#3b82f6'} />
              <Text style={{ fontSize: 13, color: report.priority === 'high' ? '#ef4444' : report.priority === 'medium' ? '#f59e0b' : '#3b82f6', marginLeft: 6, fontWeight: "500" }}>
                Prioritas {report.priority === 'high' ? 'Tinggi' : report.priority === 'medium' ? 'Sedang' : 'Rendah'}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 8 }}>
              <Feather name="calendar" size={14} color="#d97706" />
              <Text style={{ fontSize: 13, color: "#4b5563", marginLeft: 6 }}>
                {report.incident_date ? report.incident_date.split('T')[0] : "-"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Feather name="map-pin" size={14} color="#16a34a" />
              <Text style={{ fontSize: 13, color: "#4b5563", marginLeft: 6 }}>{report.location}</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginBottom: 16 }} />

          {/* Description */}
          <Text style={{ fontSize: 15, color: "#374151", lineHeight: 24, marginBottom: report.image ? 16 : 0 }}>
            {report.description}
          </Text>

          {/* Image */}
          {report.image && (
            <Image 
              source={{ uri: report.image }} 
              style={{ width: "100%", height: 220, borderRadius: 16, backgroundColor: "#f9fafb" }} 
              resizeMode="cover" 
            />
          )}
        </View>

        {/* COMMENTS SECTION */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 16 }}>
            Komentar ({comments.length})
          </Text>

          {comments.map((c) => (
            <View key={c.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.role === "admin" || c.role === "superadmin" ? "#eff6ff" : "#f3f4f6", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                    <Feather name={c.role === "admin" || c.role === "superadmin" ? "shield" : "user"} size={14} color={c.role === "admin" || c.role === "superadmin" ? "#2563eb" : "#6b7280"} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#111827" }}>{c.full_name}</Text>
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>{c.role === "admin" || c.role === "superadmin" ? "Petugas" : "Warga"}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                  {new Date(c.created_at).toLocaleDateString("id-ID")}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: "#4b5563", lineHeight: 20, paddingLeft: 42 }}>
                {c.comment}
              </Text>
            </View>
          ))}

          {comments.length === 0 && (
            <View style={{ padding: 24, alignItems: "center", backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", borderStyle: "dashed" }}>
              <Feather name="message-square" size={24} color="#d1d5db" style={{ marginBottom: 8 }} />
              <Text style={{ color: "#9ca3af" }}>Belum ada komentar.</Text>
            </View>
          )}
        </View>

        {/* SPACING FOR INPUT */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* COMMENT INPUT */}
      <View style={{ 
        flexDirection: "row", alignItems: "flex-end", padding: 16, paddingBottom: Platform.OS === "ios" ? 32 : 16, 
        backgroundColor: "#ffffff", borderTopWidth: 1, borderTopColor: "#e5e7eb" 
      }}>
        <TextInput
          placeholder="Tulis komentar Anda..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          style={{ 
            flex: 1, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#f3f4f6", 
            borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, 
            fontSize: 14, color: "#111827", maxHeight: 100, minHeight: 44 
          }}
        />
        <TouchableOpacity 
          onPress={handleAddComment}
          disabled={!newComment.trim() || submittingComment}
          style={{ 
            width: 44, height: 44, borderRadius: 22, backgroundColor: newComment.trim() ? "#2563eb" : "#d1d5db", 
            alignItems: "center", justifyContent: "center", marginLeft: 12,
            opacity: submittingComment ? 0.7 : 1
          }}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Feather name="send" size={18} color="#ffffff" style={{ marginLeft: -2, marginTop: 2 }} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
