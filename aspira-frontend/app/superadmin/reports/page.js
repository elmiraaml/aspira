// app/superadmin/reports/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye, Loader2 } from "lucide-react";
import { api } from "@/src/lib/api";

export default function SuperAdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api("/reports");
        if (data && data.message && data.message === "Server error") throw new Error("Gagal load data");
        const list = Array.isArray(data) ? data : [];
        setReports(list);
        setFiltered(list);
      } catch (err) {
        console.error("Fetch Reports Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    let temp = [...reports];
    if (search) {
      temp = temp.filter(
        (r) =>
          r.title?.toLowerCase().includes(search.toLowerCase()) ||
          (r.fullname || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      temp = temp.filter((r) => r.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      temp = temp.filter((r) => r.category_name === categoryFilter);
    }
    if (priorityFilter !== "all") {
      temp = temp.filter((r) => r.priority?.toLowerCase() === priorityFilter);
    }
    setFiltered(temp);
  }, [search, statusFilter, categoryFilter, priorityFilter, reports]);

  const getPriorityStyle = (priority) => {
    const map = {
      urgent:    { bg: "#ffe0e0", color: "#b91c1c", label: "Mendesak" },
      emergency: { bg: "#ffe0e0", color: "#b91c1c", label: "Mendesak" },
      high:      { bg: "#ffe8cc", color: "#c45f00", label: "Tinggi" },
      medium:    { bg: "#fef9c3", color: "#854d0e", label: "Sedang" },
      low:       { bg: "#dcfce7", color: "#166534", label: "Rendah" },
    };
    return map[priority?.toLowerCase()] || map.low;
  };

  const getStatusStyle = (status) => {
    const map = {
      pending:       { bg: "#fff7d6", color: "#b07d00", label: "Pending" },
      diperiksa:     { bg: "#e8f5ff", color: "#004b8d", label: "Diperiksa" },
      diverifikasi:  { bg: "#ede9fe", color: "#6d28d9", label: "Diverifikasi" },
      diproses:      { bg: "#e8f5ff", color: "#004b8d", label: "Diproses" },
      tindak_lanjut: { bg: "#e0f2fe", color: "#0369a1", label: "Tindak Lanjut" },
      selesai:       { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai" },
      rejected:      { bg: "#fde8e8", color: "#c0392b", label: "Ditolak" },
      ditolak:       { bg: "#fde8e8", color: "#c0392b", label: "Ditolak" },
    };
    return map[status] || { bg: "#f1f1e6", color: "#3a5068", label: status };
  };

  const categories = [...new Set(reports.map((r) => r.category_name).filter(Boolean))];

  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = reports.reduce((acc, r) => {
    const key = r.priority?.toLowerCase();
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const categoryCounts = reports.reduce((acc, r) => {
    if (r.category_name) acc[r.category_name] = (acc[r.category_name] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Loader2 size={42} style={{ color: "#004b8d", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

 {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">
          Manajemen
        </p>
        <h3 className="text-lg text-gray-800 font-semibold">Semua Laporan</h3>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBlock}>
        <div style={styles.searchBox}>
          <Search size={16} color="#8a9bb0" />
          <input
            type="text"
            placeholder="Cari judul atau pelapor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.dropdownRow}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
            <option value="all">Semua Status ({reports.length})</option>
            <option value="pending">Pending ({statusCounts.pending || 0})</option>
            <option value="diproses">Diproses ({statusCounts.diproses || 0})</option>
            <option value="diverifikasi">Diverifikasi ({statusCounts.diverifikasi || 0})</option>
            <option value="tindak_lanjut">Tindak Lanjut ({statusCounts.tindak_lanjut || 0})</option>
            <option value="selesai">Selesai ({statusCounts.selesai || 0})</option>
            <option value="rejected">Ditolak ({statusCounts.rejected || 0})</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={styles.select}>
            <option value="all">Semua Kategori ({reports.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat} ({categoryCounts[cat] || 0})</option>
            ))}
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={styles.select}>
            <option value="all">Semua Prioritas ({reports.length})</option>
            <option value="urgent">Mendesak ({(priorityCounts.urgent || 0) + (priorityCounts.emergency || 0)})</option>
            <option value="high">Tinggi ({priorityCounts.high || 0})</option>
            <option value="medium">Sedang ({priorityCounts.medium || 0})</option>
            <option value="low">Rendah ({priorityCounts.low || 0})</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
            {filtered.length > 0 ? (
              filtered.map((report) => {
                const priority = getPriorityStyle(report.priority);
                const status = getStatusStyle(report.status);
                return (
                  <tr key={report.id} style={styles.tr}>
                    <td style={styles.td}>{report.title}</td>
                    <td style={styles.td}>{report.fullname || "Masyarakat"}</td>
                    <td style={styles.td}>{report.category_name || "-"}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: priority.bg, color: priority.color }}>
                        {priority.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(report.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td style={styles.td}>
                      <Link href={`/superadmin/reports/${report.id}`} style={styles.detailBtn}>
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={styles.empty}>Tidak ada laporan ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  loadingWrap: { minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" },
  filterBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#fff",
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(0,75,141,0.08)",
    boxShadow: "0 2px 12px rgba(0,75,141,0.06)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "0 14px",
    background: "#f8fafd",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "11px 0",
    fontSize: 14,
    background: "transparent",
    color: "#001f3d",
    fontFamily: "'Inter', system-ui",
  },
  dropdownRow: { display: "flex", gap: 10 },
  select: {
    flex: 1,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "9px 12px",
    fontSize: 13,
    cursor: "pointer",
    background: "#f8fafd",
    color: "#001f3d",
    outline: "none",
  },
  tableWrap: {
    background: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid rgba(0,75,141,0.08)",
    boxShadow: "0 2px 12px rgba(0,75,141,0.06)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "14px 18px",
    background: "#f8f9ff",
    fontSize: 12,
    fontWeight: 700,
    color: "#3a5068",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid rgba(0,75,141,0.08)",
  },
  tr: { transition: "background 0.15s" },
  td: {
    padding: "15px 18px",
    borderTop: "1px solid #f1f5fb",
    fontSize: 14,
    color: "#001f3d",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 40,
    fontSize: 12,
    fontWeight: 600,
  },
  detailBtn: {
    width: 34,
    height: 34,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    background: "#e8f5ff",
    color: "#004b8d",
    textDecoration: "none",
  },
  empty: { textAlign: "center", padding: 48, color: "#8a9bb0", fontSize: 14 },
};