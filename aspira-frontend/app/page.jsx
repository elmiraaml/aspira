"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RieLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Baru");
  const router = useRouter();

  const stats = [
    { num: "12.540+", label: "Pengaduan Diterima" },
    { num: "98%", label: "Terselesaikan" },
    { num: "24/7", label: "Layanan Aktif" },
    { num: "34", label: "Provinsi" },
  ];

  const steps = [
    { num: "01", title: "Registrasi", desc: "Daftarkan diri dengan data yang valid." },
    { num: "02", title: "Buat Pengaduan", desc: "Isi formulir dan lampirkan bukti pendukung." },
    { num: "03", title: "Verifikasi", desc: "Laporan diverifikasi dalam 3 hari kerja." },
    { num: "04", title: "Tindak Lanjut", desc: "Instansi merespons dalam 5 hari kerja." },
    { num: "05", title: "Selesai", desc: "Pengaduan ditindaklanjuti hingga tuntas." },
  ];

  const services = [
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Pengaduan Online",
      desc: "Sampaikan pengaduan tanpa perlu datang ke kantor.",
      tag: "Populer",
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Cek Status",
      desc: "Pantau status pengaduan Anda secara real-time.",
      tag: null,
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Konsultasi Online",
      desc: "Chat langsung dengan petugas yang berpengalaman.",
      tag: null,
    },
    {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Laporan Berkala",
      desc: "Terima notifikasi dan laporan perkembangan berkala.",
      tag: null,
    },
  ];

  const mockReports = [
    { id: "#2024-001", title: "Pelayanan tidak profesional", status: "Selesai", date: "12 Jan 2024", color: "#22c55e" },
    { id: "#2024-002", title: "Keterlambatan respons", status: "Proses", date: "18 Jan 2024", color: "#f59e0b" },
    { id: "#2024-003", title: "Penyalahgunaan wewenang", status: "Baru", date: "24 Jan 2024", color: "#3b82f6" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", background: "#f8faff", minHeight: "100vh", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nav-link {
          color: #374151;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          position: relative;
          padding-bottom: 2px;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #2563eb; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1.5px;
          background: #2563eb;
          transition: width 0.25s;
        }
        .nav-link:hover::after { width: 100%; }

        .btn-primary {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }

        .btn-ghost {
          background: #fff;
          color: #374151;
          border: 1.5px solid #e5e7eb;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .btn-ghost:hover { border-color: #2563eb; color: #2563eb; }

        .card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e8edf5;
          padding: 24px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .card:hover { box-shadow: 0 8px 30px rgba(37,99,235,0.08); transform: translateY(-2px); }

        .tag {
          display: inline-block;
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.01em;
        }

        .step-num {
          font-family: 'DM Serif Display', serif;
          font-size: 40px;
          color: #dbeafe;
          line-height: 1;
        }
        .step-card:hover .step-num { color: #bfdbfe; }

        .icon-box {
          width: 44px; height: 44px;
          border-radius: 11px;
          background: #eff6ff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          display: inline-block; margin-right: 6px;
        }

        .stat-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e8edf5;
          padding: 24px 28px;
          text-align: center;
        }

        .section-label {
          font-size: 12px;
          font-weight: 600;
          color: #2563eb;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .section-title {
          font-family: 'DM Serif Display', serif;
          font-size: 34px;
          color: #111827;
          line-height: 1.2;
        }

        input, textarea {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13.5px;
          font-family: inherit;
          color: #111827;
          outline: none;
          transition: border-color 0.2s;
          background: #fff;
        }
        input:focus, textarea:focus { border-color: #2563eb; }
        textarea { resize: none; }

        label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .footer-link { color: #9ca3af; font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: #fff; }

        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .desktop-buttons { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(248,250,255,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8edf5",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>Rie</div>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, marginTop: -1 }}>Layanan Pengaduan Online</div>
            </div>
          </div>

          <div className="desktop-menu" style={{ display: "flex", gap: 28 }}>
            {["Beranda", "Layanan", "Kontak"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="nav-link">{item}</a>
            ))}
          </div>

           <div className="desktop-buttons" style={{ display: "flex", gap: 10 }}>
      <button
        className="btn-ghost"
        onClick={() => router.push("/login")}
      >
        Login
      </button>

      <button
        className="btn-primary"
        onClick={() => router.push("/user/register")}
      >
        Register
      </button>
    </div>  
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 100, paddingBottom: 80, padding: "100px 24px 80px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          
          {/* LEFT */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, background: "#2563eb", borderRadius: "50%", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>Sistem Pengaduan Masyarakat</span>
            </div>

            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, lineHeight: 1.1, color: "#111827", marginBottom: 20 }}>
              Suara Anda,<br />
              <span style={{ color: "#2563eb" }}>Didengar.</span>
            </h1>

            <p style={{ fontSize: 15.5, color: "#6b7280", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              Sampaikan laporan Anda langsung kepada instansi pemerintah berwenang secara <strong style={{ color: "#374151" }}>mudah</strong>, <strong style={{ color: "#374151" }}>cepat</strong>, dan <strong style={{ color: "#374151" }}>aman</strong>.
            </p>

            <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
              <button className="btn-primary" style={{ padding: "12px 26px", fontSize: 14 }}>
                Buat Pengaduan
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button className="btn-ghost" style={{ padding: "12px 26px", fontSize: 14 }}>Pelajari Lebih</button>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["✅ Terverifikasi Resmi", "🔒 Data Aman & Rahasia", "⚡ Respons 1×24 Jam"].map(t => (
                <span key={t} style={{ fontSize: 12.5, color: "#6b7280", fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — UI MOCKUP */}
          <div style={{ position: "relative" }}>
            <div style={{
              background: "#fff",
              borderRadius: 18,
              border: "1px solid #e8edf5",
              boxShadow: "0 20px 60px rgba(37,99,235,0.1)",
              padding: 24,
            }}>
              {/* Header mockup */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Dashboard Pengaduan</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Baru", "Proses", "Selesai"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                      background: activeTab === tab ? "#2563eb" : "#f3f4f6",
                      color: activeTab === tab ? "#fff" : "#6b7280",
                      transition: "all 0.2s",
                    }}>{tab}</button>
                  ))}
                </div>
              </div>

              {/* Report items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mockReports.map(r => (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "#f8faff", borderRadius: 10, padding: "12px 14px",
                    border: "1px solid #e8edf5",
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: r.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={r.color} strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{r.title}</div>
                      <div style={{ fontSize: 11.5, color: "#9ca3af" }}>{r.id} · {r.date}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: 11.5, fontWeight: 600, color: r.color }}>
                      <span className="status-dot" style={{ background: r.color }} />
                      {r.status}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 18, padding: "14px 0 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 8 }}>
                  <span>Tingkat Penyelesaian</span>
                  <span style={{ color: "#2563eb", fontWeight: 700 }}>98%</span>
                </div>
                <div style={{ background: "#e8edf5", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: "98%", height: "100%", background: "linear-gradient(90deg, #2563eb, #60a5fa)", borderRadius: 4 }} />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: "absolute", bottom: -16, left: -16,
              background: "#fff", border: "1px solid #e8edf5",
              borderRadius: 12, padding: "10px 16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 32, height: 32, background: "#dcfce7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 16 }}>✅</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Pengaduan Terverifikasi</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Diproses dalam 24 jam</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#fff", borderTop: "1px solid #e8edf5", borderBottom: "1px solid #e8edf5", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "#2563eb", marginBottom: 6 }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "88px 24px", background: "#f8faff" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-label">Cara Kerja</div>
            <h2 className="section-title">Cara Membuat Pengaduan</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {steps.map((step, i) => (
              <div key={i} className="card step-card" style={{ padding: "28px 20px", position: "relative" }}>
                <div className="step-num">{step.num}</div>
                <div style={{ marginTop: 8, marginBottom: 6, fontSize: 14, fontWeight: 700, color: "#111827" }}>{step.title}</div>
                <p style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.6 }}>{step.desc}</p>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 36, right: -9, color: "#cbd5e1", fontSize: 18, fontWeight: 300 }}>→</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button className="btn-primary" style={{ padding: "12px 28px" }}>Mulai Buat Pengaduan</button>
          </div>
        </div>
      </section>

      {/* LAYANAN */}
      <section id="layanan" style={{ padding: "88px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-label">Fitur</div>
            <h2 className="section-title">Layanan Kami</h2>
            <p style={{ color: "#6b7280", fontSize: 14.5, marginTop: 12 }}>Berbagai layanan untuk memudahkan penyampaian pengaduan masyarakat</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {services.map(s => (
              <div key={s.title} className="card" style={{ padding: "28px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div className="icon-box">{s.icon}</div>
                  {s.tag && <span className="tag">{s.tag}</span>}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 24px", background: "#1e3a8a" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 38, color: "#fff", marginBottom: 14 }}>
            Sampaikan Pengaduan Anda Sekarang
          </h2>
          <p style={{ color: "#93c5fd", fontSize: 14.5, marginBottom: 32, lineHeight: 1.7 }}>
            Bantu kami meningkatkan kualitas pelayanan. Setiap laporan akan ditindaklanjuti dengan serius.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button style={{ background: "#fff", color: "#1e3a8a", border: "none", padding: "13px 28px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Buat Pengaduan
            </button>
            <button style={{ background: "transparent", color: "#93c5fd", border: "1.5px solid #3b82f6", padding: "13px 28px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Cek Status
            </button>
          </div>
        </div>
      </section>

      {/* KONTAK */}
      <section id="kontak" style={{ padding: "88px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-label">Kontak</div>
            <h2 className="section-title">Hubungi Kami</h2>
            <p style={{ color: "#6b7280", fontSize: 14.5, marginTop: 10 }}>Ada pertanyaan? Tim kami siap membantu Anda</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                {[
                  { icon: "📍", label: "Alamat", val: "Jl. Treasure" },
                  { icon: "✉️", label: "Telegram", val: "@Rie" },
                  { icon: "🕐", label: "Jam Operasional", val: "Senin–Jumat, 08.00–17.00 WIB" },
                ].map(c => (
                  <div key={c.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, background: "#eff6ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 2 }}>{c.label}</div>
                      <div style={{ fontSize: 13.5, color: "#6b7280" }}>{c.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#f8faff", borderRadius: 14, border: "1px solid #e8edf5", height: 180, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 36 }}>🗺️</span>
                <span style={{ fontSize: 12.5, color: "#9ca3af", fontWeight: 500 }}>Peta Lokasi</span>
              </div>
            </div>

            <div style={{ background: "#f8faff", borderRadius: 18, border: "1px solid #e8edf5", padding: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 22 }}>Kirim Kritik & Saran</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label>Nama Lengkap</label>
                  <input type="text" placeholder="Masukkan nama lengkap" />
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" placeholder="nama@email.com" />
                </div>
                <div>
                  <label>Nomor Telepon</label>
                  <input type="tel" placeholder="+62..." />
                </div>
                <div>
                  <label>Kritik & Saran</label>
                  <textarea rows={4} placeholder="Tuliskan kritik dan saran Anda..." />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
                  <input type="checkbox" style={{ width: 16, height: 16, accentColor: "#2563eb" }} />
                  <span style={{ fontSize: 13, color: "#374151" }}>I'm not a robot</span>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>reCAPTCHA</div>
                    <div style={{ fontSize: 9.5, color: "#d1d5db" }}>Privacy · Terms</div>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 14 }}>
                  Kirim Kritik & Saran
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111827", padding: "60px 24px 28px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Rie</div>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 260 }}>Layanan Pengaduan Masyarakat yang terpercaya dan profesional.</p>
            </div>

            {[
              { title: "Navigasi", items: ["Beranda", "Layanan", "Kontak"] },
              { title: "Layanan", items: ["Buat Pengaduan", "Cek Status", "Kebijakan Privasi", "Syarat & Ketentuan"] },
              { title: "Kontak", items: ["+62123456789", "rie@email.com", "Jl. Treasure"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {col.items.map(item => (
                    <a key={item} href="#" className="footer-link">{item}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #1f2937", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12.5, color: "#4b5563" }}>© 2024 Rie. Hak Cipta Dilindungi.</span>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="#" className="footer-link">Kebijakan Privasi</a>
              <a href="#" className="footer-link">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}