"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/src/lib/api";

function PreferenceToggle({ label, hint, defaultOn }) {
  const [on, setOn] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-700">{label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${
          on ? "bg-gradient-to-r from-blue-600 to-blue-400" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
            on ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [form, setForm] = useState({
    fullname: "Loading...",
    email: "loading...",
  });
  const [tempForm, setTempForm] = useState({
    fullname: "Loading...",
    email: "loading...",
    password: "",
    confirmPassword: "",
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setAuthChecked(true);

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed.id || "");
        setForm({
          fullname: parsed.fullname || "",
          email: parsed.email || "",
        });
        setTempForm({
          fullname: parsed.fullname || "",
          email: parsed.email || "",
          password: "",
          confirmPassword: "",
        });
      } catch {
        console.log("Failed parse user");
      }
    }
    setLoading(false);
  }, [router]);

  const handleEdit = () => {
    setTempForm(form);
    setEditing(true);
    setSaveError("");
  };

  const handleCancel = () => {
    setTempForm(form);
    setEditing(false);
    setSaveError("");
  };

  const handleSave = async () => {
    if (tempForm.password && tempForm.password !== tempForm.confirmPassword) {
      setSaveError("Password tidak cocok");
      return;
    }

    setSaveError("");

    try {
      const payload = { 
        fullname: tempForm.fullname, 
        email: tempForm.email 
      };
      if (tempForm.password) {
        payload.password = tempForm.password;
      }

      const res = await api("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.message && res.message !== "Profil berhasil diperbarui") {
        setSaveError(res.message || "Failed to save");
        return;
      }

      const updated = res.user;
      const newForm = { fullname: updated.fullname, email: updated.email };
      setForm(newForm);
      setTempForm({ ...newForm, password: "", confirmPassword: "" });

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...parsed, fullname: newForm.fullname, email: newForm.email })
        );
      }

      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setSaveError("Failed to connect to server");
    }
  };

  const fields = [
    { label: "Full Name", key: "fullname", type: "text" },
    { label: "Email", key: "email", type: "email" },
    { label: "Password", key: "password", type: "password" },
    { label: "Confirm Password", key: "confirmPassword", type: "password" },
  ];

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafd]">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
   

      <div className="flex flex-col flex-1 min-w-0">
     
        <main className="flex-1 px-8 py-7">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-blue-500 font-medium">
                Account
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
            </div>

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-full border border-gray-200 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
  onClick={handleEdit}
  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white text-xs font-medium shadow-sm"
>
  Edit Profile
</button>
              )}
            </div>
          </div>

          {saved && (
            <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
              Profile saved successfully!
            </div>
          )}

          {saveError && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {saveError}
            </div>
          )}

          {/* GRID */}
          <div className="grid grid-cols-[220px_1fr] gap-5 items-stretch">

            {/* LEFT */}
            <div className="flex flex-col">

              {/* PROFILE CARD */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-20 bg-gradient-to-br from-blue-600 via-blue-400 to-indigo-400" />

                <div className="flex flex-col items-center -mt-7 pb-5 px-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xl font-semibold border-4 border-white">
                    {form.fullname?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-800">{form.fullname}</p>
                  <p className="text-xs text-gray-400">{form.email}</p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">

              {/* PERSONAL INFO */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">
                    Personal Information
                  </p>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field.label} className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-medium">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        disabled={!editing}
                        value={editing ? tempForm[field.key] ?? "" : form[field.key] ?? ""}
                        onChange={(e) =>
                          setTempForm({ ...tempForm, [field.key]: e.target.value })
                        }
                        className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none ${
                          editing
                            ? "border border-blue-300 bg-white"
                            : "bg-gray-50"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* PREFERENCES */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-medium">
                    Preferences
                  </p>
                </div>

                <div className="px-6 py-4 flex flex-col gap-4">
                  <PreferenceToggle
                    label="Email Notifications"
                    hint="Receive updates and reminders"
                    defaultOn={true}
                  />
                  <PreferenceToggle
                    label="Weekly Report"
                    hint="Receive weekly activity reports"
                    defaultOn={false}
                  />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}