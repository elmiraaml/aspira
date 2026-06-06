import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

function GoogleIcon() {
  const { Svg, Path } = require("react-native-svg");
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <Path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <Path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </Svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Mohon isi email dan password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.status === 200) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        setSuccess(true);
        setTimeout(() => {
          const role = response.data.user.role;
          if (role === "admin") router.replace("/admin");
          else if (role === "superadmin") router.replace("/superadmin");
          else router.replace("/(tabs)");
        }, 800);
      } else {
        setError(response.data?.message || "Email atau password salah.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
          <Text style={styles.title}>Sign in to your account</Text>
        </View>

        {/* Success Banner */}
        {success && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Login successful! Redirecting...</Text>
          </View>
        )}

        {/* Error Banner */}
        {error !== "" && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Email Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="name@email.com"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={(val) => { setEmail(val); setError(""); }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        {/* Password Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={(val) => { setPassword(val); setError(""); }}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {/* Remember me + Forgot password */}
        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.signInButton, loading && styles.signInButtonDisabled]}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.signInText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Button */}
        <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
          <GoogleIcon />
          <Text style={styles.googleText}>Google</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerHint}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  inner: {
    flex: 1,
  },

  // Header
  header: {
    marginBottom: 28,
  },
  welcomeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#1d4ed8",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 32,
  },

  // Banners
  successBanner: {
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  successText: {
    color: "#065f46",
    fontWeight: "600",
    fontSize: 13,
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 13,
  },

  // Form
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#fff",
  },

  // Row
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  checkmark: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  rememberText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  forgotText: {
    fontSize: 13,
    color: "#1d4ed8",
    fontWeight: "700",
  },

  // Sign In Button
  signInButton: {
    backgroundColor: "#1e3a8a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    // Gradient simulation via a slightly lighter shade at top isn't possible natively,
    // use LinearGradient from expo-linear-gradient if you want true gradient
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#94a3b8",
  },

  // Google Button
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 28,
  },
  googleText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },

  // Register
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerHint: {
    fontSize: 14,
    color: "#334155",
  },
  registerLink: {
    fontSize: 14,
    color: "#1d4ed8",
    fontWeight: "700",
  },
});