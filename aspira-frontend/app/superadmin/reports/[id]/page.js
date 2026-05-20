// app/superadmin/reports/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Image as ImageIcon,
  Clock,
  Activity,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";

const API = "http://localhost:5000/api";

export default function SuperAdminReportDetailPage() {
  const params = useParams();
  const id = params.id;

  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        // if (!token) {
        //   window.location.href = "/login";
        //   return;
        // }

        const res = await fetch(`${API}/reports/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Detail Error:", text);
          return;
        }

        const data = await res.json();

        setReport(data.report);
        setTimeline(data.timeline || []);
      } catch (err) {
        console.error("Detail Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const getStatusStyle = (status) => {
    const map = {
      pending: { bg: "#fff7d6", color: "#b07d00", label: "Menunggu", icon: Clock },
      diproses: { bg: "#e8f5ff", color: "#004b8d", label: "Diproses", icon: Activity },
      investigasi: { bg: "#e8f5ff", color: "#004b8d", label: "Investigasi", icon: Activity },
      ditindak: { bg: "#e8f5ff", color: "#004b8d", label: "Ditindak", icon: Activity },
      selesai: { bg: "#e6f9f4", color: "#0a7c5c", label: "Selesai", icon: CheckCircle },
      ditolak: { bg: "#fde8e8", color: "#c0392b", label: "Ditolak", icon: AlertTriangle },
      rejected: { bg: "#fde8e8", color: "#c0392b", label: "Ditolak", icon: AlertTriangle },
    };
    return map[status] || { bg: "#f1f1e6", color: "#3a5068", label: status, icon: FileText };
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

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Loader2 size={42} style={{ color: "#004b8d", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={styles.notFound}>
        <AlertTriangle size={48} color="#c0392b" />
        <h2 style={styles.notFoundTitle}>Laporan tidak ditemukan</h2>
        <Link href="/superadmin/reports" style={styles.backLink}>Kembali ke daftar</Link>
      </div>
    );
  }

  const status = getStatusStyle(report.status);
  const StatusIcon = status.icon;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Back Button */}
      <Link href="/superadmin/reports" style={styles.backBtn}>
        <ArrowLeft size={18} />
        Kembali ke Daftar
      </Link>

      {/* Detail Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>{report.title}</h1>
          <span style={{ ...styles.badge, background: status.bg, color: status.color }}>
            <StatusIcon size={12} style={{ marginRight: 6 }} />
            {status.label}
          </span>
        </div>

        <div style={styles.descBox}>
          <FileText size={18} color="#004b8d" />
          <p style={styles.desc}>{report.description}</p>
        </div>

        <div style={styles.metaGrid}>
          <MetaItem icon={<User size={16} />} label="Pelapor" value={report.reporter_name || "-"} />
          <MetaItem icon={<Mail size={16} />} label="Email" value={report.reporter_email || "-"} />
          <MetaItem icon={<Phone size={16} />} label="Telepon" value={report.reporter_phone || "-"} />
          <MetaItem icon={<FileText size={16} />} label="Kategori" value={report.category_name || "-"} />
          <MetaItem icon={<MapPin size={16} />} label="Lokasi Kejadian" value={report.incident_location || "-"} />
          <MetaItem icon={<Calendar size={16} />} label="Tanggal Kejadian" value={formatDate(report.incident_date)} />
          <MetaItem icon={<Clock size={16} />} label="Dibuat Pada" value={formatDateTime(report.created_at)} />
        </div>

        {report.bukti_foto && (
          <div style={styles.imageBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <ImageIcon size={18} color="#004b8d" />
              <span style={styles.imageLabel}>Bukti Foto</span>
            </div>
            <img src={report.bukti_foto} alt="Bukti" style={styles.image} />
          </div>
        )}
      </div>

      {/* Timeline Card */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Activity size={22} color="#004b8d" />
          <h2 style={styles.sectionTitle}>Timeline Status</h2>
        </div>

        {timeline.length > 0 ? (
          <div style={styles.timelineList}>
            {timeline.map((log, index) => {
              const isLast = index === timeline.length - 1;
              const logStatus = getStatusStyle(log.new_status);
              return (
                <div key={log.id} style={{ ...styles.timelineItem, borderBottom: isLast ? "none" : "1px solid #f1f1e6" }}>
                  <div style={styles.timelineIcon}>
                    <Clock size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.timelineStatus}>
                      {log.old_status ? (
                        <>
                          <span style={styles.statusOld}>{log.old_status}</span>
                          <span style={styles.arrowIcon}> → </span>
                          <span style={{ ...styles.statusNew, background: logStatus.bg, color: logStatus.color }}>
                            {log.new_status}
                          </span>
                        </>
                      ) : (
                        <span style={{ ...styles.statusNew, background: logStatus.bg, color: logStatus.color }}>
                          {log.new_status}
                        </span>
                      )}
                    </p>
                    <p style={styles.timelineMeta}>
                      Oleh: {log.changed_by_name || "System"}
                      {log.changer_role && ` • Role: ${log.changer_role}`}
                    </p>
                    {log.notes && <p style={styles.timelineNotes}>"{log.notes}"</p>}
                    <p style={styles.timelineDate}>{formatDateTime(log.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyTimeline}>
            <Clock size={32} color="#c8d6e5" />
            <p>Belum ada timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div style={styles.metaItem}>
      <div style={styles.metaIcon}>{icon}</div>
      <div>
        <p style={styles.metaLabel}>{label}</p>
        <p style={styles.metaValue}>{value}</p>
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
  notFound: {
    textAlign: "center",
    padding: 60,
    background: "#fff",
    borderRadius: 20,
    border: "1px solid rgba(0,75,141,0.08)",
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#001f3d",
    marginTop: 16,
    marginBottom: 16,
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
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: "gap 0.2s",
  },
  backLink: {
    color: "#004b8d",
    textDecoration: "none",
    marginTop: 16,
    display: "inline-block",
    fontWeight: 600,
  },
  card: {
    background: "#fff",
    padding: 28,
    borderRadius: 24,
    border: "1px solid rgba(0,75,141,0.08)",
    boxShadow: "0 4px 20px rgba(0,75,141,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "#001f3d",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 14px",
    borderRadius: 40,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  descBox: {
    background: "#f8f9ff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    border: "1px solid rgba(0,75,141,0.06)",
  },
  desc: {
    margin: 0,
    lineHeight: 1.6,
    color: "#3a5068",
    flex: 1,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 8,
    marginBottom: 24,
  },
  metaItem: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "10px 0",
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "#e8f5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#004b8d",
  },
  metaLabel: {
    fontSize: 11,
    color: "#3a5068",
    margin: 0,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#001f3d",
    margin: 0,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  imageBox: {
    marginTop: 8,
    paddingTop: 16,
    borderTop: "1px solid #f1f1e6",
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#001f3d",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  image: {
    maxWidth: "100%",
    maxHeight: 400,
    objectFit: "contain",
    borderRadius: 16,
    border: "1px solid rgba(0,75,141,0.1)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#001f3d",
    margin: 0,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  timelineList: {
    display: "flex",
    flexDirection: "column",
  },
  timelineItem: {
    display: "flex",
    gap: 14,
    padding: "16px 0",
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
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  statusOld: {
    background: "#f1f1e6",
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  arrowIcon: {
    color: "#3a5068",
  },
  statusNew: {
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  timelineMeta: {
    margin: "6px 0 0",
    fontSize: 12,
    color: "#3a5068",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  timelineNotes: {
    margin: "8px 0 0",
    fontSize: 13,
    color: "#3a5068",
    fontStyle: "italic",
    background: "#f8f9ff",
    padding: "8px 12px",
    borderRadius: 12,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  timelineDate: {
    margin: "6px 0 0",
    fontSize: 11,
    color: "#8a9bb0",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  emptyTimeline: {
    textAlign: "center",
    padding: 48,
    color: "#3a5068",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
};