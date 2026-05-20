"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarUser() {
  const pathname = usePathname();

 const links = [
  {
    href: "/user",
    label: "Dashboard",
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
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
        />
      </svg>
    ),
  },

  {
    href: "/user/create-report",
    label: "Create Report",
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
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },

  {
    href: "/user/active-cases",
    label: "My Reports",
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },

  {
    href: "/user/history",
    label: "History",
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },

  {
    href: "/user/profile",
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
    <aside className="w-[240px] bg-white border-r border-gray-100 min-h-screen shrink-0">
      <div className="px-6 py-5 border-b border-gray-50">
        <Link href="/user" className="text-lg font-bold text-gray-900">
          Lapor<span className="text-blue-600">In</span>
        </Link>
      </div>

      <nav className="px-3 py-4">
        <div className="flex flex-col gap-1">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href;

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
                    active ? "text-blue-500" : "text-gray-400"
                  }
                >
                  {icon}
                </span>

                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}