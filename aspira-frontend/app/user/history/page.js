"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/src/lib/api";
import { AlertCircle, FileQuestion, ChevronRight } from "lucide-react";

const STATUS_CONFIG = {
  pending:       { label: "Menunggu",      bg: "bg-amber-50",   text: "text-amber-600",  icon: "clock"        },
  diperiksa:     { label: "Diperiksa",     bg: "bg-blue-50",    text: "text-blue-600",   icon: "loader"       },
  diverifikasi:  { label: "Diverifikasi",  bg: "bg-indigo-50",  text: "text-indigo-600", icon: "loader"       },
  diproses:      { label: "Diproses",      bg: "bg-purple-50",  text: "text-purple-600", icon: "loader"       },
  tindak_lanjut: { label: "Tindak Lanjut", bg: "bg-pink-50",    text: "text-pink-600",   icon: "loader"       },
  selesai:       { label: "Selesai",       bg: "bg-green-50",   text: "text-green-600",  icon: "check-circle" },
  ditolak:       { label: "Ditolak",       bg: "bg-red-50",     text: "text-red-500",    icon: "x-circle"     },
  rejected:      { label: "Ditolak",       bg: "bg-red-50",     text: "text-red-500",    icon: "x-circle"     },
};

const PRIORITY_CONFIG = {
  urgent: { color: "text-red-600",     dot: "bg-red-500",     label: "Mendesak" },
  high:   { color: "text-orange-600",  dot: "bg-orange-500",  label: "Tinggi"   },
  medium: { color: "text-amber-600",   dot: "bg-amber-400",   label: "Sedang"   },
  low:    { color: "text-emerald-600", dot: "bg-emerald-400", label: "Rendah"   },
};

const StatusIcon = ({ name, size = 12 }) => {
  const icons = {
    "clock":        <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    "loader":       <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
    "check-circle": <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    "x-circle":     <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  };
  return icons[name] || null;
};

function formatTanggal(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api("/reports/my", { method: "GET" });
        if (res.message === "Server error") throw new Error("Gagal mengambil data laporan");
        setReports(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 px-8 py-7">

          {/* HEADER */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">Riwayat</p>
            <h3 className="text-lg text-gray-800 font-semibold">Laporan Saya</h3>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Memuat data...</span>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 flex items-center gap-3 text-red-600">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* EMPTY */}
          {!loading && reports.length === 0 && !error && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-300">
                <FileQuestion size={26} />
              </div>
              <p className="text-gray-700 font-medium mb-1">Belum ada laporan</p>
              <p className="text-sm text-gray-400 mb-5">Anda belum pernah membuat laporan pengaduan.</p>
              <Link
                href="/user/create-report"
                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:opacity-90 hover:-translate-y-px transition-all shadow-md shadow-blue-200"
              >
                <span className="text-base leading-none">+</span>
                Buat Laporan
              </Link>
            </div>
          )}

          {/* LIST */}
          {!loading && reports.length > 0 && (
            <div className="flex flex-col gap-3">
              {reports.map((item) => {
                const status   = STATUS_CONFIG[item.status]                    || { label: item.status?.toUpperCase(), bg: "bg-gray-50", text: "text-gray-500", icon: null };
                const priority = PRIORITY_CONFIG[item.priority?.toLowerCase()] || PRIORITY_CONFIG.low;
                return (
                  <Link key={item.id} href={`/user/report/${item.id}`} className="block">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4 hover:-translate-y-px hover:shadow-md transition-all cursor-pointer">

                      {/* LEFT */}
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-gray-800 truncate mb-1">{item.title}</h2>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} inline-block flex-shrink-0`} />
                          <span className={`text-[11px] font-semibold ${priority.color}`}>Prioritas {priority.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {item.category_name} &bull;{" "}
                          {formatTanggal(item.incident_date || item.created_at)}
                        </p>
                      </div>

                      {/* RIGHT */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-2xl ${status.bg} ${status.text}`}>
                          <StatusIcon name={status.icon} size={12} />
                          {status.label}
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                          <ChevronRight size={14} />
                        </div>
                      </div>

                    </div>
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