// app/superadmin/users/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Trash2, Search, Loader2 } from "lucide-react";
import { api } from "@/src/lib/api";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await api("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      console.error("Delete User Error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.fullname || user.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium mb-0.5">
          Manajemen
        </p>
        <h3 className="text-lg text-gray-800 font-semibold">User</h3>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <Search size={18} color="#8a9bb0" />
        <input
          type="text"
          placeholder="Cari user berdasarkan nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none outline-none w-full text-sm text-gray-700 bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Nama", "Email", "Role", "Tanggal Daftar", "Aksi"].map((h) => (
                <th key={h} className="text-left px-5 py-4 text-[11px] uppercase tracking-[0.06em] font-bold text-gray-400 bg-gray-50 border-b border-gray-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-gray-50">
                <td className="px-5 py-4 text-sm text-gray-800 border-t border-gray-50">{user.fullname || user.full_name || "-"}</td>
                <td className="px-5 py-4 text-sm text-gray-800 border-t border-gray-50">{user.email}</td>
                <td className="px-5 py-4 border-t border-gray-50">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-800 border-t border-gray-50">
                  {new Date(user.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-5 py-4 border-t border-gray-50">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  Belum ada user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}