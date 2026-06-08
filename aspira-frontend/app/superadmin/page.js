"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Shield, FileText, Clock,
  CheckCircle, ArrowRight, Activity,
  TrendingUp, Loader2, Eye, 
  XCircle, LoaderCircle, AlertTriangle,
} from "lucide-react";
import { api } from "@/src/lib/api";

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalReports: 0,
    todayReports: 0,
    pendingReports: 0,
    processReports: 0,
    selesaiReports: 0,
    rejectedReports: 0,
  });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await api("/admin/dashboard");
        if (dashboardData.message === "Server error") throw new Error("Dashboard Error");

        const reportsData = await api("/reports");
        if (reportsData.message === "Server error") throw new Error("Reports Error");

        setStats({
          totalUsers:      dashboardData.total_users       || 0,
          totalAdmins:     dashboardData.total_admins      || 0,
          totalReports:    dashboardData.total_reports     || 0,
          todayReports:    dashboardData.today_reports     || 0,
          pendingReports:  dashboardData.pending_reports   || 0,
          processReports:  dashboardData.process_reports   || 0,
          selesaiReports:  dashboardData.completed_reports || 0,
          rejectedReports: dashboardData.rejected_reports  || 0,
        });

        setRecentReports(Array.isArray(reportsData) ? reportsData.slice(0, 6) : []);
      } catch (error) {
        console.error("Dashboard Superadmin Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Loader2 size={42} style={{ color: "#004b8d", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
    };
    return map[priority] || { bg: "#dcfce7", color: "#166534", label: "Rendah" };
  };

  const statCards = [
  { label: "Total Laporan", value: stats.totalReports,    icon: <FileText size={20} />,    bg: "bg-blue-50",   color: "text-blue-600"   },
  { label: "Hari Ini",      value: stats.todayReports,    icon: <TrendingUp size={20} />,  bg: "bg-purple-50", color: "text-purple-600" },
  { label: "Total User",    value: stats.totalUsers,      icon: <Users size={20} />,       bg: "bg-cyan-50",   color: "text-cyan-600"   },
  { label: "Total Admin",   value: stats.totalAdmins,     icon: <Shield size={20} />,      bg: "bg-indigo-50", color: "text-indigo-600" },
  { label: "Menunggu",      value: stats.pendingReports,  icon: <Clock size={20} />,       bg: "bg-amber-50",  color: "text-amber-500"  },
  { label: "Diproses",      value: stats.processReports,  icon: <LoaderCircle size={20} />,    bg: "bg-blue-50",    color: "text-blue-600"  },
  { label: "Selesai",       value: stats.selesaiReports,  icon: <CheckCircle size={20} />, bg: "bg-green-50",  color: "text-green-600"  },
  { label: "Ditolak",       value: stats.rejectedReports, icon: <AlertTriangle size={20} />,     bg: "bg-red-50",    color: "text-red-500"    },
];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Stats Grid — 4 kolom, 2 baris */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-11 h-11 rounded-xl ${bg} mb-4 flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
            <p className={`text-[11px] mt-0.5 ${color}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <p style={styles.sectionLabel}>Aktivitas Terbaru</p>
            <h3 style={styles.sectionTitle}>Laporan Terbaru</h3>
          </div>
          <Link href="/superadmin/reports" style={styles.linkBtn}>
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
                    {report.reporter_name || "User"} • {new Date(report.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div style={styles.reportRight}>
                  <span style={{ ...styles.badge, background: priority.bg, color: priority.color }}>{priority.label}</span>
                  <span style={{ ...styles.badge, background: status.bg,   color: status.color   }}>{status.label}</span>
                  <Link href={`/superadmin/reports/${report.id}`} style={styles.eyeBtn}>
                    <Eye size={16} />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-300 text-2xl">+</div>
            <p className="text-xl text-gray-700 mb-1 font-medium">Belum ada pengaduan</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loadingWrap:  { minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" },
  tableCard:    { background: "#fff", borderRadius: 20, border: "1px solid rgba(0,75,141,0.08)", overflow: "hidden" },
  tableHeader:  { padding: "18px 24px", borderBottom: "1px solid #f1f1e6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { margin: 0, fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af" },
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "#001f3d" },
  linkBtn:      { display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "#004b8d", fontWeight: 600, fontSize: 13 },
  reportItem:   { padding: "16px 24px", borderBottom: "1px solid #f1f1e6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  reportTitle:  { margin: 0, fontSize: 15, fontWeight: 700, color: "#001f3d" },
  reportMeta:   { margin: "4px 0 0", fontSize: 12, color: "#3a5068" },
  reportRight:  { display: "flex", alignItems: "center", gap: 10 },
  badge:        { padding: "5px 14px", borderRadius: 40, fontSize: 12, fontWeight: 600 },
  eyeBtn:       { width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#e8f5ff", color: "#004b8d", textDecoration: "none" },
};