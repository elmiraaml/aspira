"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


import PengaduanCard from "../../components/PengaduanCard";
import PengaduanModal from "../../components/Pengaduanmodal";
import { api } from "@/src/lib/api";

import {
  FileText,
  Clock3,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [pengaduan, setPengaduan] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [editPengaduan, setEditPengaduan] =
    useState(null);

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

  useEffect(() => {
    fetchReports();
  }, []);

  // STATS
  const total = pengaduan.length;

  const selesai = pengaduan.filter(
    (t) => t.status === "selesai"
  ).length;

  const menunggu = pengaduan.filter(
    (t) => t.status === "pending"
  ).length;

  const diproses = pengaduan.filter(
    (t) =>
      ["diproses", "diperiksa", "diverifikasi", "tindak_lanjut", "process"].includes(t.status)
  ).length;

  // RECENT
  const recentPengaduan = [
    ...pengaduan,
  ]
    .reverse()
    .slice(0, 6);

  // SAVE
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

  // TOGGLE
  const togglePengaduan = async (id) => {
    const target = pengaduan.find((x) => x.id === id);
    if (!target) return;
    try {
      const newStatus = target.status === "selesai" ? "pending" : "selesai";
      await api(`/reports/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...target,
          status: newStatus,
        }),
      });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const deletePengaduan = async (id) => {
    if (!window.confirm("Yakin ingin menghapus laporan ini?")) return;
    try {
      await api(`/reports/${id}`, { method: "DELETE" });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  // CARDS
  const stats = [
    {
      label: "Total Pengaduan",

      value: total,

      color: "text-blue-600",

      bg: "bg-blue-50",

      icon: (
        <FileText size={20} />
      ),
    },

    {
      label: "Menunggu",

      value: menunggu,

      color: "text-amber-500",

      bg: "bg-amber-50",

      icon: (
        <Clock3 size={20} />
      ),
    },

    {
      label: "Diproses",

      value: diproses,

      color: "text-purple-600",

      bg: "bg-purple-50",

      icon: (
        <LoaderCircle size={20} />
      ),
    },

    {
      label: "Selesai",

      value: selesai,

      color: "text-green-600",

      bg: "bg-green-50",

      icon: (
        <CheckCircle2 size={20} />
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafd]">


      {/* MAIN */}
      <div className="flex flex-col flex-1 min-w-0">


        {/* CONTENT */}
        <main className="flex-1 px-8 py-7">
          {/* STATS */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(
              ({
                label,
                value,
                color,
                bg,
                icon,
              }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${bg} mb-4 flex items-center justify-center ${color}`}
                  >
                    {icon}
                  </div>

                  <p className="text-2xl font-semibold text-gray-800">
                    {value}
                  </p>

                  <p
                    className={`text-[11px] mt-0.5 ${color}`}
                  >
                    {label}
                  </p>
                </div>
              )
            )}
          </div>

          {/* HEADER */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">
                  Aktivitas Terbaru
                </p>

                <h3 className="text-lg text-gray-800 font-semibold">
                  Pengaduan
                  Masyarakat
                </h3>
              </div>

              <button
                onClick={() => {
                  router.push("/user/create-report");
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:opacity-90 hover:-translate-y-px transition-all shadow-md shadow-blue-200"
              >
                <span className="text-base leading-none">
                  +
                </span>

                Buat Pengaduan
              </button>
            </div>

            {/* CONTENT */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : recentPengaduan.length ===
              0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-300 text-2xl">
                  +
                </div>

                <p className="text-xl text-gray-700 mb-1 font-medium">
                  Belum ada
                  pengaduan
                </p>

                <p className="text-sm text-gray-400">
                  Klik "Buat
                  Pengaduan"
                  untuk mulai
                  mengirim laporan
                  masyarakat.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPengaduan.map(
                  (item) => (
                    <PengaduanCard
                      key={item.id}
                      pengaduan={
                        item
                      }
                      onToggle={
                        togglePengaduan
                      }
                      onDelete={
                        deletePengaduan
                      }
                      onEdit={(
                        p
                      ) => {
                        setEditPengaduan(
                          p
                        );

                        setShowModal(
                          true
                        );
                      }}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL */}
      <PengaduanModal
        show={showModal}
        onClose={() =>
          setShowModal(false)
        }
        onSave={savePengaduan}
        editPengaduan={
          editPengaduan
        }
      />
    </div>
  );
}