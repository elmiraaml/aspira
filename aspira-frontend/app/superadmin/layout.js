"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SidebarSuperAdmin from "../../components/sidebarSuper";
import Navbar from "../../components/Navbar";

export default function SuperAdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const hideChrome = /^\/superadmin\/reports\/[^/]+$/.test(pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "superadmin") {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  if (!isAuthorized) return null;

  if (hideChrome) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafd", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <main style={{ flex: 1, padding: "28px 32px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 896, display: "flex", flexDirection: "column", gap: 24 }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <SidebarSuperAdmin />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Navbar />
          <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    );
  }