import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, 
  ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform 
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { api } from "../../services/api";

export default function Profile() {
  const [form, setForm] = useState({
    fullname: "Loading...",
    email: "loading...",
  });
  
  const [tempForm, setTempForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [emailNotif, setEmailNotif] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setForm({
          fullname: parsed.fullname || "",
          email: parsed.email || "",
        });
        setTempForm({
          fullname: parsed.fullname || "",
          email: parsed.email || "",
          password: "",
          confirmPassword: "",
        });
      } else {
        Alert.alert("Sesi Berakhir", "Harap login kembali", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") }
        ]);
      }
    } catch (err) {
      console.log("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setTempForm({
      fullname: form.fullname,
      email: form.email,
      password: "",
      confirmPassword: "",
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (tempForm.password && tempForm.password !== tempForm.confirmPassword) {
      Alert.alert("Error", "Password tidak cocok");
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      
      const payload = { 
        fullname: tempForm.fullname, 
        email: tempForm.email 
      };
      if (tempForm.password) {
        payload.password = tempForm.password;
      }

      const res = await api.put("/auth/profile", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        const updated = res.data.user;
        const newForm = { fullname: updated.fullname, email: updated.email };
        
        setForm(newForm);
        
        // Update in AsyncStorage
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const parsed = JSON.parse(userStr);
          await AsyncStorage.setItem("user", JSON.stringify({ ...parsed, ...newForm }));
        }

        setEditing(false);
        Alert.alert("Sukses", "Profil berhasil diperbarui");
      }
    } catch (err) {
      console.log("Save error:", err);
      Alert.alert("Error", err.response?.data?.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Konfirmasi", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Keluar", 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          router.replace("/(auth)/login");
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafd" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: "#f8fafd" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* HEADER */}
        <View style={{ padding: 24, paddingTop: 60, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 24, color: "#111827", fontWeight: "bold", marginTop: 2 }}>Profile</Text>
          </View>
          
          <View style={{ flexDirection: "row" }}>
            {editing ? (
              <>
                <TouchableOpacity onPress={handleCancel} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", marginRight: 8 }}>
                  <Text style={{ fontSize: 12, color: "#4b5563", fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={saving} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "#2563eb" }}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={{ fontSize: 12, color: "#ffffff", fontWeight: "bold" }}>Save</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={handleEdit} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center" }}>
                <Feather name="edit-2" size={14} color="#4b5563" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, color: "#4b5563", fontWeight: "600" }}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ padding: 20 }}>
          
          {/* PROFILE CARD */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden", marginBottom: 20 }}>
           <View
  style={{
    height: 100,
    backgroundColor: "#ffffff",
  }}
/>
            <View style={{ alignItems: "center", marginTop: -32, paddingBottom: 24 }}>
              <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "#111827", alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#ffffff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#ffffff" }}>
                  {form.fullname?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937", marginTop: 8 }}>{form.fullname}</Text>
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>{form.email}</Text>
            </View>
          </View>

          {/* PERSONAL INFO FORM */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden", marginBottom: 20 }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#f9fafb" }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Personal Information</Text>
            </View>
            <View style={{ padding: 16 }}>
              {/* Full Name */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Full Name</Text>
                <TextInput
                  value={editing ? tempForm.fullname : form.fullname}
                  onChangeText={(text) => setTempForm({ ...tempForm, fullname: text })}
                  editable={editing}
                  style={{ backgroundColor: editing ? "#ffffff" : "#f9fafb", borderWidth: 1, borderColor: editing ? "#93c5fd" : "#f3f4f6", borderRadius: 12, padding: 14, fontSize: 14, color: "#374151" }}
                />
              </View>

              {/* Email */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Email</Text>
                <TextInput
                  value={editing ? tempForm.email : form.email}
                  onChangeText={(text) => setTempForm({ ...tempForm, email: text })}
                  editable={editing}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{ backgroundColor: editing ? "#ffffff" : "#f9fafb", borderWidth: 1, borderColor: editing ? "#93c5fd" : "#f3f4f6", borderRadius: 12, padding: 14, fontSize: 14, color: "#374151" }}
                />
              </View>

              {/* Password */}
              {editing && (
                <>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>New Password</Text>
                    <TextInput
                      value={tempForm.password}
                      onChangeText={(text) => setTempForm({ ...tempForm, password: text })}
                      placeholder="Kosongkan jika tidak ingin mengubah"
                      secureTextEntry
                      style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#93c5fd", borderRadius: 12, padding: 14, fontSize: 14, color: "#374151" }}
                    />
                  </View>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Confirm Password</Text>
                    <TextInput
                      value={tempForm.confirmPassword}
                      onChangeText={(text) => setTempForm({ ...tempForm, confirmPassword: text })}
                      placeholder="Ulangi password baru"
                      secureTextEntry
                      style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#93c5fd", borderRadius: 12, padding: 14, fontSize: 14, color: "#374151" }}
                    />
                  </View>
                </>
              )}
            </View>
          </View>



          {/* LOGOUT BUTTON */}
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fef2f2", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#fecaca" }}
          >
            <Feather name="log-out" size={18} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#ef4444" }}>Keluar (Logout)</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
