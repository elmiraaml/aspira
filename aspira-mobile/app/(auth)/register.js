import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { api } from "../../services/api";

export default function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullname || !email || !password) {
      Alert.alert("Error", "Mohon lengkapi semua data");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        fullname,
        email,
        password,
      });

      if (response.status === 201) {
        Alert.alert("Sukses", "Register berhasil, silakan login");
        router.back();
      }
    } catch (error) {
      console.log("Register Error:", error);
      Alert.alert("Error", error.response?.data?.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9fafb" }}>
      <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 8, color: "#111827" }}>
        Register
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 32, color: "#6b7280" }}>
        Buat akun baru Anda
      </Text>

      <TextInput
        placeholder="Nama Lengkap"
        value={fullname}
        onChangeText={setFullname}
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
          backgroundColor: "#ffffff",
        }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
          backgroundColor: "#ffffff",
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          padding: 14,
          borderRadius: 12,
          marginBottom: 24,
          backgroundColor: "#ffffff",
        }}
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        style={{
          backgroundColor: "#2563eb",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            Register
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: "center", color: "#4b5563", fontSize: 15 }}>
          Sudah punya akun? <Text style={{ color: "#2563eb", fontWeight: "bold" }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
