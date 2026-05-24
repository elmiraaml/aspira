import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Mohon isi email dan password");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
        Alert.alert("Sukses", "Login berhasil");
        router.replace("/(tabs)"); 
      }
    } catch (error) {
      console.log("Login Error:", error);
      Alert.alert("Error", error.response?.data?.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9fafb" }}>
      <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 8, color: "#111827" }}>
        Login
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 32, color: "#6b7280" }}>
        Silakan masuk ke akun Anda
      </Text>

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
        onPress={handleLogin}
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
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: "center", color: "#4b5563", fontSize: 15 }}>
          Belum punya akun? <Text style={{ color: "#2563eb", fontWeight: "bold" }}>Daftar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
