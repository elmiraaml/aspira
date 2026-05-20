"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const KATEGORI_LIST = [
  { value: "infrastruktur", label: "🛣️ Infrastruktur Jalan", icon: "🛣️" },
  { value: "kebersihan", label: "🗑️ Kebersihan & Sampah", icon: "🗑️" },
  { value: "penerangan", label: "💡 Penerangan Jalan", icon: "💡" },
  { value: "banjir", label: "🌊 Banjir & Drainase", icon: "🌊" },
  { value: "kebencanaan", label: "⚠️ Kebencanaan", icon: "⚠️" },
  { value: "keamanan", label: "🔒 Keamanan & Ketertiban", icon: "🔒" },
  { value: "sosial", label: "🤝 Masalah Sosial", icon: "🤝" },
  { value: "kesehatan", label: "🏥 Kesehatan Lingkungan", icon: "🏥" },
  { value: "pendidikan", label: "🏫 Fasilitas Pendidikan", icon: "🏫" },
  { value: "transportasi", label: "🚌 Transportasi Umum", icon: "🚌" },
  { value: "taman", label: "🌳 Taman & RTH", icon: "🌳" },
  { value: "pasar", label: "🏪 Pasar & Ekonomi", icon: "🏪" },
  { value: "perizinan", label: "📄 Perizinan & Birokrasi", icon: "📄" },
  { value: "korupsi", label: "⚖️ Dugaan Korupsi", icon: "⚖️" },
  { value: "lingkungan", label: "♻️ Pencemaran Lingkungan", icon: "♻️" },
  { value: "hewan", label: "🐕 Hewan Liar & Ternak", icon: "🐕" },
  { value: "lainnya", label: "📋 Lainnya", icon: "📋", custom: true },
];

const PRIORITY_CONFIG = {
  LOW: { label: "Rendah", color: "text-green-600 bg-green-50 border-green-200" },
  MEDIUM: { label: "Sedang", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  HIGH: { label: "Tinggi", color: "text-orange-600 bg-orange-50 border-orange-200" },
  URGENT: { label: "Mendesak", color: "text-red-600 bg-red-50 border-red-200" },
};

const STATUS_AUTO = {
  infrastruktur: "PENDING",
  kebersihan: "PENDING",
  penerangan: "PENDING",
  banjir: "IN_REVIEW",
  kebencanaan: "URGENT",
  keamanan: "IN_REVIEW",
  sosial: "PENDING",
  kesehatan: "IN_REVIEW",
  pendidikan: "PENDING",
  transportasi: "PENDING",
  taman: "PENDING",
  pasar: "PENDING",
  perizinan: "IN_REVIEW",
  korupsi: "IN_REVIEW",
  lingkungan: "IN_REVIEW",
  hewan: "PENDING",
  lainnya: "PENDING",
};

const STATUS_LABEL = {
  PENDING: { label: "Menunggu", color: "bg-gray-100 text-gray-600" },
  IN_REVIEW: { label: "Ditinjau", color: "bg-blue-100 text-blue-600" },
  URGENT: { label: "Darurat", color: "bg-red-100 text-red-600" },
  IN_PROGRESS: { label: "Diproses", color: "bg-yellow-100 text-yellow-600" },
  RESOLVED: { label: "Selesai", color: "bg-green-100 text-green-600" },
};

export default function PengaduanModal({ show, onClose, onSave, editPengaduan }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kategori, setKategori] = useState("");
  const [kategoriCustom, setKategoriCustom] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [images, setImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lokasi, setLokasi] = useState("");
  const [lokasiCoords, setLokasiCoords] = useState(null);
  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [autoStatus, setAutoStatus] = useState("PENDING");
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const mapRef = useRef(null);
  const iframeRef = useRef(null);

  const TOTAL_STEPS = 3;

  useEffect(() => {
    if (editPengaduan) {
      setTitle(editPengaduan.title || "");
      setDescription(editPengaduan.description || "");
      setPriority(editPengaduan.priority || "MEDIUM");
      setKategori(editPengaduan.kategori || "");
      setLokasi(editPengaduan.lokasi || "");
      setDueDate(editPengaduan.dueDate ? editPengaduan.dueDate.split("T")[0] : "");
      setImages(editPengaduan.images || []);
      setAutoStatus(editPengaduan.status || "PENDING");
    } else {
      resetForm();
    }
  }, [editPengaduan, show]);

  useEffect(() => {
    if (kategori) {
      setAutoStatus(STATUS_AUTO[kategori] || "PENDING");
    }
  }, [kategori]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setKategori("");
    setKategoriCustom("");
    setLokasi("");
    setLokasiCoords(null);
    setDueDate("");
    setImages([]);
    setStep(1);
    setErrors({});
    setShowMap(false);
    setAutoStatus("PENDING");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // File handling
  const processFiles = useCallback((files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const readers = valid.map(
      (file) =>
        new Promise((res) => {
          const reader = new FileReader();
          reader.onload = (e) =>
            res({ url: e.target.result, name: file.name, size: file.size, file });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((newImgs) =>
      setImages((prev) => [...prev, ...newImgs].slice(0, 5))
    );
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (previewIndex === idx) setPreviewIndex(null);
  };

  // Lokasi
  const detectLokasi = () => {
    if (!navigator.geolocation) return;
    setLoadingLokasi(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLokasiCoords({ lat: latitude, lng: longitude });
        setLokasi(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setShowMap(true);
        setLoadingLokasi(false);
      },
      () => {
        setLoadingLokasi(false);
        alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.");
      }
    );
  };

  const getMapUrl = () => {
    if (!lokasiCoords) return null;
    const { lat, lng } = lokasiCoords;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;
  };

  // Validation
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!kategori) e.kategori = "Pilih kategori pengaduan";
      if (kategori === "lainnya" && !kategoriCustom.trim()) e.kategoriCustom = "Jelaskan kategori pengaduan Anda";
      if (!title.trim()) e.title = "Judul tidak boleh kosong";
    }
    if (s === 2) {
      if (!lokasi.trim()) e.lokasi = "Lokasi kejadian diperlukan";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = () => {
    if (!validateStep(step)) return;
    onSave({
      id: editPengaduan?.id || "",
      title: title.trim(),
      description: description.trim() || undefined,
      status: autoStatus,
      priority,
      kategori: kategori === "lainnya" ? `lainnya:${kategoriCustom.trim()}` : kategori,
      lokasi,
      lokasiCoords,
      dueDate: dueDate || undefined,
      images: images.map((i) => i.url),
    });
    handleClose();
  };

  if (!show) return null;

  const statusCfg = STATUS_LABEL[autoStatus] || STATUS_LABEL["PENDING"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease]">
        
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-blue-500 font-semibold">
                {editPengaduan ? "Edit Pengaduan" : "Pengaduan Baru"}
              </p>
              <h3 className="text-base font-semibold text-gray-800 mt-0.5">
                {editPengaduan ? "Perbarui pengaduan" : "Buat laporan pengaduan"}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                    s < step
                      ? "bg-blue-500 text-white"
                      : s === step
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {s < step ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                <span className={`text-[11px] font-medium ${s === step ? "text-blue-600" : "text-gray-400"}`}>
                  {s === 1 ? "Detail" : s === 2 ? "Lokasi" : "Lampiran"}
                </span>
                {s < 3 && <div className={`h-px w-8 ${s < step ? "bg-blue-400" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">

          {/* ─── STEP 1: Detail ─── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Kategori */}
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-2 block">
                  Kategori Pengaduan <span className="text-red-400">*</span>
                </label>
                <div className="max-h-52 overflow-y-auto pr-0.5">
                  <div className="grid grid-cols-3 gap-2">
                    {KATEGORI_LIST.map((k) => (
                      <button
                        key={k.value}
                        type="button"
                        onClick={() => { setKategori(k.value); setKategoriCustom(""); }}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all ${
                          kategori === k.value
                            ? "border-blue-400 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-xl">{k.icon}</span>
                        <span className="text-[10px] leading-tight font-medium">
                          {k.label.split(" ").slice(1).join(" ")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input custom untuk "Lainnya" */}
                {kategori === "lainnya" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={kategoriCustom}
                      onChange={(e) => setKategoriCustom(e.target.value)}
                      placeholder="Tuliskan jenis pengaduan Anda..."
                      autoFocus
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 outline-none transition placeholder:text-gray-300 ${
                        errors.kategoriCustom ? "border-red-300" : "border-gray-200 focus:border-blue-400"
                      }`}
                    />
                    {errors.kategoriCustom && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.kategoriCustom}</p>
                    )}
                  </div>
                )}
                {errors.kategori && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.kategori}</p>
                )}
              </div>

              {/* Status otomatis */}
              {kategori && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-500">Status otomatis:</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto">Ditentukan sistem</span>
                </div>
              )}

              {/* Judul */}
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1.5 block">
                  Judul <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Apa yang ingin Anda laporkan?"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 outline-none transition placeholder:text-gray-300 ${
                    errors.title ? "border-red-300" : "border-gray-200 focus:border-blue-400"
                  }`}
                />
                {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title}</p>}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1.5 block">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan detail pengaduan Anda..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none placeholder:text-gray-300"
                />
              </div>

              {/* Prioritas + Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1.5 block">
                    Prioritas
                  </label>
                  <div className="space-y-1.5">
                    {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPriority(key)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
                          priority === key ? cfg.color + " ring-1 ring-offset-0" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${priority === key ? "bg-current" : "bg-gray-300"}`} />
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1.5 block">
                    Tanggal Kejadian
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">Kapan kejadian terjadi?</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Lokasi ─── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-1.5 block">
                  Lokasi Kejadian <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    placeholder="Masukkan alamat atau koordinat..."
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 outline-none transition placeholder:text-gray-300 ${
                      errors.lokasi ? "border-red-300" : "border-gray-200 focus:border-blue-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={detectLokasi}
                    disabled={loadingLokasi}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 transition disabled:opacity-60 whitespace-nowrap"
                  >
                    {loadingLokasi ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    Deteksi
                  </button>
                </div>
                {errors.lokasi && <p className="text-red-500 text-[11px] mt-1">{errors.lokasi}</p>}
              </div>

              {/* Peta */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold">
                    Peta Lokasi
                  </label>
                  {!showMap && (
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="text-[11px] text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Tampilkan peta →
                    </button>
                  )}
                </div>

                {showMap ? (
                  lokasiCoords ? (
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <iframe
                        ref={iframeRef}
                        src={getMapUrl()}
                        width="100%"
                        height="220"
                        style={{ border: 0 }}
                        title="Peta Lokasi"
                      />
                      <div className="px-3 py-2 bg-gray-50 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span className="text-[11px] text-gray-600 font-mono">{lokasi}</span>
                        <button
                          type="button"
                          onClick={() => { setShowMap(false); setLokasiCoords(null); setLokasi(""); }}
                          className="ml-auto text-[11px] text-red-400 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 h-36 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <p className="text-[12px]">Klik "Deteksi" untuk menandai lokasi di peta</p>
                    </div>
                  )
                ) : (
                  <div
                    className="rounded-xl border border-gray-100 bg-gray-50 h-28 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setShowMap(true)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🗺️</div>
                      <p className="text-[12px] text-gray-500">Klik untuk tampilkan peta</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── STEP 3: Lampiran ─── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Upload zone */}
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold mb-2 block">
                  Foto / Dokumen{" "}
                  <span className="text-gray-300 normal-case tracking-normal font-normal">
                    (maks. 5 file)
                  </span>
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    isDragging
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${images.length >= 5 ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => processFiles(e.target.files)}
                  />
                  <div className="py-8 px-4 flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}>
                      <svg className={`w-6 h-6 ${isDragging ? "text-blue-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {isDragging ? "Lepaskan di sini" : "Drag & drop foto"}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        atau <span className="text-blue-500 font-medium">pilih dari perangkat</span>
                      </p>
                      <p className="text-[11px] text-gray-300 mt-1">JPG, PNG, WEBP hingga 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview grid */}
              {images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold">
                      Preview ({images.length}/5)
                    </label>
                    <button
                      type="button"
                      onClick={() => setImages([])}
                      className="text-[11px] text-red-400 hover:text-red-600 font-medium"
                    >
                      Hapus semua
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 cursor-pointer"
                        onClick={() => setPreviewIndex(idx)}
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-full object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                          <p className="text-white text-[9px] truncate">{img.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary sebelum submit */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-semibold">Ringkasan</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <span className="text-[10px] text-gray-400">Kategori</span>
                    <p className="text-[12px] font-medium text-gray-700">
                      {KATEGORI_LIST.find((k) => k.value === kategori)?.label || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Status Otomatis</span>
                    <p className={`text-[12px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${statusCfg.color}`}>
                      {statusCfg.label}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-gray-400">Judul</span>
                    <p className="text-[12px] font-medium text-gray-700 truncate">{title || "-"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Lokasi</span>
                    <p className="text-[12px] text-gray-600 truncate">{lokasi || "-"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Prioritas</span>
                    <p className="text-[12px] font-medium text-gray-700">
                      {PRIORITY_CONFIG[priority]?.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          )}

          <div className="flex-1" />

          {/* Step dots */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`rounded-full transition-all ${s === step ? "w-4 h-1.5 bg-blue-500" : "w-1.5 h-1.5 bg-gray-200"}`}
              />
            ))}
          </div>

          <div className="flex-1" />

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
            >
              Lanjut
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:opacity-90 hover:-translate-y-px transition-all shadow-md shadow-blue-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {editPengaduan ? "Simpan Perubahan" : "Kirim Laporan"}
            </button>
          )}
        </div>
      </div>

      {/* Full image preview */}
      {previewIndex !== null && images[previewIndex] && (
        <div
          className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setPreviewIndex(null)}
        >
          <img
            src={images[previewIndex].url}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setPreviewIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
              className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white text-[12px]">{previewIndex + 1}/{images.length}</span>
            <button
              onClick={() => setPreviewIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
              className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setPreviewIndex(null)}
              className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}