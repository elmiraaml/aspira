"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, CheckCircle } from "lucide-react";
import { api } from "@/src/lib/api";

function SuccessOverlay({ visible, adminName }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + (100 / (2200 / 50));
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center w-[300px] shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <p className="text-xl font-bold text-gray-900 mb-2 text-center">Admin Dibuat!</p>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-1">
          Admin <span className="font-semibold text-gray-700">"{adminName}"</span> berhasil ditambahkan.
        </p>
        <p className="text-xs text-gray-400 text-center leading-relaxed mb-6">
          Akun admin baru sudah aktif dan dapat digunakan.
        </p>
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Menutup otomatis...</p>
      </div>
    </div>
  );
}

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdName, setCreatedName] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const fetchAdmins = async () => {
    try {
      const data = await api("/admin/admins");
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = "Nama wajib diisi";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Format email tidak valid";
    if (!form.password.trim()) newErrors.password = "Password wajib diisi";
    else if (form.password.length < 6) newErrors.password = "Password minimal 6 karakter";
    return newErrors;
  };

  const createAdmin = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      await api("/admin/admins", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setCreatedName(form.full_name);
      setForm({ full_name: "", email: "", password: "" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAdmin = async (id) => {
    if (!confirm("Hapus admin ini?")) return;
    try {
      await api(`/admin/admins/${id}`, { method: "DELETE" });
      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SuccessOverlay visible={showSuccess} adminName={createdName} />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">
            Manajemen
          </p>
          <h3 className="text-lg text-gray-800 font-semibold">Admin</h3>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <input
                placeholder="Nama *"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition ${errors.full_name ? "border-red-400" : "border-gray-100"}`}
              />
              {errors.full_name && <span className="text-xs text-red-500">{errors.full_name}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <input
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition ${errors.email ? "border-red-400" : "border-gray-100"}`}
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <input
                placeholder="Password *"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition ${errors.password ? "border-red-400" : "border-gray-100"}`}
              />
              {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
            </div>
          </div>

          <button
            onClick={createAdmin}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px transition-all shadow-md shadow-blue-200"
          >
            <Plus size={16} /> Tambah Admin
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Nama", "Email", "Role", "Tanggal Dibuat", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-[11px] uppercase tracking-[0.06em] font-700 text-gray-400 bg-gray-50 border-b border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? admins.map((admin) => (
                <tr key={admin.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-800 border-t border-gray-50">{admin.full_name || "-"}</td>
                  <td className="px-5 py-4 text-sm text-gray-800 border-t border-gray-50">{admin.email}</td>
                  <td className="px-5 py-4 border-t border-gray-50">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 border-t border-gray-50">
                    {new Date(admin.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-5 py-4 border-t border-gray-50">
                    <button
                      onClick={() => deleteAdmin(admin.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                    Belum ada admin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}