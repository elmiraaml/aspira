"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebarUser";
import Navbar from "@/components/Navbar";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [modal, setModal] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const closeModal = () => {
    setModal({ ...modal, show: false });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setModal({
        show: true,
        message: "Semua field wajib diisi!",
        type: "error",
      });
    }

    if (newPassword.length < 1) {
      return setModal({
        show: true,
        message: "Harus diisi",
        type: "error",
      });
    }

    if (newPassword !== confirmPassword) {
      return setModal({
        show: true,
        message: "New password dan confirm password tidak sama!",
        type: "error",
      });
    }

    setModal({
      show: true,
      message: "Password berhasil diganti!",
      type: "success",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafd] relative">
      <Sidebar tasks={[]} />

      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />

        <main className="flex-1 px-8 py-7">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-blue-500 font-medium mb-1">
              Settings
            </p>
            <h2 className="text-2xl font-semibold text-gray-900">
              Change Password
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[340px] text-center">
            <p
              className={`text-lg font-semibold mb-5 ${
                modal.type === "success"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {modal.message}
            </p>

            <button
              onClick={closeModal}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}