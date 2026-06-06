// ===========================================
// FILE 1:
// app/superadmin/reports/page.jsx
// ===========================================
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye, FileText, Loader2 } from "lucide-react";
import { api } from "@/src/lib/api";

export default function SuperAdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api("/reports");
        if (data && data.message && data.message === "Server error") throw new Error("Gagal load data");
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch Reports Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(
    (report) =>
      report.title?.toLowerCase().includes(search.toLowerCase()) ||
      (report.fullname || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const getPriorityStyle = (priority) => {
    const map = {
      urgent: { bg: "#fde8e8", color: "#c0392b", label: "Mendesak" },
      emergency: { bg: "#fde8e8", color: "#c0392b", label: "Mendesak" },
      high: { bg: "#fff7d6", color: "#b07d00", label: "Tinggi" },
      medium: { bg: "#e8f5ff", color: "#004b8d", label: "Sedang" },
      low: { bg: "#f1f1e6", color: "#3a5068", label: "Rendah" },
    };
    return map[priority?.toLowerCase()] || map.low;
  };

  const getStatusStyle = (status) => {
    const map = {
      pending: { bg: "#fff7d6", color: "#b07d00", label: "Menunggu" },
      diperiksa: { bg: "#e8f5ff", color: "#004b8d", label: "Diperiksa" },
      diverifikasi: { bg: "#ede9fe", color: "#6d28d9", label: "Diverifikasi" },
      diproses: { bg: "#e8f5ff", color: "#004b8d", label: "Diproses" },
      tindak_lanjut: { bg: "#e0f2fe", color: "#0369a1", label: "Tindak Lanjut" },
      selesai: { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai" },
      rejected: { bg: "#fde8e8", color: "#c0392b", label: "Ditolak" },
      ditolak: { bg: "#fde8e8", color: "#c0392b", label: "Ditolak" },
    };

    return map[status] || {
      bg: "#f1f1e6",
      color: "#3a5068",
      label: status,
    };
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Loader2
          size={42}
          style={{ color: "#004b8d", animation: "spin 1s linear infinite" }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <FileText size={28} color="#004b8d" />
          <h1 style={styles.title}>Semua Laporan</h1>
        </div>
        <p style={styles.subtitle}>Monitoring all user reports</p>
      </div>

      <div style={styles.statsCard}>
        <FileText size={22} color="#004b8d" />
        <div>
          <p style={styles.statsLabel}>Total Laporan Keseluruhan</p>
          <h2 style={styles.statsValue}>{reports.length}</h2>
        </div>
      </div>

      <div style={styles.searchBox}>
        <Search size={18} color="#8a9bb0" />
        <input
          type="text"
          placeholder="Cari laporan berdasarkan judul atau pelapor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Judul</th>
              <th style={styles.th}>Pelapor</th>
              <th style={styles.th}>Kategori</th>
              <th style={styles.th}>Prioritas</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Tanggal</th>
              <th style={styles.th}>Detail</th>
            </tr>
          </thead>

          <tbody>
            {filteredReports.map((report) => {
              const status = getStatusStyle(report.status);
              const priority = getPriorityStyle(report.priority);

              return (
                <tr key={report.id}>
                  <td style={styles.td}>{report.title}</td>
                  <td style={styles.td}>{report.fullname || "Masyarakat"}</td>
                  <td style={styles.td}>{report.category_name || "-"}</td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background: priority.bg,
                        color: priority.color,
                      }}
                    >
                      {priority.label}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background: status.bg,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {new Date(report.created_at).toLocaleDateString("id-ID")}
                  </td>

                  <td style={styles.td}>
                    <Link
                      href={`/superadmin/reports/${report.id}`}
                      style={styles.viewBtn}
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div style={styles.empty}>Tidak ada laporan ditemukan.</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loadingWrap: {
    minHeight: "60vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: 800, color: "#001f3d", margin: 0 },
  subtitle: { color: "#3a5068", fontSize: 14, marginTop: 4 },
  statsCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "16px 20px",
    border: "1px solid rgba(0,75,141,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  statsLabel: { fontSize: 12, color: "#3a5068", margin: 0 },
  statsValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "#001f3d",
    margin: 0,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(0,75,141,0.08)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 14,
    fontFamily: "'Inter', system-ui",
  },
  tableWrap: {
    background: "#fff",
    borderRadius: 20,
    overflow: "auto",
    border: "1px solid rgba(0,75,141,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 700,
  },
  th: {
    textAlign: "left",
    padding: 16,
    background: "#f8f9ff",
    fontSize: 13,
    fontWeight: 600,
    color: "#001f3d",
  },
  td: {
    padding: 16,
    borderTop: "1px solid #f1f1e6",
    fontSize: 14,
    color: "#001f3d",
  },
  badge: {
    padding: "5px 12px",
    borderRadius: 40,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  },
  viewBtn: {
    display: "inline-flex",
    padding: 8,
    borderRadius: 10,
    background: "#e8f5ff",
    color: "#004b8d",
    textDecoration: "none",
  },
  empty: {
    padding: 48,
    textAlign: "center",
    color: "#3a5068",
  },
};