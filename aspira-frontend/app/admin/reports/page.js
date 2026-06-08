"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye, Trash2, Loader2 } from "lucide-react";
import { api } from "@/src/lib/api";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Track status per-row secara lokal supaya langsung update tanpa nunggu refetch
  const [localStatuses, setLocalStatuses] = useState({});

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api("/reports", { method: "GET" });
      if (Array.isArray(data)) {
        setReports(data);
        setFiltered(data);
        // Reset local statuses saat fetch ulang
        const initial = {};
        data.forEach((r) => { initial[r.id] = r.status; });
        setLocalStatuses(initial);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let temp = [...reports];
    if (search) {
      temp = temp.filter(
        (r) =>
          r.title?.toLowerCase().includes(search.toLowerCase()) ||
          r.user_name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      temp = temp.filter((r) => (localStatuses[r.id] || r.status) === statusFilter);
    }
    if (categoryFilter !== "all") {
      temp = temp.filter((r) => r.category_name === categoryFilter);
    }
    if (priorityFilter !== "all") {
      temp = temp.filter((r) => r.priority?.toLowerCase() === priorityFilter);
    }
    setFiltered(temp);
  }, [search, statusFilter, categoryFilter, priorityFilter, reports, localStatuses]);

  const updateStatus = async (id, newStatus) => {
    // Update lokal dulu supaya badge langsung berubah
    setLocalStatuses((prev) => ({ ...prev, [id]: newStatus }));
    try {
      const res = await api(`/admin/reports/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.message || !res.message.includes("berhasil")) {
        alert("Error dari server: " + JSON.stringify(res));
        // Rollback kalau gagal
        fetchReports();
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi error");
      fetchReports();
    }
  };

  const deleteReport = async (id) => {
    if (!confirm("Yakin hapus laporan ini?")) return;
    try {
      const res = await api(`/admin/reports/${id}`, { method: "DELETE" });
      if (res.message && res.message.includes("berhasil")) {
        fetchReports();
      } else {
        alert("Gagal hapus: " + JSON.stringify(res));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi error");
    }
  };

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
      pending:      { bg: "#fff7d6", color: "#b07d00", label: "Pending" },
      diproses:     { bg: "#e8f5ff", color: "#004b8d", label: "Diproses" },
      diverifikasi: { bg: "#ede9fe", color: "#6d28d9", label: "Diverifikasi" },
      tindak_lanjut:{ bg: "#e0f2fe", color: "#0369a1", label: "Tindak Lanjut" },
      selesai:      { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai" },
      rejected:     { bg: "#fde8e8", color: "#c0392b", label: "Ditolak" },
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
              <th style={styles.th}>Prioritas</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Tanggal</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((report) => {
                const currentStatus = localStatuses[report.id] || report.status;
                const priority = getPriorityStyle(report.priority);
                const status = getStatusStyle(currentStatus);
                return (
                  <tr key={report.id} style={styles.tr}>
                    <td style={styles.td}>{report.title}</td>
                    <td style={styles.td}>{report.user_name || "Masyarakat"}</td>
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
                    <td style={styles.td}>{new Date(report.created_at).toLocaleDateString("id-ID")}</td>
                    <td style={styles.td}>
                      <div style={styles.actionWrap}>
                        {/* Dropdown ini yang mengubah badge Status di atas secara sinkron */}
                        <select
                          value={currentStatus}
                          onChange={(e) => updateStatus(report.id, e.target.value)}
                          style={styles.statusSelect}
                        >
                          <option value="pending">Pending</option>
                          <option value="diproses">Diproses</option>
                          <option value="diverifikasi">Diverifikasi</option>
                          <option value="tindak_lanjut">Tindak Lanjut</option>
                          <option value="selesai">Selesai</option>
                          <option value="rejected">Ditolak</option>
                        </select>
                        <Link href={`/admin/reports/${report.id}`} style={styles.detailBtn}>
                          <Eye size={15} />
                        </Link>
                        <button onClick={() => deleteReport(report.id)} style={styles.deleteBtn}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={styles.empty}>Tidak ada laporan ditemukan.</td>
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
  actionWrap: { display: "flex", alignItems: "center", gap: 8 },
  detailBtn: {
    width: 34,
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    background: "#e8f5ff",
    color: "#004b8d",
    textDecoration: "none",
  },
  deleteBtn: {
    width: 34,
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    background: "#fde8e8",
    color: "#c0392b",
    border: "none",
    cursor: "pointer",
  },
  statusSelect: {
    padding: "7px 10px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 12,
    background: "#f8fafd",
    color: "#001f3d",
    cursor: "pointer",
  },
  empty: { textAlign: "center", padding: 48, color: "#8a9bb0", fontSize: 14 },
};