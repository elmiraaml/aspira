// app/superadmin/audit/page.jsx
"use client";

import { useEffect, useState } from "react";
import { ClipboardList, History, UserCheck, Clock, Loader2 } from "lucide-react";
import { api } from "@/src/lib/api";

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api("/admin/audit-logs");
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <ClipboardList size={28} color="#004b8d" />
          <h1 style={styles.title}>Audit Log</h1>
        </div>
        <p style={styles.subtitle}>Riwayat perubahan status laporan oleh admin/superadmin</p>
      </div>

      {/* Stats */}
      <div style={styles.statsCard}>
        <History size={22} color="#004b8d" />
        <div>
          <p style={styles.statsLabel}>Total Perubahan Status</p>
          <h2 style={styles.statsValue}>{logs.length}</h2>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Laporan</th>
              <th style={styles.th}>Status Lama</th>
              <th style={styles.th}>Status Baru</th>
              <th style={styles.th}>Diubah Oleh</th>
              <th style={styles.th}>Catatan</th>
              <th style={styles.th}>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={styles.td}>{log.report_title || "-"}</td>
                <td style={styles.td}>
                  {log.old_status ? (
                    <span style={{ ...styles.statusBadge, background: "#f1f1e6", color: "#3a5068" }}>{log.old_status}</span>
                  ) : "-"}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, background: "#e8f5ff", color: "#004b8d" }}>{log.new_status}</span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <UserCheck size={14} color="#3a5068" />
                    {log.changed_by_name} ({log.changer_role})
                  </div>
                </td>
                <td style={styles.td}>{log.notes || "-"}</td>
                <td style={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={14} color="#8a9bb0" />
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div style={styles.empty}>Belum ada audit log.</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loadingWrap: { minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: 800, color: "#001f3d", margin: 0 },
  subtitle: { color: "#3a5068", fontSize: 14, marginTop: 4 },
  statsCard: { background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1px solid rgba(0,75,141,0.08)", display: "flex", alignItems: "center", gap: 14 },
  statsLabel: { fontSize: 12, color: "#3a5068", margin: 0 },
  statsValue: { fontSize: 24, fontWeight: 800, color: "#001f3d", margin: 0 },
  tableWrap: { background: "#fff", borderRadius: 20, overflow: "auto", border: "1px solid rgba(0,75,141,0.08)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 800 },
  th: { textAlign: "left", padding: 16, background: "#f8f9ff", fontSize: 13, fontWeight: 600, color: "#001f3d" },
  td: { padding: 16, borderTop: "1px solid #f1f1e6", fontSize: 14, color: "#001f3d" },
  statusBadge: { padding: "4px 10px", borderRadius: 40, fontSize: 12, fontWeight: 600, display: "inline-block" },
  empty: { padding: 48, textAlign: "center", color: "#3a5068" },
};