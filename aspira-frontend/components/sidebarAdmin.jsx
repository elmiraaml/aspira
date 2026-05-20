"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Settings,
} from "lucide-react";

export default function SidebarAdmin() {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },

    {
      href: "/admin/reports",
      label: "Manage Reports",
      icon: <FileText size={18} />,
    },

    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <aside className="w-[240px] bg-white border-r border-gray-100 min-h-screen shrink-0">
      <div className="px-6 py-5 border-b border-gray-50">
        <Link
          href="/admin"
          className="text-lg font-bold text-gray-900"
        >
          Lapor
          <span className="text-blue-600">
            In
          </span>
        </Link>
      </div>

      <nav className="px-3 py-4">
        <div className="flex flex-col gap-1">
          {links.map(
            ({ href, label, icon }) => {
              const active =
                pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <span
                    className={
                      active
                        ? "text-blue-500"
                        : "text-gray-400"
                    }
                  >
                    {icon}
                  </span>

                  {label}
                </Link>
              );
            }
          )}
        </div>
      </nav>
    </aside>
  );
}