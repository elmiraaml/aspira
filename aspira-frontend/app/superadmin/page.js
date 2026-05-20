// app/superadmin/dashboard/page.jsx (perbaikan status saja)
// Hapus bagian emergencyReports dan priority_summary

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
  TrendingUp,
  Loader2,
  Eye,
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
  });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await api("/admin/dashboard");
        if (dashboardData.message && dashboardData.message === "Server error") {
          throw new Error("Dashboard Error");
        }

        const reportsData = await api("/reports");
        if (reportsData.message && reportsData.message === "Server error") {
          throw new Error("Reports Error");
        }

        setStats({
          totalUsers: dashboardData.total_users || 0,
          totalAdmins: dashboardData.total_admins || 0,
          totalReports: dashboardData.total_reports || 0,
          todayReports: dashboardData.today_reports || 0,
          pendingReports: dashboardData.pending_reports || 0,
          processReports: dashboardData.process_reports || 0,
          selesaiReports: dashboardData.completed_reports || 0,
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
    if (status === "pending") return { bg: "#fff7d6", color: "#b07d00", label: "Menunggu" };
    if (status === "selesai") return { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai" };
    return { bg: "#e8f5ff", color: "#004b8d", label: "Diproses" };
  };

  const statCards = [
    { label: "Total User", value: stats.totalUsers, icon: <Users size={18} />, bg: "#e8f5ff", color: "#004b8d" },
    { label: "Total Admin", value: stats.totalAdmins, icon: <Shield size={18} />, bg: "#ede9fe", color: "#6d28d9" },
    { label: "Total Laporan", value: stats.totalReports, icon: <FileText size={18} />, bg: "#f1f1e6", color: "#004b8d" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Stats Grid */}
      <div style={styles.grid3}>
        {statCards.map((card) => (
          <div key={card.label} style={styles.statCard}>
            <div style={{ ...styles.iconBox, background: card.bg, color: card.color }}>{card.icon}</div>
            <p style={styles.cardLabel}>{card.label}</p>
            <h3 style={styles.cardValue}>{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Mini Status Cards */}
      <div style={styles.grid4}>
        <MiniStatusCard title="Hari Ini" value={stats.todayReports} icon={<TrendingUp size={18} />} color="#6d28d9" bg="#ede9fe" />
        <MiniStatusCard title="Menunggu" value={stats.pendingReports} icon={<Clock size={18} />} color="#b07d00" bg="#fff7d6" />
        <MiniStatusCard title="Diproses" value={stats.processReports} icon={<Activity size={18} />} color="#004b8d" bg="#e8f5ff" />
        <MiniStatusCard title="Selesai" value={stats.selesaiReports} icon={<CheckCircle size={18} />} color="#0a7c5c" bg="#e6f9f4" />
      </div>

      {/* Recent Reports */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Laporan Terbaru</h3>
            <p style={styles.sectionDesc}>6 laporan terbaru seluruh sistem</p>
          </div>
          <Link href="/superadmin/reports" style={styles.linkBtn}>
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        {recentReports.length > 0 ? (
          recentReports.map((report) => {
            const status = getStatusStyle(report.status);
            return (
              <div key={report.id} style={styles.reportItem}>
                <div>
                  <h4 style={styles.reportTitle}>{report.title}</h4>
                  <p style={styles.reportMeta}>{report.reporter_name || "User"} • {new Date(report.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                <div style={styles.reportRight}>
                  <span style={{ ...styles.badge, background: status.bg, color: status.color }}>{status.label}</span>
                  <Link href={`/superadmin/reports/${report.id}`} style={styles.eyeBtn}>
                    <Eye size={16} />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
           <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-blue-300 text-2xl">
                  +
                </div>

                <p className="text-xl text-gray-700 mb-1 font-medium">
                  Belum ada
                  pengaduan
                </p>
              </div>
        )}
      </div>
    </div>
  );
}

function MiniStatusCard({ title, value, icon, color, bg }) {
  return (
    <div style={styles.miniCard}>
      <div style={{ ...styles.iconBoxSmall, background: bg, color }}>{icon}</div>
      <div>
        <p style={styles.cardLabel}>{title}</p>
        <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#001f3d" }}>{value}</h3>
      </div>
    </div>
  );
}

const styles = {
  loadingWrap: { minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" },
  hero: { background: "linear-gradient(135deg, #001f3d, #004b8d, #43acff)", borderRadius: 24, padding: 28, color: "#fff" },
  heroBadge: { display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "4px 14px", borderRadius: 40, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 16 },
  heroTitle: { fontSize: 30, fontWeight: 800, marginBottom: 8 },
  heroDesc: { fontSize: 14, color: "rgba(255,255,255,0.85)", maxWidth: 700, lineHeight: 1.6, marginBottom: 16 },
  heroFeatures: { display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 },
  statCard: { background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(0,75,141,0.08)" },
  miniCard: { background: "#fff", borderRadius: 18, padding: 18, border: "1px solid rgba(0,75,141,0.08)", display: "flex", alignItems: "center", gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  iconBoxSmall: { width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardLabel: { fontSize: 13, color: "#3a5068", marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: 800, color: "#001f3d", margin: 0 },
  tableCard: { background: "#fff", borderRadius: 20, border: "1px solid rgba(0,75,141,0.08)", overflow: "hidden" },
  tableHeader: { padding: "18px 24px", borderBottom: "1px solid #f1f1e6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "#001f3d" },
  sectionDesc: { margin: "4px 0 0", fontSize: 12, color: "#3a5068" },
  linkBtn: { display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "#004b8d", fontWeight: 600, fontSize: 13 },
  reportItem: { padding: "16px 24px", borderBottom: "1px solid #f1f1e6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  reportTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#001f3d" },
  reportMeta: { margin: "4px 0 0", fontSize: 12, color: "#3a5068" },
  reportRight: { display: "flex", alignItems: "center", gap: 10 },
  badge: { padding: "5px 14px", borderRadius: 40, fontSize: 12, fontWeight: 600 },
  eyeBtn: { width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#e8f5ff", color: "#004b8d", textDecoration: "none" },
  empty: { padding: 48, textAlign: "center", color: "#3a5068" },
};