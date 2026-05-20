"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/src/lib/api";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function getStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 10) return 2;
  return 3;
}

export default function Page() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [agree, setAgree] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = getStrength(form.password);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agree) {
      alert("Harap setujui syarat layanan.");
      return;
    }

    if (form.password !== form.confirm) {
      alert("Password tidak cocok.");
      return;
    }

    setError("");

    try {
      const res = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullname: form.fullName.trim(),
          email: form.email,
          password: form.password,
        }),
      });

      if (res.message === "Register berhasil") {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 800);
      } else {
        setError(res.message || "Gagal register.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <div className="flex-1 flex items-center justify-center px-6 lg:px-20 py-14">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">

          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">
            Get Started
          </p>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>

          <p className="text-sm text-gray-700 mb-6">
            Start organizing your day in a smarter way.
          </p>

          {success && (
            <div className="mb-5 bg-green-100 border border-green-600 text-green-800 px-4 py-3 rounded-xl text-sm font-semibold">
              ✓ Account created successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange("fullName")}
              className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
              required
            />

            {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange("password")}
              className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

            {/* Password Strength */}
            {form.password && (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full ${
                      strength >= i
                        ? strength === 1
                          ? "bg-red-500"
                          : strength === 2
                          ? "bg-yellow-500"
                          : "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={form.confirm}
              onChange={handleChange("confirm")}
              className="w-full border border-gray-300 text-gray-900 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

            {/* Agree */}
            <div className="flex items-start gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 accent-blue-600"
              />
              <span>I agree to the Terms and Privacy Policy</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-900 text-white font-bold shadow-lg"
            >
              Create Account
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 text-xs text-gray-600">
            <div className="flex-1 h-px bg-gray-300"></div>
            OR CONTINUE WITH
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button className="w-full border border-gray-300 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-gray-900">
            <GoogleIcon /> Google
          </button>

          <p className="text-center text-sm text-gray-800 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-700 font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}