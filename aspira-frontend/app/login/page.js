"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Page() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        setSuccess(true);
        setTimeout(() => {
          if (res.user.role === "admin") {
            router.push("/admin");
          } else if (res.user.role === "superadmin") {
            router.push("/superadmin");
          } else {
            router.push("/user");
          }
        }, 800);
      } else {
        setError(res.message || "Email atau password salah.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-20 py-14">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">
          <div className="mb-8">
            <p className="tracking-widest text-blue-700 font-semibold">
              Welcome Back
            </p>

            <h1 className="text-3xl font-bold text-slate-900 mt-2">
              Sign in to your account
            </h1>

          </div>

          {success && (
            <div className="mb-6 bg-emerald-100 border border-emerald-500 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium">
              ✓ Login successful! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="text-sm font-semibold text-slate-800">
                Email
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="name@email.com"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-300 outline-none transition"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">
                Password
              </label>

              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="Enter your password"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-300 outline-none transition"
              />
            </div>

            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-700 font-medium">
                <input
                  type="checkbox"
                  className="accent-blue-700"
                />
                Remember me
              </label>

              <a
                href="#"
                className="text-blue-700 font-semibold hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
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

          <p className="text-center text-sm text-slate-700 mt-8">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-blue-700 font-semibold hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}