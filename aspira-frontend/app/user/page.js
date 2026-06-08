"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/src/lib/api";
import { FileText, Clock3, LoaderCircle, CheckCircle2 } from "lucide-react";

const STATUS_CONFIG = {
  pending:       { label: "Menunggu",      dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-600 border-amber-200",      bar: "bg-amber-400",   progress: 10  },
  diperiksa:     { label: "Diperiksa",     dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-600 border-blue-200",          bar: "bg-blue-400",    progress: 30  },
  diverifikasi:  { label: "Diverifikasi",  dot: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-600 border-indigo-200",    bar: "bg-indigo-400",  progress: 50  },
  diproses:      { label: "Diproses",      dot: "bg-purple-400",  badge: "bg-purple-50 text-purple-600 border-purple-200",    bar: "bg-purple-400",  progress: 70  },
  tindak_lanjut: { label: "Tindak Lanjut", dot: "bg-pink-400",    badge: "bg-pink-50 text-pink-600 border-pink-200",          bar: "bg-pink-400",    progress: 85  },
  selesai:       { label: "Selesai",       dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-200", bar: "bg-emerald-500", progress: 100 },
  ditolak:       { label: "Ditolak",       dot: "bg-red-500",     badge: "bg-red-50 text-red-600 border-red-200",             bar: "bg-red-500",     progress: 100 },
  rejected:      { label: "Ditolak",       dot: "bg-red-500",     badge: "bg-red-50 text-red-600 border-red-200",             bar: "bg-red-500",     progress: 100 },
};

const PRIORITY_CONFIG = {
  low:    { label: "Rendah",   color: "text-emerald-600", dot: "bg-emerald-400" },
  medium: { label: "Sedang",   color: "text-amber-600",   dot: "bg-amber-400"   },
  high:   { label: "Tinggi",   color: "text-orange-600",  dot: "bg-orange-500"  },
  urgent: { label: "Mendesak", color: "text-red-600",     dot: "bg-red-500"     },
};

function formatTanggal(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function Page() {
  const router = useRouter();

  const [pengaduan, setPengaduan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPengaduan, setEditPengaduan] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api("/reports", { method: "GET" });
      if (Array.isArray(res)) setPengaduan(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const total    = pengaduan.length;
  const selesai  = pengaduan.filter((t) => t.status === "selesai").length;
  const pending = pengaduan.filter((t) => t.status === "pending").length;
  const diproses = pengaduan.filter((t) =>
    ["diproses", "diperiksa", "diverifikasi", "tindak_lanjut", "process"].includes(t.status)
  ).length;

  const activePengaduan = pengaduan.filter(
    (r) => r.status !== "selesai" && r.status !== "rejected" && r.status !== "ditolak"
  );

  const savePengaduan = async (pengaduanData) => {
    if (editPengaduan) {
      try {
        await api(`/reports/${pengaduanData.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: pengaduanData.title,
            description: pengaduanData.description,
            category_id: pengaduanData.category_id,
            location: pengaduanData.location,
            status: pengaduanData.status,
          }),
        });
        fetchReports();
      } catch (err) {
        console.error(err);
      }
    }
    setShowModal(false);
    setEditPengaduan(null);
  };

  const stats = [
    { label: "Total Laporan", value: total,    color: "text-blue-600",   bg: "bg-blue-50",   icon: <FileText size={20} />     },
    { label: "Menunggu",        value: pending,  color: "text-amber-500",  bg: "bg-amber-50",  icon: <Clock3 size={20} />       },
    { label: "Diproses",        value: diproses,  color: "text-purple-600", bg: "bg-purple-50", icon: <LoaderCircle size={20} /> },
    { label: "Selesai",         value: selesai,   color: "text-green-600",  bg: "bg-green-50",  icon: <CheckCircle2 size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 px-8 py-7">

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, color, bg, icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-11 h-11 rounded-xl ${bg} mb-4 flex items-center justify-center ${color}`}>
                  {icon}
                </div>
                <p className="text-2xl font-semibold text-gray-800">{value}</p>
                <p className={`text-[11px] mt-0.5 ${color}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">
                Aktivitas Terbaru
              </p>
              <h3 className="text-lg text-gray-800 font-semibold">Laporan Aktif</h3>
            </div>
            <button
              onClick={() => router.push("/user/create-report")}
              className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:opacity-90 hover:-translate-y-px transition-all shadow-md shadow-blue-200"
            >
              <span className="text-base leading-none">+</span>
              Buat Pengaduan
            </button>
          </div>

          {/* LIST */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : activePengaduan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-300 text-2xl">+</div>
              <p className="text-xl text-gray-700 mb-1 font-medium">Belum ada pengaduan aktif</p>
              <p className="text-sm text-gray-400">Klik "Buat Pengaduan" untuk mulai mengirim laporan masyarakat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePengaduan.map((item) => {
                const status   = STATUS_CONFIG[item.status]                    || STATUS_CONFIG.pending;
                const priority = PRIORITY_CONFIG[item.priority?.toLowerCase()] || PRIORITY_CONFIG.low;

                return (
                  <Link key={item.id} href={`/user/report/${item.id}`} className="block">
                    <article className="
                      group relative flex flex-col gap-0
                      bg-white rounded-2xl border border-gray-100
                      shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                      hover:shadow-[0_6px_24px_rgba(59,130,246,0.10)]
                      hover:border-blue-100 hover:-translate-y-0.5
                      transition-all duration-200 ease-out
                      cursor-pointer overflow-hidden select-none
                    ">
                      {(item.image || item.bukti_foto) && (
                        <div className="w-full h-40 bg-gray-100 overflow-hidden shrink-0">
                          <img
                            src={item.image || item.bukti_foto}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      )}

                      <div className="h-[3px] w-full bg-gray-100">
                        <div
                          className={`h-full ${status.bar} transition-all duration-500 rounded-r-full`}
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>

                      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
                        {/* Title + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[14px] font-semibold text-gray-800 leading-snug group-hover:text-blue-700 transition-colors duration-150 line-clamp-2">
                            {item.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide whitespace-nowrap shrink-0 ${status.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} inline-block`} />
                            {status.label}
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-start gap-1.5">
                            <svg className="w-3.5 h-3.5 mt-[1px] text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-[12px] text-gray-500 leading-tight line-clamp-1">
                              {item.location || item.lokasi || "Lokasi tidak dicantumkan"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[12px] text-gray-500">
                              {formatTanggal(item.created_at || item.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} inline-block`} />
                            <span className={`text-[11px] font-semibold ${priority.color}`}>
                              Prioritas {priority.label}
                            </span>
                          </div>
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-blue-50 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}