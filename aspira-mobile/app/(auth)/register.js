import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

function getStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 10) return 2;
  return 3;
}

const strengthColor = { 1: "#ef4444", 2: "#eab308", 3: "#22c55e" };

export default function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = getStrength(password);

  const handleRegister = async () => {
    if (!fullname || !email || !password || !confirm) {
      setError("Mohon lengkapi semua data.");
      return;
    }
    if (!agree) {
      setError("Harap setujui syarat layanan.");
      return;
    }
    if (password !== confirm) {
      setError("Password tidak cocok.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        fullname: fullname.trim(),
        email,
        password,
      });

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => router.push("/(auth)/login"), 800);
      } else {
        setError(response.data?.message || "Gagal register.");
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
          <Text style={styles.getStartedLabel}>GET STARTED</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Start organizing your day in a smarter way.</Text>
        </View>

        {/* Success Banner */}
        {success && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Account created successfully! Redirecting...</Text>
          </View>
        )}

        {/* Error Banner */}
        {error !== "" && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Full Name */}
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#94a3b8"
          value={fullname}
          onChangeText={(v) => { setFullname(v); setError(""); }}
          style={styles.input}
        />

        {/* Email */}
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={(v) => { setEmail(v); setError(""); }}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {/* Password */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(""); }}
            secureTextEntry={!showPassword}
            style={[styles.input, styles.inputWithIcon]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
        </View>

        {/* Password Strength */}
        {password.length > 0 && (
          <View style={styles.strengthRow}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  { backgroundColor: strength >= i ? strengthColor[strength] : "#e2e8f0" },
                ]}
              />
            ))}
          </View>
        )}

        {/* Confirm Password */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Confirm password"
            placeholderTextColor="#94a3b8"
            value={confirm}
            onChangeText={(v) => { setConfirm(v); setError(""); }}
            secureTextEntry={!showConfirm}
            style={[styles.input, styles.inputWithIcon]}
          />
          <TouchableOpacity
            onPress={() => setShowConfirm(!showConfirm)}
            style={styles.eyeBtn}
          >
            <Text style={styles.eyeText}>{showConfirm ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
        </View>

        {/* Agree checkbox */}
        <TouchableOpacity
          style={styles.agreeRow}
          onPress={() => setAgree(!agree)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
            {agree && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.agreeText}>I agree to the{" "}
            <Text style={styles.agreeLink}>Terms and Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>Create Account</Text>
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

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginHint}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>Sign in</Text>
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
  getStartedLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#2563eb",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
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

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#ffffff",
    marginBottom: 14,
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  inputWithIcon: {
    paddingRight: 48,
    marginBottom: 0,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  eyeText: {
    fontSize: 16,
  },

  // Strength
  strengthRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
    marginTop: -6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 99,
  },

  // Agree
  agreeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 24,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkmark: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  agreeText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },
  agreeLink: {
    color: "#2563eb",
    fontWeight: "600",
  },

  // Submit
  submitButton: {
    backgroundColor: "#1e3a8a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
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

  // Google
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

  // Login link
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginHint: {
    fontSize: 14,
    color: "#334155",
  },
  loginLink: {
    fontSize: 14,
    color: "#1d4ed8",
    fontWeight: "700",
  },
});