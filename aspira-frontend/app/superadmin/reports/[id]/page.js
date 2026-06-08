"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

const API = "http://localhost:5000/api";

export default function SuperAdminReportDetailPage() {
  const params = useParams();
  const id = params.id;

  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

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

        setReport(data.report || data);
        setTimeline(data.timeline || []);
      } catch (err) {
        console.error("Detail Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/comments/report/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Comments Error:", err);
      }
    };

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDetail(), fetchComments()]);
      setLoading(false);
    };

    init();
  }, [id]);

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
      pending:       { bg: "bg-amber-50",   color: "text-amber-600",   label: "Pending",        icon: Clock },
      diperiksa:     { bg: "bg-blue-50",    color: "text-blue-600",    label: "Diperiksa",      icon: Activity },
      diproses:      { bg: "bg-blue-50",    color: "text-blue-600",    label: "Diproses",       icon: Activity },
      diverifikasi:  { bg: "bg-purple-50",  color: "text-purple-600",  label: "Diverifikasi",   icon: Activity },
      tindak_lanjut: { bg: "bg-sky-50",     color: "text-sky-600",     label: "Tindak Lanjut",  icon: Activity },
      selesai:       { bg: "bg-emerald-50", color: "text-emerald-600", label: "Selesai",        icon: CheckCircle },
      rejected:      { bg: "bg-red-50",     color: "text-red-600",     label: "Ditolak",        icon: AlertTriangle },
    };
    return map[status] || { bg: "bg-gray-50", color: "text-gray-600", label: status, icon: FileText };
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={42} className="text-blue-600 animate-spin" />
        </div>
      );
    }

  if (!report) {
    return (
      <div className="text-center p-16 bg-white rounded-3xl border border-blue-50 shadow-sm flex flex-col items-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Laporan tidak ditemukan</h2>
        <Link href="/superadmin/reports" className="text-blue-600 font-semibold hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const status = getStatusStyle(report.status);
  const priority = getPriorityStyle(report.priority);
  const StatusIcon = status.icon;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">

        {/* Back Button */}
        <div className="w-full flex justify-start">
          <Link href="/superadmin" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all">
            <ArrowLeft size={18} /> Kembali ke Dashboard
          </Link>
        </div>

        {/* Detail Card */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-5">
            <h1 className="m-0 text-2xl font-bold text-gray-900 leading-tight flex-1">{report.title}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                style={{ background: priority.bg, color: priority.color }}
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold"
              >
                {priority.label}
              </span>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                <StatusIcon size={14} className="mr-2" />
                {status.label}
              </span>
            </div>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-2xl mb-6 flex gap-3 items-start border border-blue-50">
            <FileText size={20} className="text-blue-600 mt-0.5" />
            <p className="m-0 leading-relaxed text-gray-700 flex-1 text-sm">{report.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <MetaItem icon={<User size={16} />}     label="Pelapor"          value={report.fullname || "-"} />
            <MetaItem icon={<FileText size={16} />}  label="Kategori"         value={report.category_name || "-"} />
            <MetaItem icon={<MapPin size={16} />}    label="Lokasi Kejadian"  value={report.location || "-"} />
            <MetaItem icon={<Calendar size={16} />}  label="Tanggal Kejadian" value={formatDate(report.incident_date)} />
            <MetaItem icon={<Clock size={16} />}     label="Dibuat Pada"      value={formatDateTime(report.created_at)} />
          </div>

          {report.image || report.bukti_foto ? (
            <div className="mt-4 pt-5 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={18} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Bukti Foto</span>
              </div>
              <img
                src={report.image || report.bukti_foto}
                alt="Bukti Foto"
                className="max-w-full max-h-[400px] object-contain rounded-2xl border border-gray-100 bg-gray-50/50 p-2"
              />
            </div>
          ) : null}
        </div>

        {/* Comments Card (read-only) */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
                      <MessageCircle size={20} className="text-blue-600" />
                      <h2 className="text-lg font-bold text-gray-900">Komentar & Diskusi</h2>
                    </div>

          {comments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {comments.map((item) => {
                const isAdmin = item.role === "admin";
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border ${
                      isAdmin
                        ? "bg-blue-50/50 border-l-4 border-l-blue-600 border-transparent"
                        : "bg-gray-50/50 border-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className={isAdmin ? "text-blue-600" : "text-gray-600"} />
                        <strong className="text-gray-900">{item.full_name}</strong>
                        {isAdmin && (
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">Admin</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{formatDateTime(item.created_at)}</span>
                    </div>
                    <p className="m-0 text-sm text-gray-700 leading-relaxed pl-6">{item.comment}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100 mb-6 flex flex-col items-center gap-3 text-gray-500">
              <MessageCircle size={28} className="text-gray-300" />
              <p className="text-sm">Belum ada komentar.</p>
            </div>
          )}
        </div>

        {/* Timeline Card */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Timeline Status</h2>
          </div>

          {timeline.length > 0 ? (
            <div className="flex flex-col">
              {timeline.map((log, index) => {
                const isLast = index === timeline.length - 1;
                const logStatus = getStatusStyle(log.new_status);
                return (
                  <div key={log.id} className={`flex gap-4 py-4 ${!isLast ? "border-b border-gray-50" : ""}`}>
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Clock size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="m-0 font-semibold text-sm text-gray-900 flex items-center flex-wrap gap-2">
                        {log.old_status ? (
                          <>
                            <span className="bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600">
                              {log.old_status}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className={`${logStatus.bg} ${logStatus.color} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
                              {log.new_status}
                            </span>
                          </>
                        ) : (
                          <span className={`${logStatus.bg} ${logStatus.color} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
                            {log.new_status}
                          </span>
                        )}
                      </p>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Oleh: <span className="font-medium text-gray-700">{log.changed_by_name || "System"}</span>
                        {log.changer_role && ` • Role: ${log.changer_role}`}
                      </p>
                      {log.notes && (
                        <p className="mt-2 text-sm text-gray-600 italic bg-gray-50 px-3 py-2 rounded-xl">
                          "{log.notes}"
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400 font-medium">{formatDateTime(log.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <Clock size={24} className="text-gray-300" />
              </div>
              <p className="text-sm">Belum ada riwayat perubahan status.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-10 h-10 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="m-0 text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="m-0 text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}