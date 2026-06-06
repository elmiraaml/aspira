"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye, RefreshCcw, AlertTriangle, CheckCircle, Clock, Loader2, Trash2 } from "lucide-react";
import { api } from "@/src/lib/api";

const API = "http://localhost:5000/api";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api("/reports", { method: "GET" });
      if (Array.isArray(data)) {
        setReports(data);
        setFiltered(data);
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
      temp = temp.filter((r) => r.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      temp = temp.filter((r) => r.category_name === categoryFilter);
    }
    setFiltered(temp);
  }, [search, statusFilter, categoryFilter, reports]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await api(`/admin/reports/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.message && res.message.includes("berhasil")) {
        alert("Status berhasil diupdate");
        fetchReports();
      } else {
        alert("Error dari server: " + JSON.stringify(res));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi error");
    }
  };

  const deleteReport = async (id) => {
    if (!confirm("Yakin hapus laporan ini?")) return;
    try {
      const res = await api(`/reports/${id}`, { method: "DELETE" });
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
      pending: { bg: "#fff7d6", color: "#b07d00", label: "Pending" },
      diproses: { bg: "#e8f5ff", color: "#004b8d", label: "Diproses" },
      diverifikasi: { bg: "#ede9fe", color: "#6d28d9", label: "Diverifikasi" },
      tindak_lanjut: { bg: "#e0f2fe", color: "#0369a1", label: "Tindak Lanjut" },
      selesai: { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai" },
      rejected: { bg: "#fde8e8", color: "#c0392b", label: "Ditolak" },
    };
    return map[status] || { bg: "#f1f1e6", color: "#3a5068", label: status };
  };

  const categories = [...new Set(reports.map((r) => r.category_name).filter(Boolean))];

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

      {/* Filters */}
      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={18} color="#8a9bb0" />
          <input type="text" placeholder="Cari judul atau pelapor..." value={search} onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="diproses">Diproses</option>
          <option value="diverifikasi">Diverifikasi</option>
          <option value="tindak_lanjut">Tindak Lanjut</option>
          <option value="selesai">Selesai</option>
          <option value="rejected">Ditolak</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={styles.select}>
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={fetchReports} style={styles.refreshBtn}>
          <RefreshCcw size={16} />
        </button>
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
                const priority = getPriorityStyle(report.priority);
                const status = getStatusStyle(report.status);
                return (
                  <tr key={report.id}>
                    <td style={styles.td}>{report.title}</td>
                    <td style={styles.td}>{report.user_name || "Masyarakat"}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: priority.bg, color: priority.color }}>{priority.label}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: status.bg, color: status.color }}>{status.label}</span>
                    </td>
                    <td style={styles.td}>{new Date(report.created_at).toLocaleDateString("id-ID")}</td>
                    <td style={styles.td}>
                      <div style={styles.actionWrap}>
                        <select value={report.status} onChange={(e) => updateStatus(report.id, e.target.value)} style={styles.statusSelect}>
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
  hero: { background: "linear-gradient(135deg, #001f3d, #004b8d, #43acff)", borderRadius: 24, padding: 28, color: "#fff" },
  heroTitle: { margin: 0, fontSize: 28, fontWeight: 800 },
  heroDesc: { marginTop: 10, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" },
  filterCard: { display: "flex", gap: 12, background: "#fff", padding: 18, borderRadius: 18, border: "1px solid rgba(0,75,141,0.08)" },
  searchBox: { flex: 1, display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 12, padding: "0 12px" },
  searchInput: { flex: 1, border: "none", outline: "none", padding: 12, fontSize: 14, fontFamily: "'Inter', system-ui" },
  select: { border: "1px solid #e2e8f0", borderRadius: 12, padding: "0 12px", fontSize: 14 },
  refreshBtn: { border: "none", borderRadius: 12, padding: "0 20px", background: "#004b8d", color: "#fff", cursor: "pointer" },
  tableWrap: { background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,75,141,0.08)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 16, background: "#f8f9ff", fontSize: 13, fontWeight: 600, color: "#001f3d" },
  td: { padding: 16, borderTop: "1px solid #f1f1e6", fontSize: 14, color: "#001f3d" },
  badge: { padding: "5px 12px", borderRadius: 40, fontSize: 12, fontWeight: 600 },
  actionWrap: { display: "flex", alignItems: "center", gap: 8 },
  detailBtn: { width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#e8f5ff", color: "#004b8d", textDecoration: "none" },
  deleteBtn: { width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#fde8e8", color: "#c0392b", border: "none", cursor: "pointer" },
  statusSelect: { padding: "8px 10px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 },
  empty: { textAlign: "center", padding: 48, color: "#3a5068" },
};