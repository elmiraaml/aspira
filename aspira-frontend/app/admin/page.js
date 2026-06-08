"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Clock3, AlertTriangle, CheckCircle2,
  LoaderCircle, ArrowRight, Eye, TrendingUp, Loader2,
} from "lucide-react";
import { api } from "@/src/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, reportsData] = await Promise.all([
          api("/admin/dashboard", { method: "GET" }),
          api("/reports",         { method: "GET" }),
        ]);

        if (statsData) {
          setStats({
            total_reports: statsData.total_reports || 0,
            today_reports: statsData.today_reports || 0,
            status_summary: [
              { status: "pending",  total: statsData.pending_reports   || 0 },
              { status: "diproses", total: statsData.process_reports   || 0 },
              { status: "selesai",  total: statsData.completed_reports || 0 },
              { status: "rejected", total: statsData.rejected_reports  || 0 },
            ],
          });
        }

        if (Array.isArray(reportsData)) setRecentReports(reportsData.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={42} className="text-blue-700 animate-spin" />
      </div>
    );
  }

  const find = (key) => stats.status_summary?.find((s) => s.status === key)?.total || 0;
  const pending  = find("pending");
  const diproses = find("diproses");
  const selesai  = find("selesai");
  const rejected = find("rejected");

  const getStatusStyle = (status) => {
    const map = {
      pending:       { bg: "#fff7d6", color: "#b07d00", label: "Menunggu" },
      diperiksa:     { bg: "#e8f5ff", color: "#004b8d", label: "Diperiksa" },
      diproses:      { bg: "#e8f5ff", color: "#004b8d", label: "Diproses" },
      diverifikasi:  { bg: "#ede9fe", color: "#6d28d9", label: "Diverifikasi" },
      tindak_lanjut: { bg: "#e0f2fe", color: "#0369a1", label: "Tindak Lanjut" },
      selesai:       { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai" },
      rejected:      { bg: "#fde8e8", color: "#c0392b", label: "Ditolak" },
    };
    return map[status] || { bg: "#f1f1e6", color: "#3a5068", label: status };
  };

  const getPriorityStyle = (priority) => {
    const map = {
      urgent:    { bg: "#ffe0e0", color: "#b91c1c", label: "Mendesak" },
      emergency: { bg: "#ffe0e0", color: "#b91c1c", label: "Mendesak" },
      high:      { bg: "#ffe8cc", color: "#c45f00", label: "Tinggi"   },
      medium:    { bg: "#fef9c3", color: "#854d0e", label: "Sedang"   },
      low:       { bg: "#dcfce7", color: "#166534", label: "Rendah"   },
    };
    return map[priority?.toLowerCase()] || map.low;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Total Laporan",    value: stats.total_reports, icon: <FileText size={20} />,     bg: "bg-blue-50",   color: "text-blue-600"   },
          { title: "Laporan Hari Ini", value: stats.today_reports, icon: <TrendingUp size={20} />,   bg: "bg-purple-50", color: "text-purple-600" },
          { title: "Ditolak",          value: rejected,            icon: <AlertTriangle size={20} />, bg: "bg-red-50",    color: "text-red-500"    },
          { title: "Menunggu",         value: pending,             icon: <Clock3 size={20} />,        bg: "bg-amber-50",  color: "text-amber-500"  },
          { title: "Diproses",         value: diproses,            icon: <LoaderCircle size={20} />,  bg: "bg-sky-50",    color: "text-sky-600"    },
          { title: "Selesai",          value: selesai,             icon: <CheckCircle2 size={20} />,  bg: "bg-green-50",  color: "text-green-600"  },
        ].map(({ title, value, icon, bg, color }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-11 h-11 rounded-xl ${bg} mb-4 flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
            <p className={`text-[11px] mt-0.5 ${color}`}>{title}</p>
          </div>
        ))}
      </div>

      {/* REPORTS */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <p style={styles.sectionLabel}>Aktivitas Terbaru</p>
            <h3 style={styles.sectionTitle}>Laporan Terbaru</h3>
          </div>
          <Link href="/admin/reports" style={styles.linkBtn}>
            Kelola Semua <ArrowRight size={14} />
          </Link>
        </div>

        {recentReports.length > 0 ? (
          recentReports.map((report) => {
            const status   = getStatusStyle(report.status);
            const priority = getPriorityStyle(report.priority);
            return (
              <div key={report.id} style={styles.reportItem}>
                <div>
                  <h4 style={styles.reportTitle}>{report.title}</h4>
                  <p style={styles.reportMeta}>
                    {report.user_name || "Masyarakat"} • {new Date(report.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div style={styles.reportRight}>
                  <span style={{ ...styles.badge, background: priority.bg, color: priority.color }}>{priority.label}</span>
                  <span style={{ ...styles.badge, background: status.bg,   color: status.color   }}>{status.label}</span>
                  <Link href={`/admin/reports/${report.id}`} style={styles.eyeBtn}>
                    <Eye size={16} />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.empty}>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-300 text-2xl">+</div>
            <p className="text-xl text-gray-700 mb-1 font-medium">Belum ada laporan</p>
            <p className="text-sm text-gray-400">Tidak ada laporan terbaru saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  tableCard:    { background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,75,141,0.08)" },
  tableHeader:  { padding: "18px 24px", borderBottom: "1px solid #f1f1e6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { margin: 0, fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af" },
  sectionTitle: { margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: "#001f3d" },
  linkBtn:      { display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "#004b8d", fontWeight: 600, fontSize: 13 },
  reportItem:   { padding: "16px 24px", borderBottom: "1px solid #f1f1e6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  reportTitle:  { margin: 0, fontSize: 14, fontWeight: 600, color: "#1f2937" },
  reportMeta:   { margin: "4px 0 0", fontSize: 12, color: "#9ca3af" },
  reportRight:  { display: "flex", alignItems: "center", gap: 8 },
  badge:        { padding: "4px 12px", borderRadius: 40, fontSize: 11, fontWeight: 600 },
  eyeBtn:       { width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#e8f5ff", color: "#004b8d", textDecoration: "none" },
  empty:        { padding: 48, textAlign: "center", color: "#3a5068", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
};