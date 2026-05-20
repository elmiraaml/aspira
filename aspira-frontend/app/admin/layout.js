"use client";

import SidebarAdmin from "../../components/sidebarAdmin";
import Navbar from "../../components/Navbar";

export default function AdminLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily:
          "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main
          style={{
            flex: 1,
            padding: 24,
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}