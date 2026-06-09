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
    href: "/admin/profile",
    label: "Profile",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  ];

  return (
    <aside className="w-[240px] bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0">
      <div className="px-6 py-5 border-b border-gray-50">
        <Link href="/admin
        
        " className="text-lg font-bold text-blue-600">
          Aspira
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