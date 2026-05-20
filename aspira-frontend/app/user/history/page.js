// app/users/history/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/src/lib/api";
import {
  Loader2,
  AlertCircle,
  FileQuestion,
  ChevronRight,
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
} from "lucide-react";

import Sidebar from "../../../components/sidebarUser";
import Navbar from "../../../components/Navbar";

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api("/reports/my", { method: "GET" });
      if (res.message && res.message === "Server error") throw new Error("Gagal mengambil data laporan");
      setReports(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Menunggu",
          color: "text-amber-500",
          bg: "bg-amber-50",
          icon: <Clock3 size={13} />,
        };
      case "diperiksa":
        return {
          label: "Diperiksa",
          color: "text-blue-600",
          bg: "bg-blue-50",
          icon: <LoaderCircle size={13} />,
        };
      case "diverifikasi":
        return {
          label: "Diverifikasi",
          color: "text-indigo-600",
          bg: "bg-indigo-50",
          icon: <LoaderCircle size={13} />,
        };
      case "diproses":
        return {
          label: "Diproses",
          color: "text-purple-600",
          bg: "bg-purple-50",
          icon: <LoaderCircle size={13} />,
        };
      case "tindak_lanjut":
        return {
          label: "Tindak Lanjut",
          color: "text-pink-600",
          bg: "bg-pink-50",
          icon: <LoaderCircle size={13} />,
        };
      case "selesai":
        return {
          label: "Selesai",
          color: "text-green-600",
          bg: "bg-green-50",
          icon: <CheckCircle2 size={13} />,
        };
      case "ditolak":
      case "rejected":
        return {
          label: "Ditolak",
          color: "text-red-500",
          bg: "bg-red-50",
          icon: <XCircle size={13} />,
        };
      default:
        return {
          label: status,
          color: "text-gray-500",
          bg: "bg-gray-50",
          icon: null,
        };
    }
  };

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

          {/* HEADER — sama persis gaya dashboard */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">
              Riwayat
            </p>
            <h3 className="text-lg text-gray-800 font-semibold">
              Laporan Saya
            </h3>
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
              <p className="text-sm text-gray-400 mb-5">
                Klik tombol di bawah untuk membuat laporan pertama.
              </p>
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
                const status = getStatusConfig(item.status);
                return (
                  <Link
                    key={item.id}
                    href={`/user/report/${item.id}`}
                    className="block"
                  >
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4 hover:-translate-y-px hover:shadow-md transition-all cursor-pointer">
                      
                      {/* LEFT */}
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-gray-800 truncate mb-1">
                          {item.title}
                        </h2>
                        <p className="text-[11px] text-gray-400">
                          {item.category_name} &bull;{" "}
                          {new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* RIGHT */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl ${status.bg} ${status.color}`}
                        >
                          {status.icon}
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