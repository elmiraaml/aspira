  "use client";

  import { useRouter } from "next/navigation";

  const KATEGORI_MAP = {
    infrastruktur: { label: "Infrastruktur Jalan", icon: "🛣️" },
    kebersihan:    { label: "Kebersihan & Sampah", icon: "🗑️" },
    penerangan:    { label: "Penerangan Jalan",    icon: "💡" },
    banjir:        { label: "Banjir & Drainase",   icon: "🌊" },
    kebencanaan:   { label: "Kebencanaan",          icon: "⚠️" },
    keamanan:      { label: "Keamanan & Ketertiban",icon: "🔒" },
    sosial:        { label: "Masalah Sosial",       icon: "🤝" },
    kesehatan:     { label: "Kesehatan Lingkungan", icon: "🏥" },
    pendidikan:    { label: "Fasilitas Pendidikan", icon: "🏫" },
    transportasi:  { label: "Transportasi Umum",    icon: "🚌" },
    taman:         { label: "Taman & RTH",          icon: "🌳" },
    pasar:         { label: "Pasar & Ekonomi",      icon: "🏪" },
    perizinan:     { label: "Perizinan & Birokrasi",icon: "📄" },
    korupsi:       { label: "Dugaan Korupsi",       icon: "⚖️" },
    lingkungan:    { label: "Pencemaran Lingkungan",icon: "♻️" },
    hewan:         { label: "Hewan Liar & Ternak",  icon: "🐕" },
    lainnya:       { label: "Lainnya",              icon: "📋" },
  };

  const STATUS_CONFIG = {
    pending: {
      label: "Menunggu",
      dot: "bg-amber-400",
      badge: "bg-amber-50 text-amber-600 border-amber-200",
      bar: "bg-amber-400",
      progress: 10,
    },
    diperiksa: {
      label: "Diperiksa",
      dot: "bg-blue-400",
      badge: "bg-blue-50 text-blue-600 border-blue-200",
      bar: "bg-blue-400",
      progress: 30,
    },
    diverifikasi: {
      label: "Diverifikasi",
      dot: "bg-indigo-400",
      badge: "bg-indigo-50 text-indigo-600 border-indigo-200",
      bar: "bg-indigo-400",
      progress: 50,
    },
    diproses: {
      label: "Diproses",
      dot: "bg-purple-400",
      badge: "bg-purple-50 text-purple-600 border-purple-200",
      bar: "bg-purple-400",
      progress: 70,
    },
    tindak_lanjut: {
      label: "Tindak Lanjut",
      dot: "bg-pink-400",
      badge: "bg-pink-50 text-pink-600 border-pink-200",
      bar: "bg-pink-400",
      progress: 85,
    },
    selesai: {
      label: "Selesai",
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
      bar: "bg-emerald-500",
      progress: 100,
    },
    ditolak: {
      label: "Ditolak",
      dot: "bg-red-500",
      badge: "bg-red-50 text-red-600 border-red-200",
      bar: "bg-red-500",
      progress: 100,
    },
    rejected: {
      label: "Ditolak",
      dot: "bg-red-500",
      badge: "bg-red-50 text-red-600 border-red-200",
      bar: "bg-red-500",
      progress: 100,
    },
  };

  const PRIORITY_CONFIG = {
    low:    { label: "Rendah",   color: "text-emerald-600", dot: "bg-emerald-400" },
    medium: { label: "Sedang",   color: "text-amber-600",   dot: "bg-amber-400"   },
    high:   { label: "Tinggi",   color: "text-orange-600",  dot: "bg-orange-500"  },
    urgent: { label: "Mendesak", color: "text-red-600",     dot: "bg-red-500"     },
  };

  function formatTanggal(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getKategori(raw) {
    if (!raw) return { label: "Lainnya", icon: "📋" };
    const base = raw.startsWith("lainnya:") ? "lainnya" : raw;
    const custom = raw.startsWith("lainnya:") ? raw.replace("lainnya:", "") : null;
    const found = KATEGORI_MAP[base] || { label: "Lainnya", icon: "📋" };
    return { label: custom || found.label, icon: found.icon };
  }

  /**
   * PengaduanCard
   * @param {{ data: object }} props
   *
   * data shape:
   *   id, title, kategori, lokasi, createdAt (ISO string),
   *   status: "PENDING" | "IN_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "URGENT"
   *   priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
   */
  export default function PengaduanCard({ data, pengaduan }) {
    const router = useRouter();

    const item = data || pengaduan;
    if (!item) return null;

    const status   = STATUS_CONFIG[item.status]   || STATUS_CONFIG.pending;
    const priority = PRIORITY_CONFIG[item.priority?.toLowerCase()] || PRIORITY_CONFIG.low;
    const kategori = getKategori(item.category_name || item.kategori);

    return (
      <article
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/user/report/${item.id}`)}
        onKeyDown={(e) => e.key === "Enter" && router.push(`/user/report/${item.id}`)}
        className="
          group relative flex flex-col gap-0
          bg-white rounded-2xl border border-gray-100
          shadow-[0_1px_4px_rgba(0,0,0,0.06)]
          hover:shadow-[0_6px_24px_rgba(59,130,246,0.10)]
          hover:border-blue-100
          hover:-translate-y-0.5
          transition-all duration-200 ease-out
          cursor-pointer overflow-hidden select-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
        "
      >
        {/* Gambar Lampiran */}
        {(item.image || item.bukti_foto) && (
          <div className="w-full h-40 bg-gray-100 overflow-hidden shrink-0">
            <img 
              src={item.image || item.bukti_foto} 
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}

        {/* Progress bar */}
        <div className="h-[3px] w-full bg-gray-100">
          <div
            className={`h-full ${status.bar} transition-all duration-500 rounded-r-full`}
            style={{ width: `${status.progress}%` }}
          />
        </div>

        <div className="px-4 pt-4 pb-4 flex flex-col gap-3">

          {/* Top row: kategori + status */}
          <div className="flex items-center justify-between gap-2">
            {/* Kategori chip */}
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-medium text-gray-600 max-w-[60%]">
              <span className="text-sm leading-none">{kategori.icon}</span>
              <span className="truncate">{kategori.label}</span>
            </span>

            {/* Status badge */}
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border
              text-[11px] font-semibold tracking-wide whitespace-nowrap
              ${status.badge}
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} inline-block`} />
              {status.label}
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="
              text-[14px] font-semibold text-gray-800 leading-snug
              group-hover:text-blue-700
              transition-colors duration-150
              line-clamp-2
            ">
              {item.title}
            </h3>
          </div>

          {/* Meta rows */}
          <div className="flex flex-col gap-1.5">
            {/* Lokasi */}
            <div className="flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 mt-[1px] text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[12px] text-gray-500 leading-tight line-clamp-1">
                {item.location || item.lokasi || "Lokasi tidak dicantumkan"}
              </span>
            </div>

            {/* Tanggal */}
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[12px] text-gray-500">
                {formatTanggal(item.created_at || item.createdAt || item.dueDate)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Footer: priority + arrow */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} inline-block`} />
              <span className={`text-[11px] font-semibold ${priority.color}`}>
                Prioritas {priority.label}
              </span>
            </div>

            {/* View arrow */}
            <div className="
              w-7 h-7 rounded-xl flex items-center justify-center
              bg-blue-50 text-blue-400
              group-hover:bg-blue-600 group-hover:text-white
              transition-all duration-200
            ">
              <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

        </div>
      </article>
    );
  }