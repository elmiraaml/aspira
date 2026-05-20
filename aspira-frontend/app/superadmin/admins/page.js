"use client";

import { useEffect, useState } from "react";
import { Trash2, Shield, Plus } from "lucide-react";
import { api } from "@/src/lib/api";

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const fetchAdmins = async () => {
    try {
      const data = await api("/admin/admins");
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    try {
      await api("/admin/admins", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm({
        full_name: "",
        email: "",
        password: "",
      });

      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAdmin = async (id) => {
    if (!confirm("Hapus admin ini?")) return;

    try {
      await api(`/admin/admins/${id}`, {
        method: "DELETE",
      });

      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#001f3d" }}>
          Manajemen Admin
        </h1>
        <p style={{ color: "#64748b" }}>
          Add and manage admin accounts
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        <input
          placeholder="Nama"
          value={form.full_name}
          onChange={(e) =>
            setForm({ ...form, full_name: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          style={inputStyle}
        />

        <button onClick={createAdmin} style={{...createBtn, gridColumn: "span 3"}}>
          <Plus size={16} /> Tambah Admin
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={thStyle}>Nama</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Tanggal Dibuat</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {admins.length > 0 ? admins.map((admin) => (
              <tr key={admin.id}>
                <td style={tdStyle}>{admin.full_name || "-"}</td>
                <td style={tdStyle}>{admin.email}</td>
                <td style={tdStyle}>
                  <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {admin.role}
                  </span>
                </td>
                <td style={tdStyle}>
                  {new Date(admin.created_at).toLocaleDateString("id-ID")}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => deleteAdmin(admin.id)}
                    style={deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#8a9bb0" }}>Belum ada admin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 14,
};

const createBtn = {
  padding: 14,
  border: "none",
  borderRadius: 12,
  background: "#004b8d",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const thStyle = {
  textAlign: "left",
  padding: 16,
  fontSize: 13,
  color: "#475569",
};

const tdStyle = {
  padding: 16,
  borderTop: "1px solid #f1f5f9",
};

const deleteBtn = {
  border: "none",
  background: "#fef2f2",
  color: "#dc2626",
  padding: 8,
  borderRadius: 10,
  cursor: "pointer",
};