"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SidebarUser from "../../components/sidebarUser";
import Navbar from "../../components/Navbar";

export default function UserLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isDetailPage = /^\/user\/report\/[^/]+$/.test(pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role === "admin" || user.role === "superadmin") {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  if (!isAuthorized) return null;

  if (isDetailPage) {
    return (
      <div className="flex min-h-screen bg-[#f8fafd]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1 px-8 py-7 flex justify-center">
            <div className="w-full max-w-4xl flex flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SidebarUser />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar />
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}