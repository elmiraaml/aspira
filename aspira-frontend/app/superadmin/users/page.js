// app/superadmin/users/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Trash2, Search, Users, Loader2, UserCheck } from "lucide-react";
import { api } from "@/src/lib/api";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await api("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await api(`/admin/users/${id}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (err) {
      console.error("Delete User Error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.fullname || user.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

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
          <Users size={28} color="#004b8d" />
          <h1 style={styles.title}>Manajemen User</h1>
        </div>
        <p style={styles.subtitle}>Manage all user accounts</p>
      </div>

      {/* Stats */}
      <div style={styles.statsCard}>
        <UserCheck size={22} color="#004b8d" />
        <div>
          <p style={styles.statsLabel}>Total User Terdaftar</p>
          <h2 style={styles.statsValue}>{users.length}</h2>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchBox}>
        <Search size={18} color="#8a9bb0" />
        <input
          type="text"
          placeholder="Cari user berdasarkan nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Tanggal Daftar</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id}>
                <td style={styles.td}>{user.fullname || user.full_name || "-"}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={{ background: "#e8f5ff", color: "#004b8d", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>{new Date(user.created_at).toLocaleDateString("id-ID")}</td>
                <td style={styles.td}>
                  <button onClick={() => deleteUser(user.id)} style={styles.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#8a9bb0" }}>Belum ada user.</td></tr>
            )}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div style={styles.empty}>Tidak ada user ditemukan.</div>
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
  searchBox: { display: "flex", alignItems: "center", gap: 10, background: "#fff", padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(0,75,141,0.08)" },
  searchInput: { border: "none", outline: "none", width: "100%", fontSize: 14, fontFamily: "'Inter', system-ui" },
  tableWrap: { background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,75,141,0.08)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 16, background: "#f8f9ff", fontSize: 13, fontWeight: 600, color: "#001f3d" },
  td: { padding: 16, borderTop: "1px solid #f1f1e6", fontSize: 14, color: "#001f3d" },
  deleteBtn: { border: "none", background: "#fde8e8", color: "#c0392b", padding: 8, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" },
  empty: { padding: 48, textAlign: "center", color: "#3a5068" },
};