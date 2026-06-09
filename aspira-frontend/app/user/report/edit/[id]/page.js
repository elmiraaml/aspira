"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Save, Loader2, CheckCircle, AlertCircle,
  FileText, Tag, MapPin, Calendar, Image as ImageIcon, Upload,
} from "lucide-react";
import { api } from "@/src/lib/api";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
        Memuat peta...
      </div>
    ),
  }
);

export default function EditReportPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [mapPosition, setMapPosition] = useState([-6.2, 106.8]);
  const [formData, setFormData] = useState({
    title: "", description: "", category_id: "",
    location: "", incident_date: "", priority: "low", bukti_foto: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resReport, resCats] = await Promise.all([
          api(`/reports/${id}`, { method: "GET" }),
          api("/reports/categories", { method: "GET" }),
        ]);

        const r = resReport.report || resReport;
        if (r.status !== "pending") { router.replace(`/user/report/${id}`); return; }

        const locationValue = r.location || "";

        setFormData({
          title: r.title || "",
          description: r.description || "",
          category_id: String(r.category_id || ""),
          location: locationValue,
          incident_date: r.incident_date ? r.incident_date.split("T")[0] : "",
          priority: r.priority || "low",
          bukti_foto: null,
        });

        // Geocode lokasi lama untuk posisi awal peta
        if (locationValue) {
          const coordMatch = locationValue.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
          if (coordMatch) {
            setMapPosition([parseFloat(coordMatch[1]), parseFloat(coordMatch[2])]);
          } else {
            try {
              const geo = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationValue)}&format=json&limit=1`,
                { headers: { "Accept-Language": "id" } }
              );
              const geoData = await geo.json();
              if (geoData[0]) {
                setMapPosition([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
              }
            } catch {}
          }
        }

        const fotoUrl = r.image || r.bukti_foto || "";
        if (fotoUrl) {
          setPreviewUrl(fotoUrl);
          setPreviewName("Foto saat ini");
          setExistingImageUrl(fotoUrl);
        }

        if (Array.isArray(resCats)) setCategories(resCats);
        else if (Array.isArray(resCats.data)) setCategories(resCats.data);
      } catch (err) {
        console.error("Load error:", err);
        setAlert({ type: "error", message: "Gagal memuat data laporan" });
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleLocationSelect = (lat, lng, name) => {
    setMapPosition([lat, lng]);
    updateField("location", name);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAlert({ type: "error", message: "File harus berupa gambar" }); return; }
    if (file.size > 5 * 1024 * 1024) { setAlert({ type: "error", message: "Ukuran file maksimal 5MB" }); return; }
    setFormData((prev) => ({ ...prev, bukti_foto: file }));
    setPreviewName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
    setAlert({ type: "", message: "" });
  };

  const validate = () => {
    const { title, description, category_id, location, incident_date } = formData;
    if (!title.trim())        { setAlert({ type: "error", message: "Judul wajib diisi." });      return false; }
    if (!description.trim())  { setAlert({ type: "error", message: "Deskripsi wajib diisi." });  return false; }
    if (!category_id)         { setAlert({ type: "error", message: "Kategori wajib dipilih." }); return false; }
    if (!location.trim())     { setAlert({ type: "error", message: "Lokasi wajib diisi." });     return false; }
    if (!incident_date)       { setAlert({ type: "error", message: "Tanggal wajib diisi." });    return false; }
    return true;
  };

  const handleSubmit = async () => {
    setAlert({ type: "", message: "" });
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      let imageUrl = existingImageUrl;

      if (formData.bukti_foto) {
        const uploadBody = new FormData();
        uploadBody.append("image", formData.bukti_foto);
        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/reports/upload`,
          { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: uploadBody }
        );
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Gagal upload gambar");
        imageUrl = uploadData.image_url;
      }

      const payload = {
        category_id: String(formData.category_id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        incident_date: formData.incident_date,
        priority: formData.priority,
        image: imageUrl || null,
      };

      await api(`/reports/${id}`, { method: "PUT", body: JSON.stringify(payload) });

      setAlert({ type: "success", message: "Laporan berhasil diperbarui!" });
      setTimeout(() => router.push(`/user/report/${id}`), 1500);
    } catch (err) {
      console.error("Update error:", err);
      setAlert({ type: "error", message: err.message || "Gagal memperbarui laporan" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafd]">
        <Loader2 size={42} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 px-8 py-7 flex justify-center">
          <div className="w-full max-w-2xl flex flex-col gap-6">

            <Link href={`/user/report/${id}`} className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all w-fit">
              <ArrowLeft size={18} /> Kembali ke Detail
            </Link>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-blue-500 font-medium">Edit</p>
              <h1 className="text-2xl font-semibold text-gray-900">Ubah Laporan</h1>
            </div>

            {alert.message && (
              <div className={`flex items-center gap-2 p-4 rounded-xl border text-sm font-medium ${
                alert.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {alert.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {alert.message}
              </div>
            )}

            {/* Judul */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><FileText size={15} /></div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">Judul Laporan *</p>
              </div>
              <input type="text" placeholder="Masukkan judul laporan..." value={formData.title} onChange={(e) => updateField("title", e.target.value)} className={inputClass} />
            </div>

            {/* Deskripsi */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><FileText size={15} /></div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">Deskripsi *</p>
              </div>
              <textarea placeholder="Jelaskan kejadian secara detail..." value={formData.description} onChange={(e) => updateField("description", e.target.value)} rows={4} className={`${inputClass} resize-y`} />
            </div>

            {/* Kategori */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Tag size={15} /></div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">Kategori *</p>
              </div>
              <select value={formData.category_id} onChange={(e) => updateField("category_id", e.target.value)} className={inputClass}>
                <option value="">Pilih kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
            </div>

            {/* Lokasi — diganti dengan peta interaktif */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600"><MapPin size={15} /></div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">Lokasi Kejadian *</p>
              </div>
              <LocationPickerMap
                position={mapPosition}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            {/* Tanggal */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Calendar size={15} /></div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">Tanggal Kejadian *</p>
              </div>
              <input
                type="date"
                value={formData.incident_date}
                max={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()}
                onChange={(e) => updateField("incident_date", e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Prioritas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><AlertCircle size={15} /></div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">Tingkat Prioritas</p>
              </div>
              <select value={formData.priority} onChange={(e) => updateField("priority", e.target.value)} className={inputClass}>
                <option value="low">Rendah (Low)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="high">Tinggi (High)</option>
              </select>
            </div>

            {/* Foto Bukti */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><ImageIcon size={15} /></div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">Foto Bukti</p>
              </div>
              <label className="border-2 border-dashed border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition min-h-[90px]">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="max-h-28 rounded-xl mb-2 object-cover" />
                    <p className="text-xs text-gray-400 truncate max-w-full px-2">{previewName}</p>
                    <p className="text-xs text-blue-400 mt-1">Klik untuk ganti foto</p>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400 mb-2"><Upload size={16} /></div>
                    <p className="text-sm font-medium text-gray-600">Upload Gambar</p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG maks. 5MB</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:translate-y-0"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={15} />}
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

          </div>
        </main>
      </div>
    </div>
  );
}