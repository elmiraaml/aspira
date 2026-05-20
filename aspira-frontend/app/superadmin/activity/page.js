// ============================================================
// app/superadmin/activity/page.jsx
// Activity Log
// ============================================================
"use client";

import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";

export default function SuperAdminActivityPage() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await api("/admin/activity-logs");
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={titleStyle}>Activity Log</h1>
        <p style={subtitleStyle}>
          Aktivitas seluruh admin di sistem
        </p>
      </div>

      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={thStyle}>Admin</th>
              <th style={thStyle}>Aksi</th>
              <th style={thStyle}>Deskripsi</th>
              <th style={thStyle}>Tanggal</th>
            </tr>
          </thead>

          <tbody>
            {activities.length > 0 ? activities.map((activity) => (
              <tr key={activity.id}>
                <td style={tdStyle}>{activity.admin_name || "-"}</td>
                <td style={tdStyle}>{activity.action}</td>
                <td style={tdStyle}>{activity.description || "-"}</td>
                <td style={tdStyle}>
                  {new Date(activity.created_at).toLocaleString("id-ID")}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#8a9bb0" }}>Belum ada activity log.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const titleStyle = {
  fontSize: 28,
  fontWeight: 800,
  color: "#001f3d",
};

const subtitleStyle = {
  color: "#64748b",
};

const tableWrap = {
  background: "#fff",
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid #e2e8f0",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
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
  fontSize: 14,
};