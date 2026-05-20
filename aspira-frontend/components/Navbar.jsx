"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [userName, setUserName] = useState("Pengguna");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");

      if (stored) {
        const user = JSON.parse(stored);
        setUserName(user.fullname || user.name || "Pengguna");
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
      {/* Kiri — Sapaan */}
      <div>
        <p className="text-sm text-gray-600">
          Halo, <span className="font-semibold">{userName}</span> 👋
        </p>
      </div>

      {/* Kanan — Avatar + Keluar */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
          {initial}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>

          Keluar
        </button>
      </div>
    </header>
  );
}