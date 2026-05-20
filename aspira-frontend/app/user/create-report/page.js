"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  MapPin,
  Calendar,
  Tag,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

import { useRouter } from "next/navigation";

import Sidebar from "../../../components/sidebarUser";
import Navbar from "../../../components/Navbar";
import { api } from "@/src/lib/api";

export default function CreateReportPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [uploadStatus, setUploadStatus] = useState({
    type: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: "",
    incident_location: "",
    incident_date: "",
    bukti_foto: null,
  });

  const [previewName, setPreviewName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const defaultCategories = [
    { id: "infrastruktur", category_name: "Infrastruktur" },
    { id: "kebersihan", category_name: "Kebersihan & Sanitasi" },
    { id: "keamanan", category_name: "Keamanan & Ketertiban" },
    { id: "layanan_publik", category_name: "Layanan Publik" },
    { id: "lingkungan", category_name: "Lingkungan Hidup" },
    { id: "sosial", category_name: "Sosial & Kemasyarakatan" },
    { id: "pendidikan", category_name: "Pendidikan" },
    { id: "kesehatan", category_name: "Kesehatan" },
    { id: "lainnya", category_name: "Lainnya" },
  ];

  const categoryList = categories.length > 0 ? categories : defaultCategories;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api("/reports/categories", { method: "GET" });
        if (Array.isArray(res)) setCategories(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];

      if (!file.type.startsWith("image/")) {
        setUploadStatus({ type: "error", message: "File harus berupa gambar" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus({ type: "error", message: "Ukuran file maksimal 5MB" });
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreviewName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);

      setUploadStatus({ type: "", message: "" });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setSubmitting(true);

    try {
      let imageUrl = null;
      if (formData.bukti_foto) {
        const uploadBody = new FormData();
        uploadBody.append("image", formData.bukti_foto);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/reports/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadBody,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Gagal upload gambar");
        imageUrl = uploadData.image_url;
      }

      const res = await api("/reports", {
        method: "POST",
        body: JSON.stringify({
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          location: formData.incident_location,
          image: imageUrl,
        }),
      });

      if (res.message && res.message !== "Laporan berhasil dibuat") {
        throw new Error(res.message);
      }

      setUploadStatus({ type: "success", message: "Laporan berhasil dikirim" });
      setTimeout(() => router.push("/user"), 1500);
    } catch (err) {
      setUploadStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafd]">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex flex-1 items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* NAVBAR */}
        <Navbar />

        {/* CONTENT */}
        <main className="flex-1 px-8 py-7">

          {/* PAGE HEADER — sama persis gaya dashboard */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">
              Formulir Baru
            </p>
            <h3 className="text-lg text-gray-800 font-semibold">
              Buat Pengaduan
            </h3>
          </div>

          {/* ALERT */}
          {uploadStatus.message && (
            <div
              className={`mb-5 rounded-2xl border px-5 py-4 flex items-center gap-3 ${
                uploadStatus.type === "success"
                  ? "bg-green-50 border-green-100 text-green-700"
                  : "bg-red-50 border-red-100 text-red-700"
              }`}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span className="text-sm font-medium">{uploadStatus.message}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* ROW 1 — Judul (full width) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <FileText size={15} />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">
                    Judul Laporan
                  </p>
                </div>
                <input
                  type="text"
                  name="title"
                  placeholder="Masukkan judul laporan..."
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition"
                />
              </div>

              {/* ROW 2 — Deskripsi (full width) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <FileText size={15} />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">
                    Deskripsi
                  </p>
                </div>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Jelaskan kejadian secara lengkap dan jelas..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition resize-none"
                />
              </div>

              {/* ROW 3 — Kategori + Lokasi (2 kolom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* KATEGORI */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Tag size={15} />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">
                      Kategori
                    </p>
                  </div>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition"
                  >
                    <option value="">Pilih kategori</option>
                    {categoryList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LOKASI */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <MapPin size={15} />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">
                      Lokasi Kejadian
                    </p>
                  </div>
                  <input
                    type="text"
                    name="incident_location"
                    placeholder="Contoh: Jakarta Timur"
                    value={formData.incident_location}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* ROW 4 — Tanggal + Foto Bukti (2 kolom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* TANGGAL */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Calendar size={15} />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">
                      Tanggal Kejadian
                    </p>
                  </div>
                  <input
                    type="date"
                    name="incident_date"
                    value={formData.incident_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white transition"
                  />
                </div>

                {/* FOTO BUKTI */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <ImageIcon size={15} />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">
                      Foto Bukti
                    </p>
                  </div>
                  <label className="border-2 border-dashed border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition min-h-[90px]">
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-28 rounded-xl mb-2 object-cover"
                        />
                        <p className="text-xs text-gray-400 truncate max-w-full px-2">
                          {previewName}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400 mb-2">
                          <Upload size={16} />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Upload Gambar</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG maks. 5MB</p>
                      </>
                    )}
                    <input
                      type="file"
                      name="bukti_foto"
                      accept="image/*"
                      onChange={handleChange}
                      hidden
                    />
                  </label>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:translate-y-0"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {submitting ? "Mengirim..." : "Kirim Laporan"}
              </button>

            </div>
          </form>
        </main>
      </div>
    </div>
  );
}