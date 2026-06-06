// ============================================================
// app/admin/reports/[id]/page.jsx
// ADMIN DETAIL + STATUS + COMMENTS
// ============================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCcw,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  Activity,
  Loader2,
  Send,
  MessageCircle,
} from "lucide-react";
import { api } from "@/src/lib/api";

const API = "http://localhost:5000/api";

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);

  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [newComment, setNewComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // ======================================================
  // FETCH REPORT DETAIL
  // ======================================================
  const fetchDetail = async () => {
    try {
      const data = await api(`/reports/${id}`);
      if (data && data.report) {
        setReport(data.report || data);
        setTimeline(data.timeline || []);
        setNewStatus(data.report.status);
      } else if (data && data.id) {
        // If the backend returns just the report directly
        setReport(data);
        setTimeline([]);
        setNewStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // FETCH COMMENTS
  // ======================================================
  const fetchComments = async () => {
    try {
      const data = await api(`/comments/report/${id}`);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch Comments Error:", error);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================
  useEffect(() => {
    const init = async () => {
      if (!id) return;

      setLoading(true);

      await Promise.all([
        fetchDetail(),
        fetchComments(),
      ]);

      setLoading(false);
    };

    init();
  }, [id]);

  // ======================================================
  // UPDATE STATUS
  // ======================================================
  const updateStatus = async () => {
    try {
      setUpdating(true);

      const res = await api(`/admin/reports/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          notes: notes || `Status diubah menjadi ${newStatus}`,
        }),
      });

      if (res.message && res.message.includes("berhasil")) {
        alert("Status berhasil diperbarui");
        setNotes("");
        await fetchDetail();
      } else {
        alert(res.message || "Gagal update status");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setUpdating(false);
    }
  };

  // ======================================================
  // ADD COMMENT
  // ======================================================
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSendingComment(true);

      const res = await api(`/comments/report/${id}`, {
        method: "POST",
        body: JSON.stringify({
          comment: newComment,
        }),
      });

      if (res.message && res.message.includes("berhasil")) {
        setNewComment("");
        fetchComments();
      } else {
        alert(res.message || "Gagal mengirim komentar");
      }
    } catch (error) {
      console.error("Add Comment Error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setSendingComment(false);
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================
  const getStatusStyle = (status) => {
    const map = {
      pending: { bg: "#fff7d6", color: "#b07d00", label: "Pending" },
      diperiksa: { bg: "#e8f5ff", color: "#004b8d", label: "Diperiksa" },
      diverifikasi: { bg: "#ede9fe", color: "#6d28d9", label: "Diverifikasi" },
      tindak_lanjut: { bg: "#e0f2fe", color: "#0369a1", label: "Tindak Lanjut" },
      selesai: { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai" },
      rejected: { bg: "#fde8e8", color: "#c0392b", label: "Ditolak" },
    };

    return map[status] || {
      bg: "#f1f1e6",
      color: "#3a5068",
      label: status,
    };
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Loader2
          size={42}
          style={{
            color: "#004b8d",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ======================================================
  // NOT FOUND
  // ======================================================
  if (!report) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <AlertTriangle size={48} color="#c0392b" />
        <p>Laporan tidak ditemukan</p>

        <Link
          href="/admin/reports"
          style={{
            color: "#004b8d",
            marginTop: 16,
            display: "inline-block",
          }}
        >
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  const status = getStatusStyle(report.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* BACK */}
      <Link href="/admin/reports" style={styles.backBtn}>
        <ArrowLeft size={18} />
        Kembali ke Daftar
      </Link>

      {/* DETAIL */}
      <div style={styles.card}>
        <h1 style={styles.title}>{report.title}</h1>

        <div
          style={{
            marginTop: 12,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              ...styles.badge,
              background: status.bg,
              color: status.color,
            }}
          >
            {status.label}
          </span>
        </div>

        <div style={styles.descBox}>
          <FileText size={18} color="#004b8d" />
          <p style={styles.desc}>{report.description}</p>
        </div>

        <div style={styles.metaGrid}>
          <MetaItem
            icon={<User size={16} />}
            label="Pelapor"
            value={report.fullname || "-"}
          />

          <MetaItem
            icon={<FileText size={16} />}
            label="Kategori"
            value={report.category_name || "-"}
          />

          <MetaItem
            icon={<MapPin size={16} />}
            label="Lokasi"
            value={report.location || "-"}
          />

          <MetaItem
            icon={<Calendar size={16} />}
            label="Tanggal Kejadian"
            value={formatDate(report.incident_date)}
          />

          <MetaItem
            icon={<Calendar size={16} />}
            label="Dibuat"
            value={formatDateTime(report.created_at)}
          />
        </div>

    {report.image || report.bukti_foto ? (
          <div style={styles.imageBox}>
            <ImageIcon size={18} color="#004b8d" />
            <img
              src={report.image || report.bukti_foto}
              alt="Bukti Foto"
              style={styles.image}
            />
          </div>
        ) : null}
          </div>

      {/* UPDATE STATUS */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Update Status</h2>

        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          style={styles.select}
        >
          <option value="pending">Pending</option>
          <option value="diproses">Diproses</option>
          <option value="diperiksa">Diperiksa</option>
          <option value="diverifikasi">Diverifikasi</option>
          <option value="tindak_lanjut">Tindak Lanjut</option>
          <option value="selesai">Selesai</option>
          <option value="rejected">Ditolak</option>
        </select>

        <textarea
          placeholder="Catatan admin (opsional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={styles.textarea}
        />

        <button
          onClick={updateStatus}
          disabled={updating}
          style={styles.updateBtn}
        >
          {updating ? (
            <RefreshCcw
              size={16}
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <CheckCircle size={16} />
          )}

          {updating ? "Memproses..." : "Update Status"}
        </button>
      </div>

      {/* COMMENTS */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Komentar & Diskusi</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {comments.length > 0 ? (
            comments.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background:
                    item.role === "admin" ? "#eef6ff" : "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <strong>
                    {item.full_name}{" "}
                    {item.role === "admin" && "(Admin)"}
                  </strong>

                  <span
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    {formatDateTime(item.created_at)}
                  </span>
                </div>

                <p style={{ margin: 0 }}>{item.comment}</p>
              </div>
            ))
          ) : (
            <p>Belum ada komentar.</p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Balas atau beri update ke user..."
            style={styles.textarea}
          />

          <button
            onClick={handleAddComment}
            disabled={sendingComment}
            style={styles.updateBtn}
          >
            {sendingComment ? (
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Send size={16} />
            )}

            {sendingComment ? "Mengirim..." : "Kirim Komentar"}
          </button>
        </div>
      </div>

      {/* TIMELINE */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Timeline Status</h2>

        {timeline.length > 0 ? (
          timeline.map((log) => (
            <div key={log.id} style={styles.timelineItem}>
              <div style={styles.timelineIcon}>
                <Clock size={16} />
              </div>

              <div style={{ flex: 1 }}>
                <p style={styles.timelineStatus}>
                  {log.old_status || "new"} → {log.new_status}
                </p>

                <p style={styles.timelineMeta}>
                  Oleh: {log.changed_by_name || "System"} •{" "}
                  {formatDateTime(log.created_at)}
                </p>

                {log.notes && (
                  <p style={styles.timelineNotes}>
                    "{log.notes}"
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Belum ada timeline.</p>
        )}
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "12px 0",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "#e8f5f f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#004b8d",
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            fontSize: 11,
            color: "#3a5068",
            margin: 0,
          }}
        >
          {label}
        </p>

        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#001f3d",
            margin: 0,
          }}
        >
          {value}
        </p>
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

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#004b8d",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    width: "fit-content",
  },

  card: {
    background: "#fff",
    padding: 28,
    borderRadius: 24,
    border: "1px solid rgba(0,75,141,0.08)",
  },

  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "#001f3d",
  },

  badge: {
    padding: "6px 14px",
    borderRadius: 40,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
  },

  descBox: {
    background: "#f8f9ff",
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },

  desc: {
    margin: 0,
    lineHeight: 1.6,
    color: "#3a5068",
    flex: 1,
  },

  imageBox: {
    marginTop: 20,
  },

  image: {
    maxWidth: "100%",
    maxHeight: 400,
    objectFit: "contain",
    borderRadius: 16,
    border: "1px solid rgba(0,75,141,0.1)",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 8,
    marginTop: 20,
    borderTop: "1px solid #f1f1e6",
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#001f3d",
    marginTop: 0,
    marginBottom: 20,
  },

  select: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    marginBottom: 14,
  },

  textarea: {
    width: "100%",
    minHeight: 100,
    padding: 12,
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    resize: "vertical",
    fontSize: 14,
    marginBottom: 14,
  },

  updateBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 24px",
    border: "none",
    borderRadius: 40,
    background: "#004b8d",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  timelineItem: {
    display: "flex",
    gap: 14,
    padding: "14px 0",
    borderBottom: "1px solid #f1f1e6",
  },

  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#e8f5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#004b8d",
    flexShrink: 0,
  },

  timelineStatus: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
    color: "#001f3d",
  },

  timelineMeta: {
    margin: "6px 0 0",
    fontSize: 12,
    color: "#3a5068",
  },

  timelineNotes: {
    margin: "8px 0 0",
    fontSize: 13,
    color: "#3a5068",
    fontStyle: "italic",
    background: "#f8f9ff",
    padding: "8px 12px",
    borderRadius: 12,
  },
};